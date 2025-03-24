"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProjects, Project, deleteProject, createProject } from '@/lib/projects';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { format } from 'date-fns';
import { Icons } from '@/components/icons/icons';
import LoadingAnimation from '@/components/loading/LoadingAnimation';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { templates, FlowTemplate } from '@/templates';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'ascending' | 'descending' }>({ 
    key: 'updated_at', 
    direction: 'descending' 
  });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); // Default 9 items for grid view
  const { supabaseUser, isConnected } = useUserAccountContext();
  const router = useRouter();
  
  // Navigation state
  const [navigating, setNavigating] = useState(false);
  
  // New state for project creation modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null);
  const [createStep, setCreateStep] = useState(1); // Step 1: Details, Step 2: Template selection

  // Stats
  const totalProjects = projects.length;
  const totalNodes = projects.reduce((acc, project) => acc + (project.nodes?.length || 0), 0);
  const totalEdges = projects.reduce((acc, project) => acc + (project.edges?.length || 0), 0);
  const lastUpdated = projects.length > 0 ? new Date(projects[0].updated_at || '') : null;

  // Update itemsPerPage when view mode changes
  useEffect(() => {
    // More items in list view, fewer in grid view
    setItemsPerPage(viewMode === 'grid' ? 9 : 10);
    setCurrentPage(1); // Reset to first page when switching views
  }, [viewMode]);

  useEffect(() => {
    if (!supabaseUser) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const projectData = await getUserProjects(supabaseUser.id);
        setProjects(projectData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [supabaseUser]);

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteProject(id);
      // If the deleted project is the current one in localStorage, remove it
      if (localStorage.getItem('currentProjectId') === id) {
        localStorage.removeItem('currentProjectId');
      }
      // Update the projects list
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleOpenProject = (id: string) => {
    // Show loading animation
    setNavigating(true);
    
    // Save project ID to localStorage
    localStorage.setItem('currentProjectId', id);
    
    // Use Next.js router instead of window.location
    // Short delay to allow loading animation to show
    setTimeout(() => {
      router.push('/');
    }, 300);
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
        user_id: supabaseUser.id
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

  // Format date nicely with fallback
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get project initial letter for avatar
  const getProjectInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Generate a consistent color for each project
  const getProjectColor = (id: string) => {
    // List of tailwind-like colors that stand out well on dark backgrounds
    const colors = [
      'bg-blue-500', // blue
      'bg-green-500', // green
      'bg-purple-500', // purple
      'bg-amber-500', // amber/orange
      'bg-red-500', // red
      'bg-cyan-500', // cyan
      'bg-pink-500', // pink
      'bg-teal-500', // teal
    ];
    
    // Use the first letter of the id to pick a consistent color
    const index = id ? (id.charCodeAt(0) + (id.charCodeAt(1) || 0)) % colors.length : 0;
    return colors[index];
  };

  // Sort projects based on current sort configuration
  const sortedProjects = [...projects].sort((a, b) => {
    if (sortConfig.key === 'nodes' || sortConfig.key === 'edges') {
      const aValue = a[sortConfig.key]?.length || 0;
      const bValue = b[sortConfig.key]?.length || 0;
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
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

  // New Project Modal
  const renderNewProjectModal = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
        <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
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
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                />
              </div>
            )}
          </div>
          
          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-[#333333] flex items-center justify-between">
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

  if (navigating) {
    return <LoadingAnimation message="Loading project..." />;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Please log in</h1>
        <p className="mb-4">You need to connect your wallet to view your projects.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingAnimation message="Loading projects..." />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#121212] text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Icons.FiFolder size={20} />
              <h1 className="text-2xl font-bold">Projects Dashboard</h1>
            </div>
            <button 
              onClick={handleNewProject}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium flex items-center gap-2"
            >
              <Icons.FiPlusCircle size={18} />
              New Project
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-[#333333] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
                  <Icons.FiFolder className="text-blue-500" size={20} />
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold">{totalProjects}</h2>
                  <p className="text-xs text-gray-400 mt-1">Total projects</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-[#333333] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <Icons.FiBox className="text-green-500" size={20} />
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold">{totalNodes}</h2>
                  <p className="text-xs text-gray-400 mt-1">Active nodes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-[#333333] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center">
                  <Icons.FiGitMerge className="text-purple-500" size={20} />
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold">{totalEdges}</h2>
                  <p className="text-xs text-gray-400 mt-1">Total connections</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-[#333333] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-amber-500 bg-opacity-20 flex items-center justify-center">
                  <Icons.FiClock className="text-amber-500" size={20} />
                </div>
                <div className="text-right">
                  <h2 className="text-md font-bold">{lastUpdated ? format(new Date(lastUpdated.toISOString()), 'MMM d, yyyy') : 'Never'}</h2>
                  <h3 className="text-sm">{lastUpdated ? format(new Date(lastUpdated.toISOString()), 'h:mm a') : ''}</h3>
                  <p className="text-xs text-gray-400 mt-1">Last activity</p>
                </div>
              </div>
            </div>
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
                className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-[#1E1E1E] border-l border-t border-b border-[#333333]'}`}
                aria-label="Grid view"
              >
                <Icons.FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-blue-600' : 'bg-[#1E1E1E] border-r border-t border-b border-[#333333]'}`}
                aria-label="List view"
              >
                <Icons.FiList size={18} />
              </button>
            </div>
          </div>

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
              ) : (
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
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#333333] shadow-lg h-full"
                >
                  <div className={`h-2 w-full ${getProjectColor(project.id || '')}`}></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center text-lg font-semibold">
                          {getProjectInitial(project.name)}
                        </div>
                        <h3 className="font-bold truncate text-lg">{project.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenProject(project.id || '')}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="Open Project"
                        >
                          <Icons.FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id || '')}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Project"
                        >
                          <Icons.FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-12">
                      {project.description || 'No description'}
                    </p>
                    
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center">
                        <Icons.FiClock size={14} className="mr-1" /> Updated {formatDate(project.updated_at)}
                      </div>
                    </div>
                    
                    <div className="flex mt-4 gap-3">
                      <div className="bg-[#252525] py-1.5 px-3 rounded text-sm flex items-center">
                        <Icons.FiBox size={12} className="text-green-500 mr-2" />
                        {project.nodes?.length || 0} Nodes
                      </div>
                      <div className="bg-[#252525] py-1.5 px-3 rounded text-sm flex items-center">
                        <Icons.FiGitMerge size={12} className="text-purple-500 mr-2" />
                        {project.edges?.length || 0} Edges
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] overflow-hidden shadow-lg">
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Description
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
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333] bg-[#1E1E1E]">
                    {paginatedProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-[#292929] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#252525] flex items-center justify-center font-medium">
                              {getProjectInitial(project.name)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{project.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="text-sm text-gray-300 line-clamp-2">{project.description || 'No description'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDate(project.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDate(project.updated_at)}
                        </td>
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
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenProject(project.id || '')}
                              className="text-blue-500 hover:text-blue-400 p-1 rounded-md hover:bg-blue-500 hover:bg-opacity-10 transition-colors"
                              title="Open Project"
                            >
                              <Icons.FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id || '')}
                              className="text-red-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500 hover:bg-opacity-10 transition-colors"
                              title="Delete Project"
                            >
                              <Icons.FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
    </>
  );
}
