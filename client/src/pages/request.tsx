import { RequestForm } from "@/components/music/request-form";
import { Card, CardContent } from "@/components/ui/card";

export default function Request() {
  return (
    <div className="bg-gradient-custom p-6 min-h-screen overflow-y-auto custom-scrollbar">
      {/* Header with spotlight effect */}
      <header className="mb-10 relative">
        <div className="absolute top-0 left-0 w-full h-60 bg-gradient-to-br from-accent/20 to-primary/5 rounded-3xl opacity-30 blur-3xl -z-10"></div>
        <div className="slide-up">
          <h1 className="text-3xl font-bold text-white mb-3 font-outfit">Request a Song</h1>
          <p className="text-gray-custom max-w-xl">
            Add music to the queue by providing a YouTube URL or use the IRC bot with the !request command.
          </p>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        {/* Request Form Card */}
        <div className="lg:w-3/5 fade-in">
          <div className="glass-effect rounded-xl overflow-hidden shadow-custom">
            <div className="bg-dark-lighter/50 border-b border-gray-700/30 px-6 py-4">
              <h2 className="text-xl font-semibold text-white font-outfit flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-custom mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Song Request Form
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-custom mb-6">
                Enter a YouTube URL or video ID to add a song to the queue. Our system will automatically extract the audio.
              </p>
              
              <RequestForm />
            </div>
          </div>
        </div>
        
        {/* IRC Bot Info Card */}
        <div className="lg:w-2/5 slide-up">
          <div className="glass-effect rounded-xl overflow-hidden shadow-custom h-full">
            <div className="bg-dark-lighter/50 border-b border-gray-700/30 px-6 py-4">
              <h2 className="text-xl font-semibold text-white font-outfit flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                IRC Bot
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-custom">
                  You can also request songs through our IRC bot by typing the following command in the IRC channel:
                </p>
                
                <div className="bg-gradient-to-r from-dark-lighter to-dark border border-gray-700/30 p-4 rounded-lg font-mono text-primary-custom mb-4 overflow-x-auto">
                  <span className="text-accent font-bold">!</span>request [song name or YouTube URL]
                </div>
                
                <div className="bg-dark-lighter/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2 text-sm">Connection Details</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-custom">Server:</span>
                    <span className="text-white col-span-2 font-mono">irc.libera.chat</span>
                    
                    <span className="text-gray-custom">Port:</span>
                    <span className="text-white col-span-2 font-mono">6667 (or 6697 for SSL)</span>
                    
                    <span className="text-gray-custom">Channel:</span>
                    <span className="text-white col-span-2 font-mono">#soundstream</span>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-4 border-l-2 border-primary">
                  <p className="text-xs text-gray-custom">
                    <span className="text-primary-custom font-semibold">Tip:</span> The bot will announce when your requested song is added to the queue and when it starts playing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
