import { useState } from "react";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/hooks/use-player";
import { apiRequest } from "@/lib/queryClient";
import { X, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface PlaylistItemProps {
  song: {
    id: number;
    title: string;
    artist: string;
    thumbnail: string;
    duration: number;
    youtubeId: string;
  };
  queueId?: number;
  requester?: string;
  showRemove?: boolean;
  inQueue?: boolean;
}

export function PlaylistItem({ song, queueId, requester, showRemove = true, inQueue = true }: PlaylistItemProps) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();
  
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => {
    playSong(song);
  };

  const handleRemove = async () => {
    if (!queueId) return;
    
    try {
      setIsRemoving(true);
      await apiRequest('DELETE', `/api/queue/${queueId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      toast({
        title: "Removed from queue",
        description: `"${song.title}" has been removed from the queue`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove song from queue",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={`playlist-item flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
      isCurrentSong 
        ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary' 
        : 'hover:bg-dark-lighter'
    }`}>
      <div className="flex items-center flex-1 min-width-0">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0 shadow-custom group">
          <img 
            src={song.thumbnail} 
            alt={`${song.title} thumbnail`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
              isCurrentSong 
                ? 'bg-gradient-to-br from-primary/40 to-black/60' 
                : 'bg-black/60 opacity-0 group-hover:opacity-100'
            }`}
          >
            <button 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-custom"
              onClick={handlePlay}
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="h-4 w-4 text-dark" />
              ) : (
                <Play className="h-4 w-4 text-dark ml-0.5" />
              )}
            </button>
          </div>
        </div>
        
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-medium truncate font-outfit ${isCurrentSong ? 'text-primary-custom' : 'text-white'}`}>
            {song.title}
          </h4>
          <div className="flex items-center">
            <p className="text-gray-custom text-xs truncate">{song.artist}</p>
            {requester && (
              <>
                <span className="mx-1 text-gray-custom text-xs">•</span>
                <span className="text-primary-custom text-xs font-medium">@{requester}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center ml-4">
        <span className="text-gray-custom text-sm mr-4 bg-dark-lighter/50 px-2 py-0.5 rounded-full">
          {formatDuration(song.duration)}
        </span>
        {showRemove && inQueue && (
          <button 
            className="text-gray-custom hover:text-white transition-colors w-8 h-8 rounded-full hover:bg-dark-lighter flex items-center justify-center"
            onClick={handleRemove}
            disabled={isRemoving}
            title="Remove from queue"
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
