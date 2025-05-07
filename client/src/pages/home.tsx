import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePlayer } from "@/hooks/use-player";
import { AudioVisualizer } from "@/components/music/audio-visualizer";
import { PlaylistItem } from "@/components/music/playlist-item";
import { SongCard } from "@/components/music/song-card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Heart, MoreHorizontal } from "lucide-react";

export default function Home() {
  const { currentSong, togglePlay, isPlaying, audioContext, analyser } = usePlayer();
  const { toast } = useToast();

  interface QueueItem {
    id: number;
    songId: number;
    requester: string | null;
    position: number;
    song: {
      id: number;
      title: string;
      artist: string;
      duration: number;
      youtubeId: string;
      thumbnail: string;
    };
  }

  const { data: queue = [], isLoading: isQueueLoading } = useQuery<QueueItem[]>({
    queryKey: ['/api/queue'],
    staleTime: 10000,
  });

  const { data: recentRequests = [], isLoading: isRecentLoading } = useQuery<QueueItem[]>({
    queryKey: ['/api/requests/recent'],
    staleTime: 30000,
  });

  const handleClearQueue = async () => {
    try {
      await apiRequest('DELETE', '/api/queue');
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      toast({
        title: "Queue cleared",
        description: "All songs have been removed from the queue",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear queue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gradient-custom p-6 min-h-screen overflow-y-auto custom-scrollbar">
      {/* Header with spotlight effect */}
      <header className="mb-10 relative">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl opacity-30 blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="slide-up">
            <h1 className="text-3xl font-bold text-white font-outfit mb-2">Welcome to SoundStream</h1>
            <p className="text-gray-custom text-sm max-w-xl">Your music streaming platform with YouTube integration and IRC song requests</p>
          </div>
          <div className="relative max-w-xl w-full md:max-w-xs mt-4 md:mt-0 fade-in">
            <div className="glass-effect rounded-full px-2 py-1">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="w-full bg-transparent border-none rounded-full py-2 px-4 pl-10 text-sm text-white focus:outline-none"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Now Playing Section with enhanced styling */}
      <section className="mb-16">
        <div className="glass-effect rounded-xl p-6 shadow-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="relative rounded-lg overflow-hidden mb-6 md:mb-0 md:mr-8 flex-shrink-0 shadow-custom group">
              <img 
                src={currentSong?.thumbnail || "https://images.unsplash.com/photo-1516981879613-9f5da904015f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"} 
                alt="Album cover" 
                className="w-60 h-60 md:w-72 md:h-72 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center transform -translate-y-10 group-hover:translate-y-0 transition-all duration-300 glow"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <Play className="h-8 w-8 text-white ml-1" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="slide-up">
              <span className="text-primary-custom text-sm font-medium px-3 py-1 bg-primary/10 rounded-full">NOW PLAYING</span>
              <h1 className="text-4xl font-bold text-white mt-3 mb-1 font-outfit">
                {currentSong?.title || "No song playing"}
              </h1>
              <h2 className="text-xl text-gray-custom mb-6 font-outfit">
                {currentSong?.artist || "Select a song to start playing"}
              </h2>
              
              <div className="flex items-center mb-8">
                <Button 
                  className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white rounded-full px-8 py-5 shadow-custom pulse-on-hover"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <button className="ml-4 text-gray-custom hover-primary transition-colors p-2 rounded-full hover:bg-dark-lighter">
                  <Heart className="h-6 w-6" />
                </button>
                <button className="ml-4 text-gray-custom hover-primary transition-colors p-2 rounded-full hover:bg-dark-lighter">
                  <MoreHorizontal className="h-6 w-6" />
                </button>
              </div>
              
              {/* Audio Visualizer with improved styling */}
              <div className="mt-6 w-full max-w-xl">
                <p className="text-gray-custom text-xs mb-1">AUDIO VISUALIZATION</p>
                <div className="bg-dark-lighter p-3 rounded-lg">
                  <AudioVisualizer 
                    audioContext={audioContext || undefined} 
                    analyser={analyser || undefined}
                    className="rounded-md overflow-hidden" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Queue Section with enhanced styling */}
      <section className="mb-10 fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-custom" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white font-outfit">Up Next</h2>
          </div>
          <button 
            className="text-gray-custom hover-primary transition-colors text-sm px-3 py-1 rounded-full hover:bg-dark-lighter"
            onClick={handleClearQueue}
          >
            Clear Queue
          </button>
        </div>
        
        <div className="glass-effect rounded-xl p-4 shadow-custom">
          {isQueueLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-custom"></div>
            </div>
          ) : queue && queue.length > 0 ? (
            <div className="space-y-1">
              {queue.map((item: any) => (
                <PlaylistItem 
                  key={item.id} 
                  song={item.song} 
                  queueId={item.id} 
                  requester={item.requester} 
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-gray-custom">The queue is empty</p>
              <p className="text-xs text-gray-custom mt-1">Add songs from Search or Library</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Recent Requests Section with enhanced styling */}
      <section className="mb-16 slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8c-2.168 0-4 1.832-4 4s1.832 4 4 4 4-1.832 4-4-1.832-4-4-4z" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M6.34 17.66l-1.41 1.41" />
                <path d="M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white font-outfit">Recent Requests</h2>
          </div>
          <button className="text-gray-custom hover-primary transition-colors text-sm px-3 py-1 rounded-full hover:bg-dark-lighter">
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isRecentLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-custom"></div>
            </div>
          ) : recentRequests && recentRequests.length > 0 ? (
            recentRequests.map((request: any) => (
              <div className="animated-card" key={request.id}>
                <SongCard 
                  song={request.song} 
                  requester={request.requester} 
                />
              </div>
            ))
          ) : (
            <div className="col-span-full glass-effect rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No recent requests</h3>
              <p className="text-gray-custom">Recent song requests from IRC users will appear here</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
