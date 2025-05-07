import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PlaylistItem } from "@/components/music/playlist-item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function Library() {
  interface Playlist {
    id: number;
    name: string;
    userId: number;
    createdAt: string;
  }
  
  interface Song {
    id: number;
    title: string;
    artist: string;
    duration: number;
    youtubeId: string;
    thumbnail: string;
    addedAt: string;
  }
  
  interface PlaylistWithSongs {
    playlist: Playlist;
    songs: Song[];
  }

  const [activePlaylist, setActivePlaylist] = useState<number | null>(null);
  
  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ['/api/playlists'],
    staleTime: 60000, // 1 minute
  });
  
  const { data: playlistSongs, isLoading: isLoadingSongs } = useQuery<PlaylistWithSongs>({
    queryKey: ['/api/playlists', activePlaylist],
    enabled: !!activePlaylist,
    staleTime: 30000, // 30 seconds
  });

  return (
    <div className="bg-gradient-custom p-6 min-h-screen overflow-y-auto custom-scrollbar">
      {/* Header with spotlight effect */}
      <header className="mb-10 relative">
        <div className="absolute top-0 left-0 w-full h-60 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl opacity-30 blur-3xl -z-10"></div>
        <div className="slide-up">
          <h1 className="text-3xl font-bold text-white mb-3 font-outfit">Your Library</h1>
          <p className="text-gray-custom max-w-xl">
            Discover, organize, and enjoy your personal music collections
          </p>
        </div>
      </header>
      
      <Tabs defaultValue="playlists" className="max-w-4xl fade-in">
        <TabsList className="glass-effect rounded-full p-1">
          <TabsTrigger 
            value="playlists" 
            className="rounded-full px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary-light/70 data-[state=active]:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Playlists
          </TabsTrigger>
          <TabsTrigger 
            value="favorites" 
            className="rounded-full px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary-light/70 data-[state=active]:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Favorites
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-full px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary-light/70 data-[state=active]:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="playlists" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="glass-effect rounded-xl overflow-hidden shadow-custom">
                <div className="px-6 py-4 border-b border-gray-700/30 flex items-center justify-between">
                  <h3 className="text-white font-medium font-outfit flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-custom mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    Your Playlists
                  </h3>
                  
                  <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-custom hover:text-white hover:bg-dark-lighter transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4">
                  {isLoadingPlaylists ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-custom"></div>
                    </div>
                  ) : playlists && playlists.length > 0 ? (
                    <ul className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {playlists.map((playlist: any) => (
                        <li 
                          key={playlist.id} 
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center ${
                            activePlaylist === playlist.id 
                              ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary' 
                              : 'hover:bg-dark-lighter'
                          }`}
                          onClick={() => setActivePlaylist(playlist.id)}
                        >
                          <div className="w-8 h-8 rounded bg-dark-lighter flex items-center justify-center text-primary-custom mr-3 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M9 18V5l12-2v13"></path>
                              <circle cx="6" cy="18" r="3"></circle>
                              <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                          </div>
                          <span className={`${activePlaylist === playlist.id ? 'text-primary-custom font-medium' : 'text-white'}`}>
                            {playlist.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <p className="text-gray-custom">No playlists found</p>
                      <button className="mt-4 px-4 py-2 bg-dark-lighter hover:bg-dark-light text-white rounded-full flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Playlist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 glass-effect rounded-xl overflow-hidden shadow-custom">
              {activePlaylist ? (
                <>
                  <div className="px-6 py-4 border-b border-gray-700/30 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-custom mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <h3 className="text-white font-medium text-lg font-outfit">
                        {playlists?.find((p: any) => p.id === activePlaylist)?.name || 'Playlist'}
                      </h3>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="text-gray-custom hover-primary transition-colors p-2 rounded-full hover:bg-dark-lighter">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </button>
                      <button className="text-gray-custom hover-primary transition-colors p-2 rounded-full hover:bg-dark-lighter">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {isLoadingSongs ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-custom"></div>
                      </div>
                    ) : playlistSongs && playlistSongs.songs && playlistSongs.songs.length > 0 ? (
                      <div className="space-y-1">
                        {playlistSongs.songs.map((song: any) => (
                          <PlaylistItem 
                            key={song.id} 
                            song={song} 
                            showRemove={false}
                            inQueue={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                          </svg>
                        </div>
                        <p className="text-white font-medium mb-1">This playlist is empty</p>
                        <p className="text-gray-custom text-sm mb-4">Add songs from your search results</p>
                        <button className="px-4 py-2 bg-dark-lighter hover:bg-dark-light text-white rounded-full flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Songs
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-dark-lighter rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-white text-lg font-medium mb-2">Select a playlist</h3>
                  <p className="text-gray-custom text-center max-w-md">
                    Choose a playlist from the list on the left to view and play its contents
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-8">
          <div className="glass-effect rounded-xl overflow-hidden shadow-custom">
            <div className="px-6 py-4 border-b border-gray-700/30">
              <h3 className="text-white font-medium font-outfit flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-custom mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Your Favorite Songs
              </h3>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-custom opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No favorites yet</h3>
              <p className="text-gray-custom max-w-md mx-auto mb-6">
                Your favorite songs will appear here. Like songs by clicking the heart icon to add them to this list.
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-primary/30 to-primary/10 hover:from-primary/40 hover:to-primary/20 text-white rounded-full">
                Explore Music
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-8">
          <div className="glass-effect rounded-xl overflow-hidden shadow-custom">
            <div className="px-6 py-4 border-b border-gray-700/30">
              <h3 className="text-white font-medium font-outfit flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-custom mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recently Played
              </h3>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-custom opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No listening history yet</h3>
              <p className="text-gray-custom max-w-md mx-auto mb-6">
                Your listening history will appear here as you play songs on SoundStream.
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-primary/30 to-primary/10 hover:from-primary/40 hover:to-primary/20 text-white rounded-full">
                Start Listening
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
