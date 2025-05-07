#!/usr/bin/env python3
import irc.bot
import irc.strings
import requests
import os
import sys
import time
import re
import logging
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)])
logger = logging.getLogger('soundstream-irc-bot')

# Configuration from environment variables
IRC_SERVER = os.environ.get("IRC_SERVER", "irc.thunderirc.net")
IRC_PORT = int(os.environ.get("IRC_PORT", 6667))
IRC_CHANNEL = os.environ.get("IRC_CHANNEL", "#sdmn")
IRC_NICKNAME = os.environ.get("IRC_NICKNAME", "SoundStreamBot")
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:5000/api")
API_REQUEST_URL = f"{API_BASE_URL}/irc/request"
API_NOW_PLAYING_URL = f"{API_BASE_URL}/irc/now-playing"

# How often to check for now playing updates (in seconds)
NOW_PLAYING_CHECK_INTERVAL = 30


class SoundStreamBot(irc.bot.SingleServerIRCBot):

    def __init__(self):
        logger.info(
            f"Initializing bot: {IRC_NICKNAME} on {IRC_SERVER}:{IRC_PORT}")
        irc.bot.SingleServerIRCBot.__init__(self, [(IRC_SERVER, IRC_PORT)],
                                            IRC_NICKNAME,
                                            "Music Streaming Bot")
        self.channel = IRC_CHANNEL
        self.currently_playing = None
        self.next_up = None
        self.stop_event = threading.Event()

    def on_welcome(self, connection, event):
        """Called when the bot connects to the server"""
        logger.info(f"Connected to server, joining {self.channel}")
        connection.join(self.channel)
        connection.privmsg(
            self.channel,
            "SoundStream bot is now online! Use !request <song> to add a song to the queue."
        )

        # Start the now playing announcement thread
        self.now_playing_thread = threading.Thread(
            target=self.announce_now_playing_loop, args=(connection, ))
        self.now_playing_thread.daemon = True
        self.now_playing_thread.start()

    def on_disconnect(self, connection, event):
        """Called when the bot disconnects from the server"""
        self.stop_event.set()
        logger.info("Disconnected from server")

    def on_pubmsg(self, connection, event):
        """Called when a message is received in the channel"""
        message = event.arguments[0]
        sender = event.source.nick

        # Check for song request command
        request_match = re.match(r'!request\s+(.*)', message)
        if request_match:
            query = request_match.group(1).strip()
            self.handle_song_request(connection, sender, query)

        # Check for now playing command
        elif message.strip() == "!np" or message.strip() == "!nowplaying":
            self.check_and_announce_now_playing(connection)

    def handle_song_request(self, connection, requester, query):
        """Process a song request and send it to the API"""
        logger.info(f"Song request from {requester}: {query}")

        if not query:
            connection.privmsg(
                self.channel,
                f"{requester}: Please provide a song name or YouTube URL")
            return

        try:
            response = requests.post(API_REQUEST_URL,
                                     json={
                                         "query": query,
                                         "requester": requester
                                     },
                                     timeout=10)

            if response.status_code == 201:
                data = response.json()
                connection.privmsg(self.channel,
                                   f"{requester}: {data['message']}")
            else:
                error_data = response.json()
                connection.privmsg(
                    self.channel,
                    f"{requester}: Failed to add song - {error_data.get('message', 'Unknown error')}"
                )

        except Exception as e:
            logger.error(f"Error handling request: {str(e)}")
            connection.privmsg(
                self.channel,
                f"{requester}: Sorry, there was an error processing your request"
            )

    def check_and_announce_now_playing(self, connection):
        """Check what's playing and announce it to the channel"""
        try:
            response = requests.get(API_NOW_PLAYING_URL, timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.announce_track_info(connection, data)
            else:
                logger.error(
                    f"Failed to get now playing info: {response.status_code}")
        except Exception as e:
            logger.error(f"Error checking now playing: {str(e)}")

    def announce_track_info(self, connection, data):
        """Announce track information to the channel"""
        now_playing = data.get('nowPlaying')
        next_up = data.get('nextUp')

        # Check if now playing info is new
        if now_playing != self.currently_playing:
            self.currently_playing = now_playing
            if now_playing:
                connection.privmsg(
                    self.channel,
                    f"🎵 Now Playing: {now_playing['title']} by {now_playing['artist']} (requested by {now_playing['requester']})"
                )
            else:
                connection.privmsg(self.channel,
                                   "🔇 Nothing is currently playing")

        # Announce next track if available and different from before
        if next_up != self.next_up:
            self.next_up = next_up
            if next_up:
                connection.privmsg(
                    self.channel,
                    f"⏭️ Up Next: {next_up['title']} by {next_up['artist']} (requested by {next_up['requester']})"
                )

    def announce_now_playing_loop(self, connection):
        """Periodically check and announce what's playing"""
        while not self.stop_event.is_set():
            try:
                self.check_and_announce_now_playing(connection)
            except Exception as e:
                logger.error(f"Error in now playing loop: {str(e)}")

            # Sleep until next check, but allow for early termination
            self.stop_event.wait(NOW_PLAYING_CHECK_INTERVAL)


def main():
    logger.info("Starting SoundStream IRC Bot")
    try:
        bot = SoundStreamBot()
        bot.start()
    except KeyboardInterrupt:
        logger.info("Bot shutting down...")
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
