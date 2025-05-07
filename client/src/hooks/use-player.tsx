import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  youtubeId: string;
  thumbnail: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeat: boolean;
  isShuffle: boolean;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  playSong: (song: Song) => void;
  playSongFromYoutube: (youtubeId: string) => void;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  // Audio context for visualizer
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  // Instead of using the YT API directly, we'll use an iframe-based approach
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  // Initialize audio context (will be connected to audio later)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContext();
      const analyserNode = context.createAnalyser();
      
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      
      return () => {
        context.close();
      };
    }
  }, []);

  // Create YouTube iframe when component mounts
  useEffect(() => {
    // Create a hidden iframe for YouTube
    const iframe = document.createElement('iframe');
    iframe.id = 'youtube-iframe-player';
    iframe.style.position = 'absolute';
    iframe.style.opacity = '0.01'; // Barely visible but still renders audio
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    document.body.appendChild(iframe);
    
    iframeRef.current = iframe;
    
    return () => {
      stopProgressTimer();
      document.getElementById('youtube-iframe-player')?.remove();
    };
  }, []);

  // Fetch queue on mount
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch('/api/queue');
        if (response.ok) {
          const data = await response.json();
          setQueue(data);
          
          // If no current song and queue has items, set the first as current
          if (!currentSong && data.length > 0) {
            setCurrentSong(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch queue:', error);
      }
    };
    
    fetchQueue();
  }, []);

  // Track iframe loading and message passing
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from our iframe
      if (event.source === iframeRef.current?.contentWindow) {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different YouTube iframe API events
          if (data.event === 'onStateChange') {
            if (data.info === 0) { // Ended
              if (isRepeat) {
                // Restart the song
                if (currentSong) {
                  loadVideo(currentSong.youtubeId);
                }
              } else {
                nextSong();
              }
            } else if (data.info === 1) { // Playing
              setIsPlaying(true);
              startProgressTimer();
            } else if (data.info === 2) { // Paused
              setIsPlaying(false);
              stopProgressTimer();
            }
          } else if (data.event === 'getDuration') {
            setDuration(data.seconds || currentSong?.duration || 0);
          } else if (data.event === 'getCurrentTime') {
            setProgressState(data.seconds || 0);
          }
        } catch (e) {
          // Not a JSON message or not from our iframe
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [currentSong, isRepeat]);

  // Load current song when it changes
  useEffect(() => {
    if (!currentSong) return;
    
    loadVideo(currentSong.youtubeId);
    setDuration(currentSong.duration);
    startProgressTimer();
  }, [currentSong]);

  // Helper function to send commands to the iframe
  const sendCommand = (command: string) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    
    try {
      iframeRef.current.contentWindow.postMessage(JSON.stringify(command), '*');
    } catch (e) {
      console.error('Failed to send command to YouTube iframe:', e);
    }
  };

  // Load a video into the iframe
  const loadVideo = (videoId: string) => {
    if (!iframeRef.current) return;
    
    // Update the iframe source with the new video
    iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&disablekb=1&fs=0&rel=0&origin=${window.location.origin}`;
    
    // Start playing automatically
    setIsPlaying(true);
  };

  const startProgressTimer = () => {
    stopProgressTimer();
    progressTimerRef.current = window.setInterval(() => {
      // Since we're not using the YT API directly, we'll estimate progress
      setProgressState(prev => {
        if (isPlaying) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);
  };

  const stopProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const playSongFromYoutube = async (youtubeId: string) => {
    try {
      // Get video details
      const response = await fetch(`/api/search?q=https://youtube.com/watch?v=${youtubeId}`);
      if (response.ok) {
        const searchResults = await response.json();
        if (searchResults.length > 0) {
          const videoDetails = searchResults[0];
          
          // Create a song object
          const song: Song = {
            id: -1, // Temporary ID
            title: videoDetails.title,
            artist: videoDetails.channelTitle,
            duration: videoDetails.duration,
            youtubeId: videoDetails.id,
            thumbnail: videoDetails.thumbnail
          };
          
          setCurrentSong(song);
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Failed to get video details:', error);
    }
  };

  const togglePlay = () => {
    if (!currentSong) return;
    
    if (isPlaying) {
      // Send pause command
      sendCommand('pauseVideo');
      stopProgressTimer();
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    } else {
      // Send play command
      sendCommand('playVideo');
      startProgressTimer();
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (!queue.length) return;
    
    const currentIndex = queue.findIndex(song => song.id === currentSong?.id);
    const nextIndex = isShuffle 
      ? Math.floor(Math.random() * queue.length)
      : (currentIndex + 1) % queue.length;
    
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const previousSong = () => {
    if (!queue.length) return;
    
    const currentIndex = queue.findIndex(song => song.id === currentSong?.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const setProgress = (newProgress: number) => {
    // Send seek command
    sendCommand(`seekTo:${newProgress}`);
    setProgressState(newProgress);
  };

  const setVolume = (newVolume: number) => {
    // Send volume command (0-100)
    sendCommand(`setVolume:${newVolume * 100}`);
    setVolumeState(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Send mute/unmute command
    sendCommand(`setVolume:${isMuted ? volume * 100 : 0}`);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        isMuted,
        isRepeat,
        isShuffle,
        audioContext,
        analyser,
        playSong,
        playSongFromYoutube,
        togglePlay,
        nextSong,
        previousSong,
        setProgress,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
