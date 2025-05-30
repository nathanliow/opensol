import React from 'react';

interface DashboardTabsProps {
  tab: 'my' | 'public' | 'earnings' | 'courses';
  setTab: (tab: 'my' | 'public' | 'earnings' | 'courses') => void;
}

export const DashboardTabs = ({ tab, setTab }: DashboardTabsProps) => {
  return (
    <>
      <div className="flex border-b border-gray-800 mb-6">
        <button
          className={`px-4 py-2 font-medium ${tab === 'my' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setTab('my')}
        >
          My Projects
        </button>
        <button
          className={`px-4 py-2 font-medium ${tab === 'public' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setTab('public')}
        >
          Public Projects
        </button>
        <button
          className={`px-4 py-2 font-medium ${tab === 'earnings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setTab('earnings')}
        >
          Earnings
        </button>
        <button
          className={`px-4 py-2 font-medium ${tab === 'courses' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setTab('courses')}
        >
          Courses
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white/90">
          {tab === 'my' ? 'Your Projects' : tab === 'public' ? 'Public Projects' : tab === 'courses' ? 'Courses' : 'Earnings'}
        </h2>
      </div>
    </>
  );
};