import React, { useState } from 'react';
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Icons } from '../icons/icons';

// Mock data - in a real app this would come from an API
const mockProjectEarnings = [
  { id: '1', name: 'Smart Contract Builder', earnings: 245.50 },
  { id: '2', name: 'DeFi Dashboard', earnings: 189.75 },
  { id: '3', name: 'NFT Gallery', earnings: 320.25 },
  { id: '4', name: 'Wallet Connector', earnings: 132.80 },
  { id: '5', name: 'Token Swap', earnings: 267.40 }
];

const mockMonthlyEarnings = [
  { month: 'Jan', earnings: 120 },
  { month: 'Feb', earnings: 180 },
  { month: 'Mar', earnings: 150 },
  { month: 'Apr', earnings: 230 },
  { month: 'May', earnings: 290 },
  { month: 'Jun', earnings: 320 },
];

const mockProjectsCreated = [
  { month: 'Jan', count: 3 },
  { month: 'Feb', count: 2 },
  { month: 'Mar', count: 4 },
  { month: 'Apr', count: 1 },
  { month: 'May', count: 5 },
  { month: 'Jun', count: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface EarningsContentProps {}

export const EarningsContent = ({}: EarningsContentProps) => {
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('1d');
  
  // Calculate statistics
  const totalEarnings = mockProjectEarnings.reduce((sum, project) => sum + project.earnings, 0);
  const averageEarningPerProject = totalEarnings / mockProjectEarnings.length;
  const totalProjects = mockProjectEarnings.length;
  const highestEarningProject = mockProjectEarnings.reduce(
    (max, project) => (project.earnings > max.earnings ? project : max),
    mockProjectEarnings[0]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Earnings Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('1d')}
            className={`px-3 py-1 rounded-md ${
              timeRange === '1d' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            1D
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-md ${
              timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-md ${
              timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            30D
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-full mr-4">
              <Icons.PiMoneyWavyLight size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-white text-xl font-bold">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-full mr-4">
              <Icons.BsBarChartFill size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Earning/Project</p>
              <p className="text-white text-xl font-bold">${averageEarningPerProject.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-600 rounded-full mr-4">
              <Icons.FiBox size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-white text-xl font-bold">{totalProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-600 rounded-full mr-4">
              <Icons.FiStar size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Top Earning Project</p>
              <p className="text-white text-xl font-bold">${highestEarningProject.earnings.toFixed(2)}</p>
              <p className="text-gray-400 text-xs">{highestEarningProject.name}</p>
            </div>
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
                data={mockMonthlyEarnings}
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

        {/* Projects Created */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <h3 className="text-white text-lg font-semibold mb-4">Projects Created</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockProjectsCreated}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Legend />
                <Bar dataKey="count" name="Projects" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Earnings by Project */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <h3 className="text-white text-lg font-semibold mb-4">Earnings by Project</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockProjectEarnings}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                  formatter={(value) => [`$${value}`, 'Earnings']}
                />
                <Bar dataKey="earnings" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Earnings Distribution */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
          <h3 className="text-white text-lg font-semibold mb-4">Earnings Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockProjectEarnings}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="earnings"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {mockProjectEarnings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                  formatter={(value) => [`$${value}`, 'Earnings']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Earnings Table */}
      <div className="bg-[#1E1E1E] p-4 rounded-lg shadow">
        <h3 className="text-white text-lg font-semibold mb-4">Recent Earnings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {mockProjectEarnings.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Jun 10, 2024</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-400">${project.earnings.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">Paid</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};