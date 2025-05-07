import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Player } from "@/components/layout/player";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Request from "@/pages/request";
import Search from "@/pages/search";
import Library from "@/pages/library";
import { useState } from "react";
import { PlayerProvider } from "@/hooks/use-player";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/library" component={Library} />
      <Route path="/request" component={Request} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <TooltipProvider>
          <div className="flex h-screen overflow-hidden bg-dark text-white">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto">
                <Router />
              </main>
              <Player />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </PlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
