import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Search, Library, Send, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Playlist {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
}

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ['/api/playlists'],
    staleTime: 60000, // 1 minute
  });

  const closeSidebar = () => {
    setOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setOpen]);

  const NavItem = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <Link href={to}>
      <div
        onClick={closeSidebar}
        className={cn(
          "flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer font-outfit",
          active 
            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-white font-medium shadow-custom" 
            : "text-gray-custom hover:bg-dark-lighter hover:text-white hover:translate-x-1"
        )}
      >
        <div className={cn(
          "flex items-center justify-center h-8 w-8 rounded-full mr-3",
          active ? "text-primary-custom" : "text-gray-custom"
        )}>
          {icon}
        </div>
        <span className="ml-1">{label}</span>
      </div>
    </Link>
  );

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-sidebar backdrop-blur flex flex-col transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 shadow-custom",
    open ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 text-white p-2 rounded-full bg-dark-lighter/90 backdrop-blur shadow-custom"
        onClick={() => setOpen(!open)}
      >
        <Menu size={24} className="text-primary-custom" />
      </button>

      {/* Backdrop for mobile */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center mb-10 fade-in">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent mr-3 shadow-custom">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl font-outfit">SoundStream</h1>
              <p className="text-xs text-gray-custom">Your music, your way</p>
            </div>
          </div>
          
          <nav className="space-y-2 mb-8">
            <h3 className="uppercase text-xs font-semibold text-gray-custom tracking-wider ml-4 mb-2">Main</h3>
            <NavItem 
              to="/" 
              icon={<Home className="h-5 w-5" />} 
              label="Home" 
              active={location === '/'} 
            />
            <NavItem 
              to="/search" 
              icon={<Search className="h-5 w-5" />} 
              label="Search" 
              active={location === '/search'} 
            />
            <NavItem 
              to="/library" 
              icon={<Library className="h-5 w-5" />} 
              label="Your Library" 
              active={location === '/library'} 
            />
            <NavItem 
              to="/request" 
              icon={<Send className="h-5 w-5" />} 
              label="Request Song" 
              active={location === '/request'} 
            />
          </nav>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="uppercase text-xs font-semibold text-gray-custom tracking-wider ml-4">Your Playlists</h3>
              <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-custom hover:bg-dark-lighter hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="glass-effect rounded-lg p-2 mb-4">
              <div className="bg-dark-lighter rounded-lg px-3 py-2 text-xs text-gray-custom flex items-center justify-between mb-1">
                <span>Recently added</span>
                <Search className="h-3 w-3" />
              </div>
            </div>
            <ul className="space-y-1 px-2">
              {Array.isArray(playlists) && playlists.length > 0 ? (
                playlists.map((playlist: Playlist) => (
                  <li key={playlist.id} className="playlist-item text-gray-custom hover:text-white text-sm py-2 px-3 cursor-pointer flex items-center">
                    <div className="w-8 h-8 rounded bg-dark-lighter flex items-center justify-center text-primary-custom mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    </div>
                    <span className="font-medium">{playlist.name}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="playlist-item text-gray-custom hover:text-white text-sm py-2 px-3 cursor-pointer flex items-center">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary-custom mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Favorites</span>
                  </li>
                  <li className="playlist-item text-gray-custom hover:text-white text-sm py-2 px-3 cursor-pointer flex items-center">
                    <div className="w-8 h-8 rounded bg-dark-lighter flex items-center justify-center text-primary-custom mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    </div>
                    <span>EDM Mix</span>
                  </li>
                  <li className="playlist-item text-gray-custom hover:text-white text-sm py-2 px-3 cursor-pointer flex items-center">
                    <div className="w-8 h-8 rounded bg-dark-lighter flex items-center justify-center text-primary-custom mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    </div>
                    <span>Chill Vibes</span>
                  </li>
                  <li className="playlist-item text-gray-custom hover:text-white text-sm py-2 px-3 cursor-pointer flex items-center">
                    <div className="w-8 h-8 rounded bg-dark-lighter flex items-center justify-center text-primary-custom mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    </div>
                    <span>Workout Beats</span>
                  </li>
                  <li className="playlist-item text-gray-custom hover:text-white text-sm py-2 px-3 cursor-pointer flex items-center">
                    <div className="w-8 h-8 rounded bg-dark-lighter flex items-center justify-center text-primary-custom mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    </div>
                    <span>Classic Rock</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
