import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Icons } from '../icons/icons';
import { Project } from '@/types/ProjectTypes';
import { UserData } from '@/types/UserTypes';

interface EarningsContentProps {
  userData: UserData | null;
  projects: Project[];
}

export const EarningsContent = ({ userData, projects }: EarningsContentProps) => {  
  // Process projects for earnings data
  const projectEarnings = projects.map(project => ({
    id: project.id || `proj-${Math.random().toString(36).substr(2, 9)}`,
    name: project.name,
    earnings: project.earnings,
    date: project.updated_at ? new Date(project.updated_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A',
  }));

  // Generate monthly earnings data from userData
  const monthlyEarningsMap = userData?.monthly_earnings?.reduce((acc, item) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(item.month) - 1; // Convert "1"-"12" to 0-11 index
    const monthName = monthNames[monthIndex];
    const yearMonth = `${monthName} ${item.year}`;
    acc[yearMonth] = (acc[yearMonth] || 0) + item.earnings;
    return acc;
  }, {} as Record<string, number>) || {};

  // Convert to array format for chart
  const monthlyEarnings = Object.entries(monthlyEarningsMap).map(([month, earnings]) => ({
    month,
    earnings
  }));

  // Calculate statistics
  const totalEarnings = projects.reduce((sum, project) => sum + project.earnings, 0);
  const averageEarningPerProject = projects.length > 0 ? totalEarnings / projects.length : 0;
  const totalProjects = projects.length;
  const highestEarningProject = projects.length > 0 
    ? projects.reduce((max, project) => (project.earnings > max.earnings ? project : max), projects[0])
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1E1E] flex items-center p-4 rounded-lg shadow">
          <div className="p-3 bg-blue-600 rounded-full mr-4">
            <Icons.PiMoneyWavyLight size={20} className="text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-white text-xl font-bold">${totalEarnings.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-[#1E1E1E] flex items-center p-4 rounded-lg shadow">
          <div className="p-3 bg-green-600 rounded-full mr-4">
            <Icons.BsBarChartFill size={20} className="text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Earning/Project</p>
            <p className="text-white text-xl font-bold">${averageEarningPerProject.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-[#1E1E1E] flex items-center p-4 rounded-lg shadow">
          <div className="p-3 bg-purple-600 rounded-full mr-4">
            <Icons.FiBox size={20} className="text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Projects</p>
            <p className="text-white text-xl font-bold">{totalProjects}</p>
          </div>
        </div>
        
        <div className="bg-[#1E1E1E] flex items-center p-4 rounded-lg shadow">
          <div className="p-3 bg-yellow-600 rounded-full mr-4">
            <Icons.FiStar size={20} className="text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Top Earning Project</p>
            <p className="text-white text-xl font-bold">
              ${highestEarningProject ? highestEarningProject.earnings.toFixed(2) : '0.00'}
            </p>
            <p className="text-gray-400 text-xs">
              {highestEarningProject ? highestEarningProject.name : 'No projects'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Over Time */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <h3 className="text-white text-lg font-semibold mb-4">Earnings Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyEarnings}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                  formatter={(value) => [`$${value}`, 'Earnings']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Earnings by Project */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <h3 className="text-white text-lg font-semibold mb-4">Earnings by Project</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...projectEarnings].sort((a, b) => b.earnings - a.earnings)}
                margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis type="number" stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                  formatter={(value) => [`$${value}`, 'Earnings']}
                />
                <Bar dataKey="earnings" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};