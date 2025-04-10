"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProjects, deleteProject, createProject, updateProject, getNumTotalProjects, getTopProjects, getStarredProjects } from '@/lib/projects';
import { Project } from '@/types/ProjectTypes';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { Icons } from '@/components/icons/icons';
import { DashboardMenu } from '@/components/dashboard/DashboardMenu';
import { ProjectModal } from '@/components/modal/ProjectModal';
import { NewProjectModal } from '@/components/modal/NewProjectModal';
import { DashboardTabs } from './DashboardTabs';
import { DashboardContent } from './DashboardContent';
import { flowTemplates } from '@/flow-templates';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [numTotalProjects, setNumTotalProjects] = useState<number>(0);
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [starredProjects, setStarredProjects] = useState<Set<string>>(new Set());
  const { supabaseUser, isConnected } = useUserAccountContext();
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'ascending' | 'descending' }>({ 
    key: 'updated_at', 
    direction: 'descending' 
  });
  
  // Navigation state
  const [navigating, setNavigating] = useState(false);
  
  // New state for project creation modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [createStep, setCreateStep] = useState(1); // Step 1: Details, Step 2: Template selection

  // Modified state for project actions
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedProjectName, setEditedProjectName] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'delete'>('edit');

  // New state for active tab
  const [projectsTab, setProjectsTab] = useState<'my' | 'public'>('my');

  // Use the selected tab to determine which projects to display
  const displayProjects = projectsTab === 'my' ? projects : publicProjects;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Only fetch user's projects if the user is logged in
        if (supabaseUser && supabaseUser.id) {
          // Fetch user's projects
          const userProjects = await getUserProjects(supabaseUser.id);
          setProjects(userProjects);
          
          // Get project statistics
          const numProjects = await getNumTotalProjects();
          setNumTotalProjects(typeof numProjects === 'number' ? numProjects : 0);
          
          // Get top projects
          const popularProjects = await getTopProjects();
          setTopProjects(popularProjects);
        } else {
          // Clear projects array if not logged in
          setProjects([]);
        }
        
        // Fetch public projects (can be done without login)
        const response = await fetch('/api/projects/public');
        if (response.ok) {
          const data = await response.json();
          setPublicProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [supabaseUser, isConnected]);

  useEffect(() => {
    const loadStarredProjects = async () => {
      if (!supabaseUser) return;
      try {
        const starredIds = await getStarredProjects(supabaseUser.id);
        setStarredProjects(new Set(starredIds));
      } catch (error) {
        console.error('Error loading starred projects:', error);
      }
    };

    loadStarredProjects();
  }, [supabaseUser]);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleOpenProject = (id: string) => {    
    // Save project ID to localStorage
    localStorage.setItem('currentProjectId', id);

    router.push('/');
  };

  const handleNewProject = () => {
    // Reset form state
    setNewProjectName('');
    setNewProjectDescription('');
    setSelectedTemplate(null);
    setCreateStep(1);
    
    // Show the new project modal
    setShowNewProjectModal(true);
  };
  
  const goToNextStep = () => {
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    setCreateStep(2);
  };
  
  const goToPrevStep = () => {
    setCreateStep(1);
  };
  
  const createNewProject = async () => {
    if (!supabaseUser) {
      alert('Please log in to create a project');
      return;
    }
    
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    
    try {
      // Show loading animation
      setNavigating(true);
      
      // First clear any existing content by removing currentProjectId
      localStorage.removeItem('currentProjectId');
      
      // Get nodes and edges from selected template or use empty arrays
      const nodes = selectedTemplate?.nodes || [];
      const edges = selectedTemplate?.edges || [];
      
      // Create a new project with template data if available
      const newProject = await createProject({
        name: newProjectName,
        description: newProjectDescription,
        nodes: nodes,
        edges: edges,
        user_id: supabaseUser.id,
        stars: 0
      });
      
      // Save project ID to localStorage
      localStorage.setItem('currentProjectId', newProject.id);
      
      // Close modal
      setShowNewProjectModal(false);
      
      // Reset form
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedTemplate(null);
      setCreateStep(1);
      
      // Force refresh and navigate to home page
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
      setNavigating(false); // Stop loading animation on error
    }
  };

  // Handle sorting when a column header is clicked
  const requestSort = (key: keyof Project) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent card click event
    setEditingProject(project);
    setEditedProjectName(project.name);
    setModalMode('edit');
    setShowProjectModal(true);
  };
  
  const saveProjectName = async () => {
    if (!editingProject || !editedProjectName.trim()) return;
    
    try {
      // Call your API to update the project name
      const updatedProject = await updateProject(editingProject.id!, {
        name: editedProjectName.trim()
      });
      
      // Update the projects list
      setProjects(projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      ));
      
      // Close the modal
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project name:', error);
      alert('Failed to update project name. Please try again.');
    }
  };
  
  const confirmDeleteProject = async () => {
    if (!editingProject) return;
    
    try {
      await deleteProject(editingProject.id!);
      // If the deleted project is the current one in localStorage, remove it
      if (localStorage.getItem('currentProjectId') === editingProject.id) {
        localStorage.removeItem('currentProjectId');
      }
      // Update the projects list
      setProjects(projects.filter(p => p.id !== editingProject.id));
      // Close the modal
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Handle star toggle
  const handleStarToggle = async (projectId: string) => {
    if (!supabaseUser) return;

    try {
      console.log('Toggling star for project:', projectId);
      
      // Optimistically update UI
      const isCurrentlyStarred = starredProjects.has(projectId);
      
      // Update local state immediately for better UX
      setStarredProjects(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyStarred) {
          newSet.delete(projectId);
        } else {
          newSet.add(projectId);
        }
        return newSet;
      });

      // Update UI with optimistic star count
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, stars: Math.max(0, (p.stars || 0) + (isCurrentlyStarred ? -1 : 1)) }
            : p
        )
      );

      setPublicProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, stars: Math.max(0, (p.stars || 0) + (isCurrentlyStarred ? -1 : 1)) }
            : p
        )
      );
      
      // Make the API call
      const response = await fetch(`/api/projects/${projectId}/toggle-star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { stars, hasStarred } = await response.json();
        console.log('Star toggled successfully:', { stars, hasStarred });
        
        // Update with actual values from server
        setProjects(prev =>
          prev.map(p =>
            p.id === projectId
              ? { ...p, stars }
              : p
          )
        );

        setPublicProjects(prev =>
          prev.map(p =>
            p.id === projectId
              ? { ...p, stars }
              : p
          )
        );
        
        // Also update top projects list if needed
        setTopProjects(prev =>
          prev.map(p =>
            p.id === projectId
              ? { ...p, stars }
              : p
          )
        );
      } else {
        // Revert optimistic update if API call failed
        console.error('Failed to toggle star:', await response.text());
        
        setStarredProjects(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyStarred) {
            newSet.add(projectId);
          } else {
            newSet.delete(projectId);
          }
          return newSet;
        });
        
        // Revert optimistic star count update
        setProjects(prev =>
          prev.map(p =>
            p.id === projectId
              ? { ...p, stars: (p.stars || 0) + (isCurrentlyStarred ? 1 : -1) }
              : p
          )
        );

        setPublicProjects(prev =>
          prev.map(p =>
            p.id === projectId
              ? { ...p, stars: (p.stars || 0) + (isCurrentlyStarred ? 1 : -1) }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#121212] text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleNewProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium flex items-center gap-2"
              >
                <Icons.FiPlusCircle size={18} />
                New Project
              </button>
              <DashboardMenu onNewProject={handleNewProject} />
            </div>
          </div>

          {/* Dashboard Tabs */}
          <DashboardTabs 
            projectsTab={projectsTab} 
            setProjectsTab={setProjectsTab} 
          />

          {/* Dashboard Content */}
          <DashboardContent
            projects={displayProjects}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            loading={loading}
            projectsTab={projectsTab}
            handleOpenProject={handleOpenProject}
            handleEditProject={handleEditProject}
            handleStarToggle={handleStarToggle}
            starredProjects={starredProjects}
            handleNewProject={handleNewProject}
            supabaseUser={supabaseUser}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        </div>
      </div>
      
      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        newProjectDescription={newProjectDescription}
        setNewProjectDescription={setNewProjectDescription}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        createStep={createStep}
        goToNextStep={goToNextStep}
        goToPrevStep={goToPrevStep}
        createNewProject={createNewProject}
        templates={flowTemplates}
      />
      
      {/* Project Action Modal (Edit/Delete) */}
      {editingProject && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          editingProject={editingProject}
          editedProjectName={editedProjectName}
          setEditedProjectName={setEditedProjectName}
          modalMode={modalMode}
          setModalMode={setModalMode}
          saveProjectName={saveProjectName}
          confirmDeleteProject={confirmDeleteProject}
        />
      )}
    </>
  );
}
