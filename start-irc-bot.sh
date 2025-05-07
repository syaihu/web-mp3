#!/bin/bash

# Default IRC configurations
export IRC_SERVER=${IRC_SERVER:-"irc.libera.chat"}
export IRC_PORT=${IRC_PORT:-6667}
export IRC_CHANNEL=${IRC_CHANNEL:-"#soundstream"}
export IRC_NICKNAME=${IRC_NICKNAME:-"SoundStreamBot"}
export API_BASE_URL=${API_BASE_URL:-"http://localhost:5000/api"}

# Run the bot
echo "Starting SoundStream IRC Bot..."
echo "Server: $IRC_SERVER:$IRC_PORT"
echo "Channel: $IRC_CHANNEL"
echo "Nickname: $IRC_NICKNAME"
echo "API Base URL: $API_BASE_URL"
echo ""
echo "Available commands in IRC:"
echo "  !request <song>  - Request a song to be played"
echo "  !np or !nowplaying - Display currently playing song"
echo ""
echo "Press Ctrl+C to stop the bot"
echo ""

python server/irc-bot.py