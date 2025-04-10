import React, { useEffect, useState } from 'react';
import { Project } from '@/types/ProjectTypes';
import { Icons } from '@/components/icons/icons';
import { useTimeAgo } from '@/hooks/useTimeAgo';

interface DashboardContentProps {
  projects: Project[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  loading: boolean;
  projectsTab: 'my' | 'public';
  handleOpenProject: (id: string) => void;
  handleEditProject: (e: React.MouseEvent, project: Project) => void;
  handleStarToggle: (id: string) => void;
  starredProjects: Set<string>;
  handleNewProject: () => void;
  supabaseUser: any;
  sortConfig: { key: keyof Project; direction: 'ascending' | 'descending' };
  requestSort: (key: keyof Project) => void;
}

export const DashboardContent = ({
  projects,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  loading,
  projectsTab,
  handleOpenProject,
  handleEditProject,
  handleStarToggle,
  starredProjects,
  handleNewProject,
  supabaseUser,
  sortConfig,
  requestSort
}: DashboardContentProps) => {
  const { getTimeAgo } = useTimeAgo();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(viewMode === 'grid' ? 12 : 10);

  // Reset page to 1 when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [projectsTab]);

  // Update itemsPerPage when view mode changes
  useEffect(() => {
    // More items in list view, fewer in grid view
    setItemsPerPage(viewMode === 'grid' ? 12 : 10);
    setCurrentPage(1); // Reset to first page when switching views
  }, [viewMode]);

  // Sort projects based on current sort configuration
  const sortedProjects = [...projects].sort((a, b) => {
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

  // Helper to get sort direction indicator
  const getSortDirectionIndicator = (key: keyof Project) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <>
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
    </>
  );
};