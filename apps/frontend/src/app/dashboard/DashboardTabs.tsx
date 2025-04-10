import React from 'react';

interface DashboardTabsProps {
  projectsTab: 'my' | 'public';
  setProjectsTab: (tab: 'my' | 'public') => void;
}

export const DashboardTabs = ({ projectsTab, setProjectsTab }: DashboardTabsProps) => {
  return (
    <>
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

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white/90">
          {projectsTab === 'my' ? 'Your Projects' : 'Public Projects'}
        </h2>
      </div>
    </>
  );
};