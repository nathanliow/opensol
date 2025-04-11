import React, { useEffect, useState } from 'react';
import { Project } from '@/types/ProjectTypes';
import { Icons } from '@/components/icons/icons';
import { ProjectContent } from '@/components/dashboard/project/ProjectContent';
import { EarningsContent } from './EarningsContent';

interface DashboardContentProps {
  projects: Project[];
  searchTerm: string;
  viewMode: 'grid' | 'list';
  loading: boolean;
  tab: 'my' | 'public' | 'earnings';
  starredProjects: Set<string>;
  supabaseUser: any;
  sortConfig: { key: keyof Project; direction: 'ascending' | 'descending' };
  setSearchTerm: (term: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  handleOpenProject: (id: string) => void;
  handleEditProject: (e: React.MouseEvent, project: Project) => void;
  handleStarToggle: (id: string) => void;
  handleNewProject: () => void;
  requestSort: (key: keyof Project) => void;
}

export const DashboardContent = ({
  projects,
  searchTerm,
  viewMode,
  loading,
  tab,
  supabaseUser,
  sortConfig,
  starredProjects,
  setViewMode,
  setSearchTerm,
  handleOpenProject,
  handleEditProject,
  handleStarToggle,
  handleNewProject,
  requestSort,
}: DashboardContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(viewMode === 'grid' ? 12 : 10);

  // Reset page to 1 when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProjects.length);
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  return (
    <>
      {(tab === 'my' || tab === 'public') ? (
        <ProjectContent
          projects={paginatedProjects}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          loading={loading}
          tab={tab}
          supabaseUser={supabaseUser}
          sortConfig={sortConfig}
          requestSort={requestSort}
          handleNewProject={handleNewProject}
          handleOpenProject={handleOpenProject}
          handleEditProject={handleEditProject}
          handleStarToggle={handleStarToggle}
          starredProjects={starredProjects}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      ) : tab === 'earnings' && (
        <EarningsContent />
      )}
    </>
  );
};