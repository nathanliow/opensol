import { Project } from "@/types/ProjectTypes";
import { User } from "@supabase/supabase-js";
import { Icons } from "../../icons/icons";
import { useTimeAgo } from "@/hooks/utils/useTimeAgo";
import { Table, Column } from "../../table/table";

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

  // Define columns for the table
  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      cell: (project) => <div className="text-sm font-medium">{project.name}</div>
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      cell: (project) => {
        const { timeAgo, formattedDate } = getTimeAgo(project.created_at);
        return (
          <span className="relative group">
            <span className="group-hover:hidden">{formattedDate}</span>
            <span className="hidden group-hover:inline">{timeAgo}</span>
          </span>
        );
      }
    },
    {
      key: 'user_id',
      header: 'Creator',
      sortable: true,
      cell: (project) => (
        <span>
          {project.user_id !== supabaseUser?.id 
            ? (project.user_id).slice(0, 4) + '...' + (project.user_id).slice(-4) 
            : 'You'}
        </span>
      ),
      hidden: (ctx) => ctx?.tab !== 'public'
    },
    {
      key: 'updated_at',
      header: 'Updated',
      sortable: true,
      cell: (project) => {
        const { timeAgo } = getTimeAgo(project.updated_at);
        return <span>{timeAgo}</span>;
      }
    },
    {
      key: 'is_public',
      header: 'Visibility',
      sortable: true,
      cell: (project) => (
        <span className={`text-xs px-2 py-1 rounded-full ${
          project.is_public 
            ? 'bg-green-900/50 text-green-400 border border-green-700' 
            : 'text-gray-400 border border-[#333333]'
        }`}>
          {project.is_public ? 'Public' : 'Private'}
        </span>
      ),
      hidden: (ctx) => ctx?.tab !== 'my'
    },
    {
      key: 'nodes',
      header: 'Nodes',
      sortable: true,
      cell: (project) => (
        <div className="flex items-center gap-1">
          <Icons.FiBox size={14} className="text-green-500" />
          <span>{project.nodes?.length || 0}</span>
        </div>
      )
    },
    {
      key: 'edges',
      header: 'Edges',
      sortable: true,
      cell: (project) => (
        <div className="flex items-center gap-1">
          <Icons.FiGitMerge size={14} className="text-purple-500" />
          <span>{project.edges?.length || 0}</span>
        </div>
      )
    },
    {
      key: 'stars',
      header: 'Stars',
      sortable: true,
      cell: (project) => (
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
      )
    },
    {
      key: 'id' as keyof Project,
      header: (
        <div className="flex justify-center items-center gap-1">
          Actions
        </div>
      ),
      cellClassName: 'text-right',
      cell: (project) => (
        <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleEditProject(e, project)}
            className="text-blue-500 hover:text-blue-400 p-1 rounded-md hover:bg-blue-500 hover:bg-opacity-10 transition-colors"
            title="Edit Project"
          >
            <Icons.FiEdit2 size={16} />
          </button>
        </div>
      ),
      hidden: (ctx) => ctx?.tab !== 'my'
    }
  ];

  return (
    <Table
      data={projects}
      columns={columns}
      keyExtractor={(project) => project.id || ''}
      sortConfig={sortConfig}
      onSort={requestSort}
      onRowClick={(project) => handleOpenProject(project.id || '')}
      className="mx-12 my-10"
      context={{ tab }}
    />
  );
};