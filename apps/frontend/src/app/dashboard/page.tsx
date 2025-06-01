"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProjects, deleteProject, createProject, updateProject, getStarredProjects } from '@/lib/projects';
import { Project } from '@/types/ProjectTypes';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { Icons } from '@/components/icons/icons';
import { DashboardMenu } from '@/components/dashboard/DashboardMenu';
import { ProjectModal } from '@/components/modal/ProjectModal';
import { NewProjectModal } from '@/components/modal/NewProjectModal';
import { DashboardTabs } from '../../components/dashboard/DashboardTabs';
import { DashboardContent } from '../../components/dashboard/DashboardContent';
import { flowTemplates } from '@/flow-templates';
import { getUserData } from '@/lib/user';
import { UserData } from '@/types/UserTypes';
import { courses } from '@/courses';
import { useLesson } from '@/contexts/LessonContext';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
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
  const [tab, setTab] = useState<'my' | 'public' | 'earnings' | 'courses'>('my');

  // Add state for tracking expanded courses
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Use the selected tab to determine which projects to display
  const displayProjects = tab === 'my' ? projects : publicProjects;

  // State for user profile data
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user profile when supabaseUser changes
  useEffect(() => {
    if (supabaseUser) {
      const fetchUserData = async () => {
        const data = await getUserData(supabaseUser.id);
        setUserData(data);
      };
      
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [supabaseUser]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Only fetch user's projects if the user is logged in
        if (supabaseUser && supabaseUser.id) {
          // Fetch user's projects
          const userProjects = await getUserProjects(supabaseUser.id);
          setProjects(userProjects);
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

  const { exitLesson } = useLesson();

  const handleOpenProject = (id: string) => {    
    exitLesson();
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
      
      // Clear lesson progress when creating a new project
      exitLesson();
      
      // First clear any existing content by removing currentProjectId
      localStorage.removeItem('currentProjectId');
      
      // Get nodes and edges from selected template or use empty arrays
      const nodes = selectedTemplate?.nodes || [];
      const edges = selectedTemplate?.edges || [];
      
      // Create a new project with template data if available
      const newProject: Project = await createProject({
        name: newProjectName,
        description: newProjectDescription,
        nodes: nodes,
        edges: edges,
        user_id: supabaseUser.id,
        stars: 0,
        earnings: 0
      });
      
      // Save project ID to localStorage
      localStorage.setItem('currentProjectId', newProject.id || '');
      
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

  // Add function to toggle course expansion
  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  // Helper function to check if a lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    return userData?.finished_lessons?.includes(lessonId) || false;
  };

  // Helper function to check if all lessons in a course are completed
  const isCourseCompleted = (course: typeof courses[string]): boolean => {
    if (!userData?.finished_lessons) return false;
    return course.lessons.every(lesson => userData.finished_lessons.includes(lesson.id));
  };

  // Helper function to get course completion stats
  const getCourseCompletionStats = (course: typeof courses[string]): { completed: number; total: number } => {
    if (!userData?.finished_lessons) return { completed: 0, total: course.lessons.length };
    const completed = course.lessons.filter(lesson => userData.finished_lessons.includes(lesson.id)).length;
    return { completed, total: course.lessons.length };
  };

  return (
    <>
      <div className="min-h-screen bg-[#121212] text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-row justify-between items-start items-center gap-4 mb-6">
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
              <DashboardMenu/>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <DashboardTabs 
            tab={tab} 
            setTab={setTab} 
          />

          {/* Dashboard Content */}
          {tab === 'courses' ? (
            <div className="space-y-4 pt-4">
              {Object.values(courses).map(course => {
                const courseCompleted = isCourseCompleted(course);
                const completionStats = getCourseCompletionStats(course);
                
                return (
                  <div key={course.id} className={`rounded-lg shadow-lg overflow-hidden ${courseCompleted ? 'bg-green-900/30 border-2 border-green-600/50' : 'bg-[#1e1e1e]'}`}>
                    {/* Course Header */}
                    <button
                      onClick={() => toggleCourseExpansion(course.id)}
                      className={`w-full p-6 text-left hover:bg-opacity-80 transition-colors flex items-center justify-between ${courseCompleted ? 'hover:bg-green-800/40' : 'hover:bg-[#2a2a2a]'}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          {courseCompleted && (
                            <div className="flex items-center gap-1 text-green-400">
                              <Icons.FiCheck size={18} />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{course.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {completionStats.completed}/{completionStats.total} lessons completed
                        </div>
                      </div>
                      <div className="ml-4">
                        {expandedCourses.has(course.id) ? (
                          <Icons.ChevronDownIcon width={20} height={20} className="text-gray-400" />
                        ) : (
                          <Icons.ChevronRightIcon width={20} height={20} className="text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {/* Course Lessons */}
                    {expandedCourses.has(course.id) && (
                      <div className="border-t border-gray-700">
                        {course.lessons.map((lesson, index) => {
                          const lessonCompleted = isLessonCompleted(lesson.id);
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                localStorage.removeItem('currentProjectId');
                                router.push(`/?courseId=${course.id}&lesson=${lesson.id}`);
                              }}
                              className="w-full text-left py-3 px-8 ml-4 hover:bg-blue-600/20 border-l-2 border-transparent hover:border-blue-600 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="font-medium text-sm group-hover:text-blue-400">{lesson.title}</div>
                                  {lesson.xp && (
                                    <div className="text-yellow-400 font-medium text-xs mt-1">+{lesson.xp} XP</div>
                                  )}
                                  <div className="text-gray-400 text-xs mt-1">{lesson.description}</div>
                                </div>
                                {lessonCompleted && (
                                  <Icons.FiCheck size={16} className="text-green-400 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <DashboardContent
              userData={userData}
              projects={displayProjects}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              viewMode={viewMode}
              setViewMode={setViewMode}
              loading={loading}
              tab={tab as 'my' | 'public' | 'earnings'}
              handleOpenProject={handleOpenProject}
              handleEditProject={handleEditProject}
              handleStarToggle={handleStarToggle}
              starredProjects={starredProjects}
              handleNewProject={handleNewProject}
              supabaseUser={supabaseUser}
              sortConfig={sortConfig}
              requestSort={requestSort}
            />
          )}
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
