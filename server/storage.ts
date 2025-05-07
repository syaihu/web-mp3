import { 
  users, type User, type InsertUser, 
  songs, type Song, type InsertSong, 
  playlists, type Playlist, type InsertPlaylist,
  playlistSongs, type PlaylistSong, type InsertPlaylistSong,
  queueItems, type QueueItem, type InsertQueueItem
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Song methods
  getSong(id: number): Promise<Song | undefined>;
  getSongByYoutubeId(youtubeId: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  
  // Playlist methods
  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistWithSongs(id: number): Promise<{ playlist: Playlist, songs: Song[] } | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  addSongToPlaylist(playlistSong: InsertPlaylistSong): Promise<PlaylistSong>;
  removeSongFromPlaylist(id: number): Promise<void>;
  
  // Queue methods
  getQueue(): Promise<(QueueItem & { song: Song })[]>;
  getNextQueuePosition(): Promise<number>;
  addToQueue(queueItem: InsertQueueItem): Promise<QueueItem & { song: Song }>;
  removeFromQueue(id: number): Promise<void>;
  clearQueue(): Promise<void>;
  
  // Additional methods
  getRecentRequests(limit: number): Promise<(QueueItem & { song: Song })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private songs: Map<number, Song>;
  private playlists: Map<number, Playlist>;
  private playlistSongs: Map<number, PlaylistSong>;
  private queue: Map<number, QueueItem>;
  
  private userIdCounter: number;
  private songIdCounter: number;
  private playlistIdCounter: number;
  private playlistSongIdCounter: number;
  private queueIdCounter: number;

  constructor() {
    this.users = new Map();
    this.songs = new Map();
    this.playlists = new Map();
    this.playlistSongs = new Map();
    this.queue = new Map();
    
    this.userIdCounter = 1;
    this.songIdCounter = 1;
    this.playlistIdCounter = 1;
    this.playlistSongIdCounter = 1;
    this.queueIdCounter = 1;
    
    // Add some demo playlists
    this.initDemoData();
  }
  
  private initDemoData() {
    // Create demo user
    const demoUser: User = {
      id: this.userIdCounter++,
      username: 'demo',
      password: 'demo123'
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create demo playlists
    const playlists = [
      { name: 'Favorites', userId: demoUser.id },
      { name: 'EDM Mix', userId: demoUser.id },
      { name: 'Chill Vibes', userId: demoUser.id },
      { name: 'Workout Beats', userId: demoUser.id },
      { name: 'Classic Rock', userId: demoUser.id }
    ];
    
    playlists.forEach(p => {
      const id = this.playlistIdCounter++;
      const createdAt = new Date();
      const playlist: Playlist = { id, ...p, createdAt };
      this.playlists.set(id, playlist);
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Song Methods
  async getSong(id: number): Promise<Song | undefined> {
    return this.songs.get(id);
  }
  
  async getSongByYoutubeId(youtubeId: string): Promise<Song | undefined> {
    return Array.from(this.songs.values()).find(
      (song) => song.youtubeId === youtubeId
    );
  }
  
  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = this.songIdCounter++;
    const addedAt = new Date();
    const song: Song = { ...insertSong, id, addedAt };
    this.songs.set(id, song);
    return song;
  }
  
  // Playlist Methods
  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }
  
  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }
  
  async getPlaylistWithSongs(id: number): Promise<{ playlist: Playlist, songs: Song[] } | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    // Get playlist songs with positions
    const playlistSongsWithPosition = Array.from(this.playlistSongs.values())
      .filter(ps => ps.playlistId === id)
      .sort((a, b) => a.position - b.position);
    
    // Get the actual songs
    const songs = playlistSongsWithPosition
      .map(ps => this.songs.get(ps.songId))
      .filter((song): song is Song => song !== undefined);
    
    return { playlist, songs };
  }
  
  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistIdCounter++;
    const createdAt = new Date();
    const playlist: Playlist = { ...insertPlaylist, id, createdAt };
    this.playlists.set(id, playlist);
    return playlist;
  }
  
  async addSongToPlaylist(insertPlaylistSong: InsertPlaylistSong): Promise<PlaylistSong> {
    const id = this.playlistSongIdCounter++;
    const playlistSong: PlaylistSong = { ...insertPlaylistSong, id };
    this.playlistSongs.set(id, playlistSong);
    return playlistSong;
  }
  
  async removeSongFromPlaylist(id: number): Promise<void> {
    this.playlistSongs.delete(id);
  }
  
  // Queue Methods
  async getQueue(): Promise<(QueueItem & { song: Song })[]> {
    const queueItems = Array.from(this.queue.values())
      .sort((a, b) => a.position - b.position);
    
    // Attach song data to each queue item
    return queueItems
      .map(item => {
        const song = this.songs.get(item.songId);
        if (!song) return null;
        return { ...item, song };
      })
      .filter((item): item is QueueItem & { song: Song } => item !== null);
  }
  
  async getNextQueuePosition(): Promise<number> {
    const queueItems = Array.from(this.queue.values());
    if (queueItems.length === 0) return 1;
    return Math.max(...queueItems.map(item => item.position)) + 1;
  }
  
  async addToQueue(insertQueueItem: InsertQueueItem): Promise<QueueItem & { song: Song }> {
    const id = this.queueIdCounter++;
    const requestedAt = new Date();
    // Convert undefined to null for the requester field
    const requester = insertQueueItem.requester || null;
    const queueItem: QueueItem = { 
      ...insertQueueItem, 
      id, 
      requestedAt,
      requester 
    };
    this.queue.set(id, queueItem);
    
    const song = this.songs.get(queueItem.songId);
    if (!song) {
      throw new Error('Song not found');
    }
    
    return { ...queueItem, song };
  }
  
  async removeFromQueue(id: number): Promise<void> {
    this.queue.delete(id);
  }
  
  async clearQueue(): Promise<void> {
    this.queue.clear();
  }
  
  // Additional Methods
  async getRecentRequests(limit: number): Promise<(QueueItem & { song: Song })[]> {
    const queueItems = Array.from(this.queue.values())
      .sort((a, b) => {
        const timeA = a.requestedAt ? a.requestedAt.getTime() : 0;
        const timeB = b.requestedAt ? b.requestedAt.getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, limit);
      
    // Attach song data to each queue item
    return queueItems
      .map(item => {
        const song = this.songs.get(item.songId);
        if (!song) return null;
        return { ...item, song };
      })
      .filter((item): item is QueueItem & { song: Song } => item !== null);
  }
}

export const storage = new MemStorage();
