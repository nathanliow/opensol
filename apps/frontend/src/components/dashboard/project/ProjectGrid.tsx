import { Project } from "@/types/ProjectTypes";
import { ProjectCard } from "./ProjectCard";
import { User } from "@supabase/supabase-js";

interface ProjectGridProps {
  projects: Project[];
  starredProjects: Set<string>;
  tab: 'my' | 'public' | 'earnings';
  supabaseUser: User | null;
  handleOpenProject: (id: string) => void;
  handleEditProject: (e: React.MouseEvent, project: Project) => void;
  handleStarToggle: (id: string) => void;
}

export const ProjectGrid = ({
  projects, 
  starredProjects, 
  tab, 
  supabaseUser,
  handleOpenProject, 
  handleEditProject, 
  handleStarToggle 
}: ProjectGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-12 py-4">
      {projects.map((project) => {
        
        return (
          <ProjectCard 
            key={project.id} 
            project={project} 
            handleOpenProject={handleOpenProject} 
            handleEditProject={handleEditProject} 
            handleStarToggle={handleStarToggle} 
            starredProjects={starredProjects} 
            tab={tab} 
            supabaseUser={supabaseUser}
          />
        );
      })}
    </div>
  );
};