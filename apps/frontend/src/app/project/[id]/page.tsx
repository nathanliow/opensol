"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '@/lib/projects';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import Canvas from '@/components/canvas/Canvas';
import { usePrivy } from '@privy-io/react-auth';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { supabaseUser, isConnected, login, isLoading } = useUserAccountContext();
  const { ready, authenticated } = usePrivy();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    // Wait until both Privvy and our context are ready
    if (!ready) return;

    // If not connected after Privvy is ready, user needs to login
    if (ready && !authenticated) {
      setLoading(false);
      return;
    }

    // If still loading authentication data, keep waiting
    if (isLoading) return;

    // If we're connected but don't have supabaseUser yet, redirect to home
    if (!supabaseUser) {
      // Give a bit of time for auth to settle, then redirect if needed
      const timeoutId = setTimeout(() => {
        if (!supabaseUser) {
          console.log('No Supabase user available after timeout, redirecting to home');
          window.location.href = '/';
        }
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }

    if (!projectId) {
      setError('Invalid project ID');
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const projectData = await getProject(projectId);
        
        // Check if the project belongs to the current user
        if (projectData.user_id !== supabaseUser?.id) {
          setError('You do not have permission to view this project');
          setLoading(false);
          return;
        }
        
        setProject(projectData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project. It may have been deleted or you may not have permission to view it.');
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, supabaseUser, isConnected, ready, authenticated, isLoading, router]);

  if (!ready || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (!authenticated || !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">Please connect your wallet to view this project.</p>
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-red-900/30 p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/projects'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="mb-6">The project you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => window.location.href = '/projects'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Canvas projectId={projectId} initialProjectData={{
        nodes: project.nodes,
        edges: project.edges
      }} />
    </div>
  );
}
