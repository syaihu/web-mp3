import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/use-player";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Heart 
} from "lucide-react";

export function Player() {
  const { 
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextSong,
    previousSong,
    setProgress,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    isRepeat,
    isShuffle
  } = usePlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!currentSong) {
    return (
      <div className="player-height player-gradient glass-effect flex items-center justify-center text-gray-custom">
        <div className="slide-up">
          <div className="flex flex-col items-center">
            <ListMusic className="h-6 w-6 mb-2 opacity-70" />
            <p className="text-sm">No track selected</p>
            <p className="text-xs mt-1 opacity-50">Start playing music from your library or search</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-height player-gradient glass-effect flex items-center px-4">
      {/* Now playing info with animation */}
      <div className="flex items-center w-1/4 fade-in">
        <div className="w-14 h-14 rounded-lg overflow-hidden mr-3 flex-shrink-0 shadow-custom">
          <img 
            src={currentSong.thumbnail} 
            alt="Now playing" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden sm:block mr-3">
          <h4 className="text-white text-sm font-medium line-clamp-1 font-outfit">{currentSong.title}</h4>
          <p className="text-gray-custom text-xs">{currentSong.artist}</p>
        </div>
        <button className="text-gray-custom hover-primary transition-colors hidden sm:block">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      
      {/* Enhanced player controls */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center mb-2">
          <button 
            className={cn(
              "control-button text-gray-custom mx-2 hover:bg-dark-lighter p-1.5 rounded-full",
              isShuffle && "text-primary-custom"
            )}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>
          
          <button 
            className="control-button text-gray-custom mx-2 hover:bg-dark-lighter p-1.5 rounded-full"
            onClick={previousSong}
            title="Previous"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          
          <button 
            className={cn(
              "control-button w-12 h-12 rounded-full flex items-center justify-center mx-3 shadow-custom glow",
              isPlaying ? "bg-white" : "bg-primary-custom"
            )}
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-dark" />
            ) : (
              <Play className="h-6 w-6 text-dark ml-0.5" />
            )}
          </button>
          
          <button 
            className="control-button text-gray-custom mx-2 hover:bg-dark-lighter p-1.5 rounded-full"
            onClick={nextSong}
            title="Next"
          >
            <SkipForward className="h-5 w-5" />
          </button>
          
          <button 
            className={cn(
              "control-button text-gray-custom mx-2 hover:bg-dark-lighter p-1.5 rounded-full",
              isRepeat && "text-primary-custom"
            )}
            onClick={toggleRepeat}
            title="Repeat"
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>
        
        {/* Enhanced progress bar */}
        <div className="w-full flex items-center px-4">
          <span className="text-xs text-gray-custom font-medium mr-2">{formatTime(progress)}</span>
          <div className="flex-1 mx-2">
            <div 
              className="progress-bar w-full bg-gray-700 rounded-full cursor-pointer hover:progress-glow"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setProgress(pos * duration);
              }}
            >
              <div 
                className="bg-gradient-to-r from-primary-light to-primary h-full rounded-full relative" 
                style={{ width: `${(progress / duration) * 100}%` }}
              >
                <div className="w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 shadow-custom"></div>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-custom font-medium ml-2">{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Additional controls with hover effects */}
      <div className="w-1/4 flex items-center justify-end">
        <button className="text-gray-custom hover-primary transition-colors mr-3 p-1.5 hover:bg-dark-lighter rounded-full">
          <ListMusic className="h-5 w-5" />
        </button>
        
        <div className="relative" ref={volumeRef}>
          <button 
            className="text-gray-custom hover-primary transition-colors mr-3 p-1.5 hover:bg-dark-lighter rounded-full"
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          
          {showVolumeSlider && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 glass-effect p-3 rounded-lg w-32 shadow-custom slide-up z-50">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(values) => setVolume(values[0] / 100)}
                className="w-full"
              />
            </div>
          )}
        </div>
        
        <div className="w-20 hidden sm:block">
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={(values) => setVolume(values[0] / 100)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
