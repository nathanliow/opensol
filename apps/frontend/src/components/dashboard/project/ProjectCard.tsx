import { Icons } from "../../icons/icons";
import { Project } from "@/types/ProjectTypes";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { User } from "@supabase/supabase-js";

interface ProjectCardProps {
  project: Project;
  starredProjects: Set<string>;
  tab: 'my' | 'public' | 'earnings';
  supabaseUser: User | null;
  handleOpenProject: (id: string) => void;
  handleEditProject: (e: React.MouseEvent, project: Project) => void;
  handleStarToggle: (id: string) => void;
}

export const ProjectCard = ({ 
  project, 
  starredProjects, 
  tab, 
  supabaseUser,
  handleOpenProject, 
  handleEditProject, 
  handleStarToggle
}: ProjectCardProps) => {
  const { getTimeAgo } = useTimeAgo();
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
              {tab === 'my' && (
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
          {tab === 'public' && (
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
};