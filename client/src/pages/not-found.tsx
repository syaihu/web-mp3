import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-custom overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 opacity-30 blur-3xl"></div>
      
      <div className="glass-effect rounded-xl shadow-custom p-8 w-full max-w-md mx-4 relative z-10 fade-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-dark-lighter flex items-center justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-primary-custom" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-outfit">404 Not Found</h1>
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mb-4"></div>
          <p className="text-gray-custom">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white rounded-lg py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Home
            </Button>
          </Link>
          
          <Link href="/search">
            <Button variant="outline" className="w-full border-gray-700 text-gray-custom hover:bg-dark-lighter hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search for Music
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
