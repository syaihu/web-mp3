import { useState, useEffect } from "react";
import { SongCard } from "@/components/music/song-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  duration: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedQuery) {
      fetchResults();
    }
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
    setHasSearched(true);
  };

  return (
    <div className="bg-gradient-custom p-6 min-h-screen overflow-y-auto custom-scrollbar">
      {/* Header with spotlight effect */}
      <header className="mb-10 relative">
        <div className="absolute top-0 left-0 w-full h-60 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl opacity-30 blur-3xl -z-10"></div>
        <div className="slide-up">
          <h1 className="text-3xl font-bold text-white mb-3 font-outfit">Discover Music</h1>
          <p className="text-gray-custom text-sm max-w-xl mb-8">Search for your favorite songs, artists, or albums</p>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-2xl fade-in">
          <div className="glass-effect p-3 rounded-xl flex items-center">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="What do you want to listen to?"
                className="bg-transparent border-none text-white pr-10 h-12 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-custom"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-custom">
                <Search className="h-5 w-5" />
              </div>
            </div>
            <Button 
              type="submit" 
              className="ml-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white h-12 px-6 rounded-lg shadow-custom"
              disabled={isLoading || !searchQuery}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
            </Button>
          </div>
        </form>
      </header>
      
      {/* Search Results */}
      <div className="mb-16">
        {debouncedQuery && (
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <Search className="h-4 w-4 text-primary-custom" />
            </div>
            <h2 className="text-xl font-semibold text-white font-outfit">
              {isLoading ? (
                <span className="flex items-center">
                  Searching
                  <span className="ml-2 flex">
                    <span className="animate-pulse h-1 w-1 bg-primary-custom rounded-full mx-0.5"></span>
                    <span className="animate-pulse h-1 w-1 bg-primary-custom rounded-full mx-0.5 delay-75"></span>
                    <span className="animate-pulse h-1 w-1 bg-primary-custom rounded-full mx-0.5 delay-150"></span>
                  </span>
                </span>
              ) : (
                <>
                  Results for <span className="text-primary-custom">"{debouncedQuery}"</span>
                </>
              )}
            </h2>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-16 glass-effect rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-custom mb-4"></div>
              <p className="text-gray-custom">Searching YouTube for the best matches</p>
            </div>
          </div>
        ) : hasSearched && debouncedQuery && searchResults.length === 0 ? (
          <div className="glass-effect rounded-xl p-10 text-center shadow-custom">
            <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No results found</h3>
            <p className="text-gray-custom mb-4">We couldn't find any matches for "{debouncedQuery}"</p>
            <p className="text-gray-custom text-sm">Try different keywords or check for typos</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((result, index) => (
              <div 
                className="animated-card" 
                key={result.id}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out ${index * 0.05}s forwards` 
                }}
              >
                <SongCard song={result} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-xl p-10 text-center shadow-custom fade-in">
            <div className="w-20 h-20 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-custom opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-medium mb-3">Ready to find some music?</h3>
            <p className="text-gray-custom max-w-lg mx-auto mb-6">
              Search for songs, artists, or albums to discover new music or find your favorites
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              <Button 
                className="bg-dark-lighter hover:bg-dark-light text-gray-custom hover:text-white"
                onClick={() => setSearchQuery("lofi hip hop")}
              >
                Lofi Hip Hop
              </Button>
              <Button 
                className="bg-dark-lighter hover:bg-dark-light text-gray-custom hover:text-white"
                onClick={() => setSearchQuery("acoustic covers")}
              >
                Acoustic Covers
              </Button>
              <Button 
                className="bg-dark-lighter hover:bg-dark-light text-gray-custom hover:text-white"
                onClick={() => setSearchQuery("workout playlist")}
              >
                Workout Music
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
