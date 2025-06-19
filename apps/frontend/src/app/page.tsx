"use client";

import Canvas from '@/components/canvas/Canvas';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';
import BlockchainAnimation from '@/components/animations/BlockchainAnimation';
import { LoadingAnimation } from '@/components/loading/LoadingAnimation';

export default function Home() {
  const { isConnected, isLoading } = useUserAccountContext();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem('hasVisitedOpenSOL');
    const firstVisit = !hasVisited;
    setIsFirstVisit(firstVisit);
    
    if (isConnected || !firstVisit) {
      setShowCanvas(true);
    }
  }, [isConnected]);

  const handleLaunchApp = () => {
    localStorage.setItem('hasVisitedOpenSOL', 'true');
    setIsFirstVisit(false);
    setShowCanvas(true);
  };

  // Show canvas if user should see it
  if (showCanvas || (isFirstVisit === false)) {
    return (
      <div className="w-screen h-screen">
        <Canvas />
      </div>
    );
  }

  // Show loading state while checking first visit
  if (isFirstVisit === null) {
    return (
      <LoadingAnimation message="Loading..."/>
    );
  }

  const phrases = [
    "A no-code solution for building on Solana",
    "Scratch for Solana", 
    "Use nodes and edges to create Solana dApps",
    "Visualize your Solana program"
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative overflow-hidden">
      <BlockchainAnimation />
      <div className="text-center max-w-md px-4 z-10 relative">
        <h1 className="text-4xl font-bold mb-6">Welcome to openSOL</h1>
        <div className="text-lg mb-8">
          {isLoading ? (
            "Loading..."
          ) : (
            <Typewriter
              options={{
                strings: phrases,
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 30,
              }}
            />
          )}
        </div>
        <div className="flex flex-row items-center justify-center gap-4">
          <button
            onClick={handleLaunchApp}
            className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg"
          >
            Start Building →
          </button>
          <button
            onClick={() => window.open('https://opensol-2.gitbook.io/opensol', '_blank')}
            className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg"
          >
            Documentation →
          </button>
        </div>
      </div>
    </div>
  );
}
