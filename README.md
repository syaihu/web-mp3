# SoundStream Music App

SoundStream is an elegant, audio-only music streaming application with YouTube API integration and IRC bot capabilities for song requests. It's designed to run on OpenBSD or Linux systems.

## Features

- **Audio-only Music Streaming**: Listen to your favorite songs without video playback
- **YouTube Integration**: Search and play songs directly from YouTube
- **Playlist Management**: Create and manage your music playlists
- **Queue System**: Add songs to the queue to listen later
- **Song Requests via IRC**: Allow users to request songs via IRC with the `!request` command
- **Modern Audio Controls**: Play, pause, skip, adjust volume, and more
- **Audio Visualization**: Visual feedback of the audio being played
- **Responsive Design**: Works great on desktop and mobile devices

## Requirements

- Node.js (v16+)
- Python 3.x (for IRC bot)
- YouTube API Key
- IRC Server (optional, for song requests)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Install Python dependencies for the IRC bot:
   ```
   pip install irc requests
   ```
4. Set up your YouTube API key as an environment variable:
   ```
   export YOUTUBE_API_KEY=your_api_key_here
   ```

## Usage

### Starting the Application

```
npm run dev
```

This will start the web server at http://localhost:5000.

### Starting the IRC Bot

```
./start-irc-bot.sh
```

The IRC bot will connect to the configured IRC server and channel, and will listen for song requests.

## IRC Bot Commands

- `!request <song name or YouTube URL>` - Request a song to be added to the queue
- `!np` or `!nowplaying` - Show the currently playing song
- The bot will also automatically announce when a new song starts playing and what's coming up next

## IRC Bot Configuration

You can configure the IRC bot by setting the following environment variables:

- `IRC_SERVER` - IRC server to connect to (default: irc.libera.chat)
- `IRC_PORT` - IRC server port (default: 6667)
- `IRC_CHANNEL` - IRC channel to join (default: #soundstream)
- `IRC_NICKNAME` - Bot nickname (default: SoundStreamBot)
- `API_BASE_URL` - Base URL for API requests (default: http://localhost:5000/api)

For example:
```
export IRC_SERVER="irc.libera.chat"
export IRC_PORT=6667
export IRC_CHANNEL="#mymusic"
export IRC_NICKNAME="MusicBot"
export API_BASE_URL="http://myserver.com/api"
./start-irc-bot.sh
```

## Application Structure

- `client/` - Frontend code (React)
- `server/` - Backend code (Express)
- `shared/` - Shared code and types
- `server/irc-bot.py` - IRC bot for song requests

## API Endpoints

- `GET /api/search?q=<query>` - Search YouTube for songs
- `GET /api/queue` - Get current queue
- `POST /api/queue` - Add song to queue
- `DELETE /api/queue/:id` - Remove song from queue
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/irc/request` - Add a song to the queue via IRC bot
- `GET /api/irc/now-playing` - Get information about currently playing and upcoming songs

## Troubleshooting

- **YouTube API Key issues**: Ensure your YouTube API key is set correctly and has the YouTube Data API v3 enabled
- **IRC Bot Connection Issues**: Check that your IRC server, port, and channel settings are correct
- **Song playback issues**: Check browser console for errors related to playback

## License

This project is licensed under the MIT License.