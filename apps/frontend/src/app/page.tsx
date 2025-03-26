"use client";

import Canvas from '@/components/canvas/Canvas';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { useEffect } from 'react';

export default function Home() {
  const { isConnected, login, supabaseUser, isLoading } = useUserAccountContext();

  // Pre-load the Privvy auth system
  useEffect(() => {
    // This empty effect helps ensure Privvy is initialized properly
    // before we try to render any authenticated content
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not connected, show login page
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold mb-6">Welcome to OpenSOL</h1>
          <p className="text-lg mb-8">Connect your wallet to create and manage visual programming flows for blockchain data.</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // If connected, render the Canvas component which handles project loading from localStorage
  return (
    <div className="w-screen h-screen">
      <Canvas />
    </div>
  );
}
