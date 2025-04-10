import { Project } from "@/types/ProjectTypes";
import { User } from "@supabase/supabase-js";
import { Icons } from "../../icons/icons";
import { useTimeAgo } from "@/hooks/useTimeAgo";

interface ProjectListProps {
  projects: Project[];
  starredProjects: Set<string>;
  tab: 'my' | 'public' | 'earnings';
  supabaseUser: User | null;
  sortConfig: { key: keyof Project; direction: 'ascending' | 'descending' };
  handleOpenProject: (id: string) => void;
  handleEditProject: (e: React.MouseEvent, project: Project) => void;
  handleStarToggle: (id: string) => void;
  requestSort: (key: keyof Project) => void;
}

export const ProjectList = ({ 
  projects, 
  starredProjects, 
  tab, 
  supabaseUser, 
  sortConfig, 
  handleOpenProject, 
  handleEditProject, 
  handleStarToggle, 
  requestSort, 
}: ProjectListProps) => {
  const { getTimeAgo } = useTimeAgo();

  // Helper to get sort direction indicator
  const getSortDirectionIndicator = (key: keyof Project) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
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
              {tab === 'public' && (
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
              {tab === 'my' && (
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
              {tab === 'my' && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex justify-center items-center gap-1">
                    Actions
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333333] bg-[#1E1E1E]">
            {projects.map((project) => {
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
                  {tab === 'public' && (
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <span>{project.user_id !== supabaseUser?.id ? (project.user_id).slice(0, 4) + '...' + (project.user_id).slice(-4) : 'You'}</span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <span>{updatedTimeAgo}</span>
                  </td>
                  {tab === 'my' && (
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
                  {tab === 'my' && (
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
  );
};