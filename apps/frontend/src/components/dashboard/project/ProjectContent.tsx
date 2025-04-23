import { Icons } from "@/components/icons/icons";
import { Project } from "@/types/ProjectTypes";
import { User } from "@supabase/supabase-js";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectList } from "./ProjectList";
import { PaginationButtons } from "./PaginationButtons";

interface ProjectContentProps {
  projects: Project[];
  searchTerm: string;
  viewMode: 'grid' | 'list';
  loading: boolean;
  tab: 'my' | 'public' | 'earnings';
  supabaseUser: User | null;
  currentPage: number;
  starredProjects: Set<string>;
  sortConfig: { key: keyof Project; direction: 'ascending' | 'descending' };
  itemsPerPage: number;
  setSearchTerm: (term: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setCurrentPage: (page: number) => void;
  handleNewProject: () => void;
  handleOpenProject: (id: string) => void;
  handleEditProject: (e: React.MouseEvent, project: Project) => void;
  handleStarToggle: (id: string) => void;
  requestSort: (key: keyof Project) => void;
}

export const ProjectContent = ({ 
  projects, 
  searchTerm, 
  viewMode, 
  loading, 
  tab, 
  supabaseUser,
  currentPage,
  starredProjects,
  sortConfig,
  itemsPerPage,
  setSearchTerm, 
  setViewMode, 
  setCurrentPage,
  handleNewProject,
  handleOpenProject,
  handleEditProject,
  handleStarToggle,
  requestSort,
}: ProjectContentProps) => {
  const totalPages = Math.ceil(projects.length / itemsPerPage);

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
          {projects.length === 0 ? (
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
              ) : tab === 'my' ? (
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
            <ProjectGrid 
              projects={projects} 
              handleOpenProject={handleOpenProject} 
              handleEditProject={handleEditProject} 
              handleStarToggle={handleStarToggle} 
              starredProjects={starredProjects} 
              tab={tab} 
              supabaseUser={supabaseUser}
            />
          ) : (
            <ProjectList 
              projects={projects} 
              handleOpenProject={handleOpenProject} 
              handleEditProject={handleEditProject} 
              handleStarToggle={handleStarToggle} 
              starredProjects={starredProjects} 
              tab={tab} 
              requestSort={requestSort}
              supabaseUser={supabaseUser}
              sortConfig={sortConfig}
            />
          )}
        </>
      )}
  
      {/* Only show pagination if there are projects and more than one page */}
      {projects.length > 0 && totalPages > 1 && (
        <PaginationButtons 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
};