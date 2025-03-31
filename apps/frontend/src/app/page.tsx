"use client";

import Canvas from '@/components/canvas/Canvas';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { Icons } from '@/components/icons/icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Typewriter from 'typewriter-effect';
import BlockchainAnimation from '@/components/animations/BlockchainAnimation';

export default function Home() {
  const { isConnected, login, supabaseUser, isLoading } = useUserAccountContext();

  // Handle scroll for navbar transparency
  useEffect(() => {
    // This empty effect helps ensure Privvy is initialized properly
    // before we try to render any authenticated content
  }, []);

  // If connected, render the Canvas component which handles project loading from localStorage
  if (isConnected) {
    return (
      <div className="w-screen h-screen">
        <Canvas />
      </div>
    );
  }

  const phrases = [
    "A no-code solution for building on Solana",
    "Scratch for Solana",
    "Use nodes and edges to create Solana dApps",
    "Visualize your Solana program"
  ]

  // If not connected, show login page
  if (!isConnected) {
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
          {/* <p className="text-lg mb-8">A no-code solution for building on Solana</p> */}
          <div className="flex flex-row items-center justify-center gap-4">
            <button
              onClick={login}
              className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg"
            >
              Start Building →
            </button>
            <button
              onClick={() => window.open('https://docs.opensol.xyz', '_blank')}
              className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg"
            >
              Documentation →
            </button>
          </div>
        </div>
      </div>
    );
  }
}
