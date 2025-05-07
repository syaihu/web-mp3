import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  duration: integer("duration").notNull(),
  youtubeId: text("youtube_id").notNull(),
  thumbnail: text("thumbnail").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  addedAt: true,
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export const playlistSongs = pgTable("playlist_songs", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  songId: integer("song_id").notNull(),
  position: integer("position").notNull(),
});

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs).omit({
  id: true,
});

export const queueItems = pgTable("queue_items", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").notNull(),
  requester: text("requester"),
  position: integer("position").notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
});

export const insertQueueItemSchema = createInsertSchema(queueItems).omit({
  id: true,
  requestedAt: true,
});

export const songRequestSchema = z.object({
  youtubeUrl: z.string().url(),
  requesterName: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylistSong = z.infer<typeof insertPlaylistSongSchema>;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type InsertQueueItem = z.infer<typeof insertQueueItemSchema>;
export type QueueItem = typeof queueItems.$inferSelect;
export type SongRequest = z.infer<typeof songRequestSchema>;
