import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchYoutube, getVideoDetails, extractVideoId } from "./youtube";
import { songRequestSchema } from "../shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get current queue
  app.get("/api/queue", async (req, res) => {
    try {
      const queue = await storage.getQueue();
      res.json(queue);
    } catch (error) {
      res.status(500).json({ message: "Failed to get queue" });
    }
  });

  // Add item to queue
  app.post("/api/queue", async (req, res) => {
    try {
      const requestData = songRequestSchema.parse(req.body);
      const videoId = extractVideoId(requestData.youtubeUrl);
      
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }
      
      const videoDetails = await getVideoDetails(videoId);
      
      if (!videoDetails) {
        return res.status(404).json({ message: "YouTube video not found" });
      }
      
      // Create or get song
      const existingSong = await storage.getSongByYoutubeId(videoId);
      let songId;
      
      if (existingSong) {
        songId = existingSong.id;
      } else {
        const newSong = await storage.createSong({
          title: videoDetails.title,
          artist: videoDetails.channelTitle,
          duration: videoDetails.duration,
          youtubeId: videoId,
          thumbnail: videoDetails.thumbnail
        });
        songId = newSong.id;
      }
      
      // Add to queue
      const queueItem = await storage.addToQueue({
        songId,
        requester: requestData.requesterName,
        position: await storage.getNextQueuePosition()
      });
      
      res.status(201).json(queueItem);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to add to queue" });
    }
  });

  // Remove item from queue
  app.delete("/api/queue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromQueue(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from queue" });
    }
  });

  // Clear queue
  app.delete("/api/queue", async (req, res) => {
    try {
      await storage.clearQueue();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear queue" });
    }
  });

  // Search YouTube
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await searchYoutube(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search YouTube" });
    }
  });

  // Get all playlists
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to get playlists" });
    }
  });

  // Get playlist by id with songs
  app.get("/api/playlists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const playlist = await storage.getPlaylistWithSongs(id);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to get playlist" });
    }
  });

  // Get recent requests 
  app.get("/api/requests/recent", async (req, res) => {
    try {
      const recentRequests = await storage.getRecentRequests(10);
      res.json(recentRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent requests" });
    }
  });

  // IRC Bot endpoint - add to queue
  app.post("/api/irc/request", async (req, res) => {
    try {
      const { query, requester } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // Search YouTube for the first result
      const searchResults = await searchYoutube(query);
      
      if (searchResults.length === 0) {
        return res.status(404).json({ message: "No results found" });
      }
      
      const firstResult = searchResults[0];
      
      // Create or get song
      const existingSong = await storage.getSongByYoutubeId(firstResult.id);
      let songId;
      
      if (existingSong) {
        songId = existingSong.id;
      } else {
        const newSong = await storage.createSong({
          title: firstResult.title,
          artist: firstResult.channelTitle,
          duration: firstResult.duration,
          youtubeId: firstResult.id,
          thumbnail: firstResult.thumbnail
        });
        songId = newSong.id;
      }
      
      // Add to queue
      const queueItem = await storage.addToQueue({
        songId,
        requester,
        position: await storage.getNextQueuePosition()
      });
      
      res.status(201).json({
        success: true,
        message: `Added "${firstResult.title}" to the queue`,
        queueItem
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process IRC request" });
    }
  });
  
  // IRC Bot endpoint - get now playing and next songs
  app.get("/api/irc/now-playing", async (req, res) => {
    try {
      // Current queue to determine next song
      const queue = await storage.getQueue();
      
      // Return the first two songs in the queue (current and next)
      if (queue.length === 0) {
        return res.json({ 
          nowPlaying: null, 
          nextUp: null 
        });
      }
      
      const nowPlaying = queue[0];
      const nextUp = queue.length > 1 ? queue[1] : null;
      
      res.json({
        nowPlaying: nowPlaying ? {
          title: nowPlaying.song.title,
          artist: nowPlaying.song.artist,
          requester: nowPlaying.requester || "System"
        } : null,
        nextUp: nextUp ? {
          title: nextUp.song.title,
          artist: nextUp.song.artist,
          requester: nextUp.requester || "System"
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get now playing information" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
