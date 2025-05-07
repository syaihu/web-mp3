import { useState, useEffect } from "react";

// Load YouTube IFrame API
function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT) {
      resolve();
      return;
    }

    // Create script element
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
}

// Hook to load and provide YouTube API
export function useYouTube(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      await loadYouTubeApi();
      if (isMounted) {
        setIsReady(true);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return isReady;
}
