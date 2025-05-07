import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  duration: number;
}

export async function searchYoutube(query: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: query,
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });

    const videoIds = response.data.items.map((item: any) => item.id.videoId).join(',');
    const videoDetails = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails,snippet',
        id: videoIds,
        key: YOUTUBE_API_KEY
      }
    });

    return videoDetails.data.items.map((item: any) => {
      // Parse ISO 8601 duration to seconds
      const duration = parseDuration(item.contentDetails.duration);
      
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        duration
      };
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

export async function getVideoDetails(videoId: string): Promise<SearchResult | null> {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails,snippet',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });

    if (response.data.items.length === 0) {
      return null;
    }

    const item = response.data.items[0];
    // Parse ISO 8601 duration to seconds
    const duration = parseDuration(item.contentDetails.duration);

    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      duration
    };
  } catch (error) {
    console.error('YouTube video details error:', error);
    return null;
  }
}

export function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match?.[1] ? parseInt(match[1].slice(0, -1)) : 0);
  const minutes = (match?.[2] ? parseInt(match[2].slice(0, -1)) : 0);
  const seconds = (match?.[3] ? parseInt(match[3].slice(0, -1)) : 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}
