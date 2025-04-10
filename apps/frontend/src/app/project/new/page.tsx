"use client";

import { useState, useEffect } from 'react';
import { createProject } from '@/lib/projects';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import Canvas from '@/components/canvas/Canvas';
import { usePrivy } from '@privy-io/react-auth';
import { LoadingAnimation } from '@/components/loading/LoadingAnimation';

export default function NewProjectPage() {
  const [projectName, setProjectName] = useState('Untitled Project');
  const [showNameInput, setShowNameInput] = useState(true);
  const { supabaseUser, isConnected, login, isLoading } = useUserAccountContext();
  const { ready, authenticated } = usePrivy();

  // Use direct navigation to avoid Next.js router issues
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Check authentication status
  useEffect(() => {
    // Wait until Privvy is ready
    if (!ready) return;
    
    // If not authenticated, no need to do anything as the UI will show login
    if (!authenticated || !isConnected) return;
    
    // If connected but no supabaseUser after a delay, redirect to home
    if (!supabaseUser && !isLoading) {
      const timeoutId = setTimeout(() => {
        if (!supabaseUser) {
          navigateTo('/');
        }
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [ready, authenticated, isConnected, supabaseUser, isLoading]);

  const handleCreateProject = async () => {
    if (!supabaseUser) {
      alert('Please log in to create a project');
      return;
    }

    try {
      // Create a new project with empty nodes and edges
      const newProject = await createProject({
        name: projectName,
        description: '',
        nodes: [],
        edges: [],
        user_id: supabaseUser.id,
        stars: 0
      });

      // Navigate to the new project
      navigateTo(`/project/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  if (!ready || isLoading) {
    return (
      <LoadingAnimation message="Loading..." />
    );
  }

  if (!isConnected || !authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">Please connect your wallet to create a project.</p>
          <button
            onClick={login}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {showNameInput ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
            <div className="mb-4">
              <label htmlFor="projectName" className="block text-sm font-medium mb-1">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter project name"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
              >
                Create Project
              </button>
              <button
                onClick={() => setShowNameInput(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium"
              >
                Start Building
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-screen h-screen">
          <Canvas />
        </div>
      )}
    </div>
  );
}
