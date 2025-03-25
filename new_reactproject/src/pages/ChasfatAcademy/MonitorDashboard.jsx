import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function MonitorDashboard() {
  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [statsView, setStatsView] = useState('overview'); // 'overview', 'engagement', 'progress'
  const [isLoading, setIsLoading] = useState(true);

  // Dummy data - this would be replaced with actual API calls
  useEffect(() => {
    // Simulating API fetch delay
    setTimeout(() => {
      // Sample data - this would come from your API
      const dummyUsers = [
        { id: 1, name: 'Alex Johnson', email: 'alex@example.com', joinDate: '2024-12-10', lastActive: '2025-03-18', totalHours: 156, streak: 24 },
        { id: 2, name: 'Sam Wilson', email: 'sam@example.com', joinDate: '2025-01-05', lastActive: '2025-03-15', totalHours: 98, streak: 12 },
        { id: 3, name: 'Jamie Rodriguez', email: 'jamie@example.com', joinDate: '2024-11-22', lastActive: '2025-03-19', totalHours: 203, streak: 43 },
        { id: 4, name: 'Taylor Kim', email: 'taylor@example.com', joinDate: '2025-02-18', lastActive: '2025-03-12', totalHours: 45, streak: 8 },
        { id: 5, name: 'Morgan Liu', email: 'morgan@example.com', joinDate: '2024-10-15', lastActive: '2025-03-17', totalHours: 321, streak: 37 }
      ];
      
      setUsers(dummyUsers);
      setSelectedUser(dummyUsers[0]);
      setIsLoading(false);
    }, 800);
  }, []);

  // This would be an API call in production
  const fetchUserData = (userId, timeRange) => {
    // This is dummy data - replace with actual API call
    console.log(`API call: fetch data for user ${userId} over ${timeRange}`);
    return generateDummyReadingData(timeRange);
  };

  const generateDummyReadingData = (range) => {
    let data = [];
    let days = 30;
    
    if (range === 'week') days = 7;
    else if (range === 'month') days = 30;
    else if (range === 'quarter') days = 90;
    else if (range === 'year') days = 365;
    
    // Generate random reading data
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      data.push({
        date: date.toISOString().split('T')[0],
        hours: Math.floor(Math.random() * 5) + (Math.random() > 0.3 ? 1 : 0), // Some days might have 0 hours
        pages: Math.floor(Math.random() * 50) + (Math.random() > 0.3 ? 10 : 0),
      });
    }
    
    return data;
  };

  // Prepare user reading data for selected time range
  const userData = selectedUser ? fetchUserData(selectedUser.id, timeRange) : [];

  // Aggregate statistics for all users
  const aggregateStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => new Date(u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    totalReadingHours: users.reduce((sum, user) => sum + user.totalHours, 0),
    averageStreak: Math.round(users.reduce((sum, user) => sum + user.streak, 0) / users.length)
  };

  // Chart data for platform overview
  const platformActivityData = [
    { month: 'Jan', activeUsers: 45, newUsers: 12 },
    { month: 'Feb', activeUsers: 50, newUsers: 15 },
    { month: 'Mar', activeUsers: 65, newUsers: 22 }
  ];

  // Reading distribution data for pie chart
  const readingDistributionData = [
    { name: '< 1 hour/day', value: 30 },
    { name: '1-2 hours/day', value: 45 },
    { name: '2-3 hours/day', value: 15 },
    { name: '> 3 hours/day', value: 10 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Format the user data for charts
  const formatChartData = () => {
    // Group by week for weekly view
    if (timeRange === 'week' || timeRange === 'month') {
      return userData;
    } else {
      // Aggregate by week or month for larger time ranges
      const aggregated = [];
      let currentPeriod = {};
      let periodSize = timeRange === 'quarter' ? 7 : 30; // Weekly for quarter, monthly for year
      
      userData.forEach((day, index) => {
        if (index % periodSize === 0) {
          if (Object.keys(currentPeriod).length > 0) {
            aggregated.push(currentPeriod);
          }
          currentPeriod = { 
            date: day.date,
            hours: 0,
            pages: 0,
            days: 0
          };
        }
        
        currentPeriod.hours += day.hours;
        currentPeriod.pages += day.pages;
        currentPeriod.days += day.hours > 0 ? 1 : 0;
      });
      
      // Add the last period
      if (Object.keys(currentPeriod).length > 0) {
        aggregated.push(currentPeriod);
      }
      
      return aggregated;
    }
  };

  const chartData = formatChartData();
  
  // Handle user selection
  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    // In a real implementation, this would trigger an API call to get the user's data
  };

  // Export data (placeholder function)
  const exportData = () => {
    alert('Data export functionality would go here');
    console.log('Exporting data for users:', users);
  };

  // Calculate reading streak
  const calculateStreak = (data) => {
    if (!data || data.length === 0) return 0;
    
    let streak = 0;
    let currentStreak = 0;
    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].hours > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reading Tracker Admin Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
          >
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-2xl font-bold">{aggregateStats.totalUsers}</div>
              <div className="text-xs text-green-500 mt-1">+12% from last month</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Active Users (7-day)</div>
              <div className="text-2xl font-bold">{aggregateStats.activeUsers}</div>
              <div className="text-xs text-green-500 mt-1">+5% from last week</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Reading Hours</div>
              <div className="text-2xl font-bold">{aggregateStats.totalReadingHours}</div>
              <div className="text-xs text-green-500 mt-1">+8% from last month</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Average Reading Streak</div>
              <div className="text-2xl font-bold">{aggregateStats.averageStreak} days</div>
              <div className="text-xs text-green-500 mt-1">+2 days from last month</div>
            </div>
          </div>

          {/* Platform-Wide Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Platform Activity (Last 3 Months)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="activeUsers" fill="#3b82f6" name="Active Users" />
                    <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Reading Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={readingDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {readingDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* User Selection and Data View */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">User Data</h2>
            </div>
            
            {/* User List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Streak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className={selectedUser && selectedUser.id === user.id ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.joinDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.lastActive}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.totalHours}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.streak} days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleUserSelect(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected User Details */}
          {selectedUser && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Reading Data: {selectedUser.name}</h2>
                <div className="flex space-x-2">
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 90 Days</option>
                    <option value="year">Last 365 Days</option>
                  </select>
                </div>
              </div>
              
              {/* User Reading Stats */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Current Streak</div>
                    <div className="text-xl font-bold">{calculateStreak(userData)} days</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Total Hours</div>
                    <div className="text-xl font-bold">
                      {userData.reduce((sum, entry) => sum + entry.hours, 0)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Average Per Day</div>
                    <div className="text-xl font-bold">
                      {userData.length ? (userData.reduce((sum, entry) => sum + entry.hours, 0) / userData.length).toFixed(1) : '0'}
                    </div>
                  </div>
                </div>
                
                {/* Reading Chart */}
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return timeRange === 'week' || timeRange === 'month' 
                            ? `${d.getMonth()+1}/${d.getDate()}`
                            : `${d.getMonth()+1}/${d.getFullYear().toString().substr(-2)}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="#3b82f6"
                        activeDot={{ r: 8 }}
                        name="Reading Hours"
                      />
                      <Line
                        type="monotone"
                        dataKey="pages"
                        stroke="#10b981"
                        name="Pages Read"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Reading Insights */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-lg mb-2">Reading Insights</h3>
                  <ul className="space-y-2">
                    <li className="flex">
                      <span className="mr-2">📊</span>
                      {userData.filter(d => d.hours > 0).length / userData.length > 0.7 
                        ? "Great consistency in reading habits!" 
                        : "Could improve reading consistency throughout the period."}
                    </li>
                    <li className="flex">
                      <span className="mr-2">📈</span>
                      {userData.slice(-7).reduce((sum, d) => sum + d.hours, 0) > 
                       userData.slice(-14, -7).reduce((sum, d) => sum + d.hours, 0)
                        ? "Reading time has increased recently. Great progress!" 
                        : "Reading time has decreased recently compared to previous period."}
                    </li>
                    <li className="flex">
                      <span className="mr-2">💡</span>
                      {"Based on patterns, optimal reading sessions appear to be around 2 hours at a time."}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Admin Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
              Generate Reports
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Send User Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MonitorDashboard;