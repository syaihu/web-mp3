import { usePlayer } from "@/hooks/use-player";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Plus } from "lucide-react";

interface SongCardProps {
  song: {
    id: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
    youtubeId?: string;
  };
  requester?: string;
}

export function SongCard({ song, requester }: SongCardProps) {
  const { playSongFromYoutube } = usePlayer();
  const { toast } = useToast();

  const handlePlay = () => {
    playSongFromYoutube(song.id || song.youtubeId!);
  };

  const handleAddToQueue = async () => {
    try {
      await apiRequest("POST", "/api/queue", {
        youtubeUrl: `https://youtube.com/watch?v=${song.id || song.youtubeId}`,
        requesterName: "",
      });
      
      toast({
        title: "Added to Queue",
        description: `"${song.title}" has been added to the queue`,
      });
      
      // Refresh queue
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/recent'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add song to queue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass-effect rounded-xl p-4 shadow-custom transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
      <div className="relative mb-4 w-full aspect-video rounded-lg overflow-hidden">
        <img 
          src={song.thumbnail} 
          alt={song.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center mr-3 shadow-custom transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handlePlay}
          >
            <Play className="h-6 w-6 text-white ml-1" />
          </button>
          <button 
            className="w-10 h-10 rounded-full bg-dark-lighter/80 backdrop-blur-sm flex items-center justify-center shadow-custom transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handleAddToQueue}
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
      
      <h4 className="text-white text-sm font-medium line-clamp-1 font-outfit group-hover:text-primary-custom transition-colors">{song.title}</h4>
      <p className="text-gray-custom text-xs mb-2">{song.channelTitle}</p>
      
      {requester && (
        <div className="flex items-center text-xs bg-dark-lighter/50 rounded-full px-3 py-1 mt-2 w-fit">
          <span className="text-gray-custom">Requested by</span>
          <span className="ml-1 text-primary-custom font-medium">@{requester}</span>
        </div>
      )}
    </div>
  );
}
