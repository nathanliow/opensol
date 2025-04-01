"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProjects, deleteProject, createProject, updateProject, getNumTotalProjects, getTopProjects, getStarredProjects } from '@/lib/projects';
import { Project } from '@/types/ProjectTypes';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { Icons } from '@/components/icons/icons';
import TemplateGrid from '@/components/flow-templates/TemplateGrid';
import { flowTemplates } from '@/flow-templates';
import { FlowTemplate } from '@/types/FlowTemplateTypes';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import DashboardMenu from '@/components/dashboard/DashboardMenu';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [numTotalProjects, setNumTotalProjects] = useState<number>(0);
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [starredProjects, setStarredProjects] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default 12 items for grid view
  const { supabaseUser, isConnected } = useUserAccountContext();
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'ascending' | 'descending' }>({ 
    key: 'updated_at', 
    direction: 'descending' 
  });
  // Pagination state
  
  // Navigation state
  const [navigating, setNavigating] = useState(false);
  
  // New state for project creation modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null);
  const [createStep, setCreateStep] = useState(1); // Step 1: Details, Step 2: Template selection

  // Modified state for project actions
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedProjectName, setEditedProjectName] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'delete'>('edit');

  // Stats
  const userTotalProjects = projects.length;
  const totalNodes = projects.reduce((acc, project) => acc + (project.nodes?.length || 0), 0);
  const totalEdges = projects.reduce((acc, project) => acc + (project.edges?.length || 0), 0);
  const lastUpdated = projects.length > 0 ? new Date(projects[0].updated_at || '') : null;
  
  // Use our hook at the top level
  const { getTimeAgo } = useTimeAgo();

  // New state for active tab
  const [projectsTab, setProjectsTab] = useState<'my' | 'public'>('my');

  // Use the selected tab to determine which projects to display
  const displayProjects = projectsTab === 'my' ? projects : publicProjects;

  // Update itemsPerPage when view mode changes
  useEffect(() => {
    // More items in list view, fewer in grid view
    setItemsPerPage(viewMode === 'grid' ? 12 : 10);
    setCurrentPage(1); // Reset to first page when switching views
  }, [viewMode]);

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

  // Sort projects based on current sort configuration
  const sortedProjects = [...displayProjects].sort((a, b) => {
    if (sortConfig.key === 'nodes' || sortConfig.key === 'edges') {
      const aValue = a[sortConfig.key]?.length || 0;
      const bValue = b[sortConfig.key]?.length || 0;
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string comparison safely with type checking
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === undefined && bValue === undefined) {
      return 0;
    }
    
    if (aValue === undefined) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    
    if (bValue === undefined) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Filter projects based on search term
  const filteredProjects = sortedProjects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      (project.description?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProjects.length);
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Function to change page
  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of project list
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Helper to get sort direction indicator
  const getSortDirectionIndicator = (key: keyof Project) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent card click event
    setEditingProject(project);
    setEditedProjectName(project.name);
    setModalMode('edit');
    setShowProjectModal(true);
  };
  
  const handleDeleteProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent card click event
    setEditingProject(project);
    setEditedProjectName(project.name);
    setModalMode('delete');
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

  // Project action modal for both edit and delete
  const renderProjectModal = () => {
    if (!editingProject) return null;
    
    const isEditMode = modalMode === 'edit';
    
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
        onClick={() => setShowProjectModal(false)}
      >
        <div 
          className="bg-[#1E1E1E] rounded-lg border border-[#333333] shadow-xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-[#333333] flex items-center justify-between">
            <h3 className="font-bold text-lg">
              {isEditMode ? 'Edit Project' : 'Delete Project'}
            </h3>
            <button
              onClick={() => setShowProjectModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Icons.FiX size={20} />
            </button>
          </div>
          
          <div className="p-6">
            {isEditMode ? (
              <>
                <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-300 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="editProjectName"
                  value={editedProjectName}
                  onChange={(e) => setEditedProjectName(e.target.value)}
                  className="w-full p-2.5 bg-[#252525] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 text-white mb-4"
                  autoFocus
                />
              </>
            ) : (
              <div className="text-center py-2">
                <div className="mb-4 text-red-500">
                  <Icons.FiAlertTriangle className="mx-auto" size={48} />
                </div>
                <p className="mb-2 text-lg">Are you sure you want to delete this project?</p>
                <p className="text-gray-400 mb-1">
                  <strong>{editingProject.name}</strong>
                </p>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-[#333333] flex items-center justify-between">
            <div>
              {isEditMode && (
                <button
                  onClick={() => setModalMode('delete')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
                >
                  Delete Project
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-md text-gray-300 transition-colors"
              >
                Cancel
              </button>
              {isEditMode ? (
                <button
                  onClick={saveProjectName}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                  disabled={!editedProjectName.trim()}
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={confirmDeleteProject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New Project Modal
  const renderNewProjectModal = () => {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
        onClick={() => setShowNewProjectModal(false)}
      >
        <div 
          className="bg-[#1E1E1E] rounded-lg border border-[#333333] shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-[#333333] flex items-center justify-between">
            <h3 className="font-bold text-lg">{createStep === 1 ? 'Create New Project' : 'Choose a Template'}</h3>
            <button
              onClick={() => setShowNewProjectModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Icons.FiX size={20} />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="overflow-auto p-6 flex-grow">
            {createStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                    className="w-full p-2.5 bg-[#252525] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 mb-1">
                    Description <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    id="projectDescription"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="What's this project about?"
                    rows={4}
                    className="w-full p-2.5 bg-[#252525] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 text-white resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm mb-4">
                  Choose a template to start with, or select "Blank Project" to start from scratch.
                </p>
                
                <TemplateGrid
                  templates={flowTemplates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                />
              </div>
            )}
          </div>
          
          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-[#333333] flex items-center justify-end gap-2">
            {createStep === 1 ? (
              <>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-md text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={goToNextStep}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={goToPrevStep}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-md text-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={createNewProject}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                  disabled={!selectedTemplate}
                >
                  Create Project
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
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

          {/* Tabs for my projects vs public projects */}
          <div className="flex border-b border-gray-800 mb-6">
            <button
              className={`px-4 py-2 font-medium ${projectsTab === 'my' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setProjectsTab('my')}
            >
              My Projects
            </button>
            <button
              className={`px-4 py-2 font-medium ${projectsTab === 'public' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setProjectsTab('public')}
            >
              Public Projects
            </button>
          </div>

          {/* Tab title */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white/90">
              {projectsTab === 'my' ? 'Your Projects' : 'Public Projects'}
            </h2>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.FiSearch className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#333333] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-md cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-[#1E1E1E] border-l border-t border-b border-[#333333]'}`}
                aria-label="Grid view"
              >
                <Icons.FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-md cursor-pointer ${viewMode === 'list' ? 'bg-blue-600' : 'bg-[#1E1E1E] border-r border-t border-b border-[#333333]'}`}
                aria-label="List view"
              >
                <Icons.FiList size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col py-24 items-center justify-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p>Loading projects...</p>
            </div>
          ) : (
            <>
              {paginatedProjects.length === 0 ? (
                <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] p-8 text-center">
                  {searchTerm ? (
                    <div className="py-8">
                      <Icons.FiSearch className="mx-auto text-gray-500 mb-4" size={48} />
                      <p className="text-gray-400 mb-2">No projects match your search</p>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : projectsTab === 'my' ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Icons.FiFolder className="text-gray-500 mb-4" size={48} />
                      <p className="text-gray-400 mb-4">You don't have any projects yet</p>
                      <button
                        onClick={handleNewProject}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium flex items-center gap-2"
                      >
                        <Icons.FiPlusCircle size={16} />
                        Create Your First Project
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Icons.FiGlobe className="text-gray-500 mb-4" size={48} />
                      <p className="text-gray-400 mb-4">No public projects available</p>
                    </div>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-12 py-4">
                  {paginatedProjects.map((project) => {
                    const { timeAgo, formattedDate } = getTimeAgo(project.updated_at);
                    
                    return (
                      <div 
                        key={project.id} 
                        className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#333333] shadow-lg h-full cursor-pointer hover:border-blue-500 transition-colors relative"
                        onClick={() => handleOpenProject(project.id || '')}
                      >
                        <div className="p-5">
                          <div className="mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold truncate text-lg">{project.name.length > 10 ? project.name.slice(0, 10) + '...' : project.name}</h3>
                                {projectsTab === 'my' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => handleEditProject(e, project)}
                                      className="p-2 text-gray-400 hover:text-white transition-colors"
                                      title="Edit Project"
                                    >
                                      <Icons.FiEdit2 size={18} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  project.is_public 
                                    ? 'bg-green-900/50 text-green-400 border border-green-700' 
                                    : 'text-gray-400 border border-[#333333]'
                                }`}>
                                  {project.is_public ? 'Public' : 'Private'}
                                </span>
                              </div>
                              
                            </div>
                            {projectsTab === 'public' && (
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <span className="">Creator:</span>
                                <span>{project.user_id !== supabaseUser?.id ? (project.user_id).slice(0, 4) + '...' + (project.user_id).slice(-4) : 'You'}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-12">
                            {project.description || 'No description'}
                          </p>
                          
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <Icons.FiClock size={14} className="mr-1" /> 
                              <span className="relative group">
                                <span className="group-hover:hidden">Updated {timeAgo}</span>
                                <span className="hidden group-hover:inline">{formattedDate}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Icons.FiBox size={14} className="text-green-500" />
                              {project.nodes?.length || 0} Nodes
                            </div>
                            <div className="flex items-center gap-1">
                              <Icons.FiGitCommit size={14} className="text-purple-500" />
                              {project.edges?.length || 0} Edges
                            </div>
                            {supabaseUser && (
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleStarToggle(project.id || '');
                                  }}
                                  className="flex items-center justify-center cursor-pointer rounded-full transition-colors group"
                                >
                                  <Icons.FiStar
                                    className={`w-5 h-5 ${
                                      starredProjects.has(project.id || '')
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-400 group-hover:text-yellow-400'
                                    }`}
                                  />
                                  <span className={`ml-1 text-sm ${starredProjects.has(project.id || '') ? 'text-yellow-400' : 'text-gray-400 group-hover:text-yellow-400'}`}>
                                    {project.stars || 0}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] overflow-hidden shadow-lg mx-12 my-10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#333333]">
                      <thead className="bg-[#252525]">
                        <tr>
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('name')}
                          >
                            <div className="flex items-center gap-1">
                              Project Name
                              <span className="text-gray-500">{getSortDirectionIndicator('name')}</span>
                            </div>
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('created_at')}
                          >
                            <div className="flex items-center gap-1">
                              Created
                              <span className="text-gray-500">{getSortDirectionIndicator('created_at')}</span>
                            </div>
                          </th>
                          {projectsTab === 'public' && (
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                              onClick={() => requestSort('created_at')}
                            >
                              <div className="flex items-center gap-1">
                                Creator
                                <span className="text-gray-500">{getSortDirectionIndicator('created_at')}</span>
                              </div>
                            </th>
                          )}
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('updated_at')}
                          >
                            <div className="flex items-center gap-1">
                              Updated
                              <span className="text-gray-500">{getSortDirectionIndicator('updated_at')}</span>
                            </div>
                          </th>
                          {projectsTab === 'my' && (
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                              onClick={() => requestSort('is_public')}
                            >
                              <div className="flex items-center gap-1">
                                Visibility
                                <span className="text-gray-500">{getSortDirectionIndicator('is_public')}</span>
                              </div>
                            </th>
                          )}
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('nodes')}
                          >
                            <div className="flex items-center gap-1">
                              Nodes
                              <span className="text-gray-500">{getSortDirectionIndicator('nodes')}</span>
                            </div>
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('edges')}
                          >
                            <div className="flex items-center gap-1">
                              Edges
                              <span className="text-gray-500">{getSortDirectionIndicator('edges')}</span>
                            </div>
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort('stars')}
                          >
                            <div className="flex items-center gap-1">
                              Stars
                              <span className="text-gray-500">{getSortDirectionIndicator('stars')}</span>
                            </div>
                          </th>
                          {projectsTab === 'my' && (
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                              <div className="flex justify-center items-center gap-1">
                                Actions
                              </div>
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#333333] bg-[#1E1E1E]">
                        {paginatedProjects.map((project) => {
                          const { timeAgo: createdTimeAgo, formattedDate: createdFormattedDate } = getTimeAgo(project.created_at);
                          const { timeAgo: updatedTimeAgo, formattedDate: updatedFormattedDate } = getTimeAgo(project.updated_at);
                          
                          return (
                            <tr 
                              key={project.id} 
                              className="hover:bg-[#292929] transition-colors cursor-pointer"
                              onClick={() => handleOpenProject(project.id || '')}
                            >
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium">{project.name}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                <span 
                                  className="relative group"
                                >
                                  <span className="group-hover:hidden">{createdFormattedDate}</span>
                                  <span className="hidden group-hover:inline">{createdTimeAgo}</span>
                                </span>
                              </td>
                              {projectsTab === 'public' && (
                                <td className="px-6 py-4 text-sm text-gray-300">
                                  <span>{project.user_id !== supabaseUser?.id ? (project.user_id).slice(0, 4) + '...' + (project.user_id).slice(-4) : 'You'}</span>
                                </td>
                              )}
                              <td className="px-6 py-4 text-sm text-gray-300">
                                <span>{updatedTimeAgo}</span>
                              </td>
                              {projectsTab === 'my' && (
                                <td className="px-6 py-4 text-sm text-gray-300">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    project.is_public 
                                      ? 'bg-green-900/50 text-green-400 border border-green-700' 
                                      : 'text-gray-400 border border-[#333333]'
                                  }`}>
                                    {project.is_public ? 'Public' : 'Private'}
                                  </span>
                                </td>
                              )}
                              <td className="px-6 py-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <Icons.FiBox size={14} className="text-green-500" />
                                  <span>{project.nodes?.length || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <Icons.FiGitMerge size={14} className="text-purple-500" />
                                  <span>{project.edges?.length || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center justify-center">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleStarToggle(project.id || '');
                                      }}
                                      className="flex items-center justify-center cursor-pointer rounded-full transition-colors group"
                                    >
                                      <Icons.FiStar
                                        className={`w-4 h-4 ${
                                          starredProjects.has(project.id || '')
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-400 group-hover:text-yellow-400'
                                        }`}
                                      />
                                      <span className={`ml-1 text-sm ${starredProjects.has(project.id || '') ? 'text-yellow-400' : 'text-gray-400 group-hover:text-yellow-400'}`}>
                                        {project.stars || 0}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                              {projectsTab === 'my' && (
                                <td className="px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-center items-center">
                                    <button
                                      onClick={(e) => handleEditProject(e, project)}
                                      className="text-blue-500 hover:text-blue-400 p-1 rounded-md hover:bg-blue-500 hover:bg-opacity-10 transition-colors"
                                      title="Edit Project"
                                    >
                                      <Icons.FiEdit2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Only show pagination if there are projects and more than one page */}
          {filteredProjects.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-1 bg-[#1E1E1E] rounded-md shadow-lg p-1">
                <button
                  onClick={() => changePage(1)}
                  className={`px-3 py-1.5 ${currentPage === 1 ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">First</span>
                  <span aria-hidden="true">&laquo;</span>
                </button>
                
                <button
                  onClick={() => changePage(currentPage - 1)}
                  className={`px-3 py-1.5 ${currentPage === 1 ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <span aria-hidden="true">&lsaquo;</span>
                </button>
                
                {/* Render page numbers with proper spacing between */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1;
                  // Always show first page, last page, current page, and one page before/after current
                  const shouldShowPageNumber = 
                    pageNum === 1 || 
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                  
                  // Only show ellipsis if there's a gap
                  const shouldShowEllipsisBefore = pageNum === currentPage - 1 && currentPage > 3;
                  const shouldShowEllipsisAfter = pageNum === currentPage + 1 && currentPage < totalPages - 2;
                  
                  if (shouldShowPageNumber) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => changePage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-white hover:bg-[#2D2D2D]'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (shouldShowEllipsisBefore) {
                    return <span key={`ellipsis-before-${pageNum}`} className="px-1 text-gray-500">...</span>;
                  } else if (shouldShowEllipsisAfter) {
                    return <span key={`ellipsis-after-${pageNum}`} className="px-1 text-gray-500">...</span>;
                  }
                  
                  // Don't render this page number
                  return null;
                })}
                
                <button
                  onClick={() => changePage(currentPage + 1)}
                  className={`px-3 py-1.5 ${currentPage === totalPages ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Next</span>
                  <span aria-hidden="true">&rsaquo;</span>
                </button>
                
                <button
                  onClick={() => changePage(totalPages)}
                  className={`px-3 py-1.5 ${currentPage === totalPages ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Last</span>
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* New Project Modal */}
      {showNewProjectModal && renderNewProjectModal()}
      
      {/* Project Action Modal (Edit/Delete) */}
      {showProjectModal && renderProjectModal()}
    </>
  );
}
