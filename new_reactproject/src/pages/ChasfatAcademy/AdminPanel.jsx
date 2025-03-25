import { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'recharts';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function AdminPanel() {
  const darkMode = useSelector((state) => state.darkMode?.darkMode) || false;
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState({});
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Simulating API fetch
  useEffect(() => {
    setTimeout(() => {
      // Mock data that would come from an API
      const mockData = {
        upcomingExams: [
          { id: 1, title: 'Final Chemistry Exam', course: 'Advanced Chemistry', date: '2025-03-25', status: 'scheduled', enrolled: 145 },
          { id: 2, title: 'Midterm Biology', course: 'Biology 101', date: '2025-03-30', status: 'scheduled', enrolled: 203 },
          { id: 3, title: 'Physics Qualifying Exam', course: 'Physics II', date: '2025-04-02', status: 'scheduled', enrolled: 98 },
          { id: 4, title: 'Calculus Final', course: 'Calculus III', date: '2025-04-05', status: 'scheduled', enrolled: 176 },
        ],
        ongoingExams: [
          { id: 5, title: 'Programming Fundamentals', course: 'Computer Science', date: '2025-03-19', status: 'in-progress', enrolled: 122, active: 118 },
          { id: 6, title: 'Organic Chemistry Lab', course: 'Chemistry 201', date: '2025-03-19', status: 'in-progress', enrolled: 87, active: 85 },
        ],
        completedExams: [
          { id: 7, title: 'Anatomy Midterm', course: 'Human Anatomy', date: '2025-03-15', status: 'completed', enrolled: 156, submitted: 152, avgScore: 78.5 },
          { id: 8, title: 'Data Structures Quiz', course: 'Computer Science', date: '2025-03-12', status: 'completed', enrolled: 134, submitted: 129, avgScore: 82.3 },
          { id: 9, title: 'Microbiology Test', course: 'Biology 202', date: '2025-03-10', status: 'completed', enrolled: 92, submitted: 90, avgScore: 75.8 },
          { id: 10, title: 'Electricity & Magnetism', course: 'Physics I', date: '2025-03-05', status: 'completed', enrolled: 187, submitted: 185, avgScore: 68.2 },
        ],
        students: [
          { id: 1, name: 'John Doe', matric: 'STU2025001', exams: 12, avgScore: 84.5, lastActive: '2025-03-18' },
          { id: 2, name: 'Jane Smith', matric: 'STU2025002', exams: 14, avgScore: 92.1, lastActive: '2025-03-19' },
          { id: 3, name: 'Alex Johnson', matric: 'STU2025003', exams: 10, avgScore: 76.8, lastActive: '2025-03-17' },
          { id: 4, name: 'Maria Garcia', matric: 'STU2025004', exams: 13, avgScore: 88.3, lastActive: '2025-03-19' },
          { id: 5, name: 'James Wilson', matric: 'STU2025005', exams: 11, avgScore: 79.5, lastActive: '2025-03-15' },
        ],
        courses: [
          { id: 1, name: 'Advanced Chemistry', students: 145, exams: 4, avgScore: 76.2 },
          { id: 2, name: 'Biology 101', students: 203, exams: 5, avgScore: 82.5 },
          { id: 3, name: 'Physics II', students: 98, exams: 3, avgScore: 71.9 },
          { id: 4, name: 'Calculus III', students: 176, exams: 6, avgScore: 68.7 },
          { id: 5, name: 'Computer Science', students: 256, exams: 8, avgScore: 80.1 },
        ],
        recentActivity: [
          { id: 1, action: 'Exam Created', exam: 'Final Chemistry Exam', user: 'Dr. Smith', timestamp: '2025-03-18 14:30:22' },
          { id: 2, action: 'Questions Added', exam: 'Midterm Biology', user: 'Dr. Johnson', count: 45, timestamp: '2025-03-18 12:15:07' },
          { id: 3, action: 'Exam Started', exam: 'Programming Fundamentals', user: 'System', timestamp: '2025-03-19 09:00:00' },
          { id: 4, action: 'Exam Completed', exam: 'Anatomy Midterm', user: 'System', timestamp: '2025-03-15 12:00:00' },
          { id: 5, action: 'Results Published', exam: 'Data Structures Quiz', user: 'Dr. Williams', timestamp: '2025-03-13 16:45:18' },
        ],
        analytics: {
          examTrends: [
            { month: 'Jan', exams: 12, avgScore: 76.5 },
            { month: 'Feb', exams: 15, avgScore: 78.2 },
            { month: 'Mar', exams: 18, avgScore: 80.4 },
          ],
          participationRate: [
            { exam: 'Chemistry', enrolled: 145, participated: 142 },
            { exam: 'Biology', enrolled: 203, participated: 195 },
            { exam: 'Physics', enrolled: 98, participated: 96 },
            { exam: 'Calculus', enrolled: 176, participated: 168 },
            { exam: 'Computer Science', enrolled: 256, participated: 250 },
          ],
          scoreDistribution: [
            { range: '90-100', count: 125 },
            { range: '80-89', count: 243 },
            { range: '70-79', count: 310 },
            { range: '60-69', count: 178 },
            { range: 'Below 60', count: 102 },
          ],
          deviceUsage: [
            { device: 'Desktop', percentage: 65 },
            { device: 'Laptop', percentage: 25 },
            { device: 'Tablet', percentage: 7 },
            { device: 'Mobile', percentage: 3 },
          ],
        }
      };
      
      setExamData(mockData);
      setIsLoading(false);
    }, 800);
  }, []);

  // Function to handle exam selection
  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    // In a real app, this would trigger an API call to fetch detailed exam data
  };

  // Filter exams based on search term and status
  const filteredExams = () => {
    const allExams = [
      ...(examData.upcomingExams || []),
      ...(examData.ongoingExams || []),
      ...(examData.completedExams || [])
    ];
    
    return allExams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           exam.course.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  // Calculate overall stats
  const overallStats = {
    totalExams: examData.upcomingExams?.length + examData.ongoingExams?.length + examData.completedExams?.length || 0,
    totalStudents: examData.students?.length || 0,
    totalCourses: examData.courses?.length || 0,
    activeExams: examData.ongoingExams?.length || 0,
    completionRate: examData.completedExams ? 
      (examData.completedExams.reduce((acc, exam) => acc + exam.submitted, 0) / 
       examData.completedExams.reduce((acc, exam) => acc + exam.enrolled, 0) * 100).toFixed(1) : 0,
    averageScore: examData.completedExams ?
      (examData.completedExams.reduce((acc, exam) => acc + exam.avgScore, 0) / 
       examData.completedExams.length).toFixed(1) : 0
  };

  // Function to show proctoring controls (placeholder)
  const showProctoringControls = (examId) => {
    console.log(`Show proctoring controls for exam ${examId}`);
    // In a real implementation, this would open a modal or navigate to a proctoring page
    alert(`Proctoring controls for exam ID ${examId} would open here`);
  };

  // Function to export results (placeholder)
  const exportResults = (examId) => {
    console.log(`Export results for exam ${examId}`);
    // In a real implementation, this would trigger an API call to generate a report
    alert(`Results for exam ID ${examId} would be exported here`);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md p-4 flex justify-between items-center`}>
        <div className="flex items-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-600'}`}>
            Exam System Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`relative ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            <input
              type="text"
              placeholder="Search exams, students..."
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <span className="absolute right-3 top-2">
              {/* Search icon would go here */}
              🔍
            </span>
          </div>
          <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}>
            Quick Actions
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <StatCard
                title="Total Exams"
                value={overallStats.totalExams}
                icon="📝"
                darkMode={darkMode}
              />
              <StatCard
                title="Active Exams"
                value={overallStats.activeExams}
                icon="🔄"
                darkMode={darkMode}
                highlight={true}
              />
              <StatCard
                title="Total Students"
                value={overallStats.totalStudents}
                icon="👨‍🎓"
                darkMode={darkMode}
              />
              <StatCard
                title="Total Courses"
                value={overallStats.totalCourses}
                icon="📚"
                darkMode={darkMode}
              />
              <StatCard
                title="Completion Rate"
                value={`${overallStats.completionRate}%`}
                icon="✅"
                darkMode={darkMode}
              />
              <StatCard
                title="Average Score"
                value={`${overallStats.averageScore}%`}
                icon="📊"
                darkMode={darkMode}
              />
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'overview'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'exams'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Exams
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'students'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'courses'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'analytics'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'settings'
                    ? darkMode
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6`}>
                  <ActionCard
                    title="Create New Exam"
                    description="Set up a new examination"
                    icon="📝"
                    link="/create-exam"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Add Question Bank"
                    description="Manage your question database"
                    icon="❓"
                    link="/question-bank"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Manage Proctoring"
                    description="Configure exam monitoring"
                    icon="👁️"
                    link="/proctoring"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Generate Reports"
                    description="Create detailed exam reports"
                    icon="📊"
                    link="/reports"
                    darkMode={darkMode}
                  />
                </div>

                {/* Ongoing Exams */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-6`}>
                  <h2 className="text-xl font-semibold mb-4">Ongoing Exams</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Exam Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Started</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Participants</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {examData.ongoingExams && examData.ongoingExams.length > 0 ? (
                          examData.ongoingExams.map((exam) => (
                            <tr key={exam.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium">{exam.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{exam.course}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{new Date(exam.date).toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {exam.active}/{exam.enrolled} ({Math.round((exam.active / exam.enrolled) * 100)}%)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => showProctoringControls(exam.id)}
                                  className={`px-3 py-1 rounded-md ${
                                    darkMode
                                      ? 'bg-blue-600 hover:bg-blue-700'
                                      : 'bg-blue-500 hover:bg-blue-600'
                                  } text-white text-sm`}
                                >
                                  Proctoring
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center">No ongoing exams at the moment</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Recent Activity */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                      {examData.recentActivity && examData.recentActivity.map((activity) => (
                        <div key={activity.id} className={`flex items-start p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <div className={`flex-shrink-0 w-10 h-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                            {activity.action === 'Exam Created' && '📝'}
                            {activity.action === 'Questions Added' && '❓'}
                            {activity.action === 'Exam Started' && '▶️'}
                            {activity.action === 'Exam Completed' && '✅'}
                            {activity.action === 'Results Published' && '📊'}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm">
                              {activity.exam} {activity.count ? `(${activity.count} questions)` : ''} by {activity.user}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Exams */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
                    <div className="space-y-3">
                      {examData.upcomingExams && examData.upcomingExams.slice(0, 5).map((exam) => (
                        <div key={exam.id} className={`flex items-center justify-between p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-sm">{exam.course}</p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(exam.date).toLocaleDateString()} ({exam.enrolled} enrolled)
                            </p>
                          </div>
                          <Link
                            to={`/exam/${exam.id}`}
                            className={`px-3 py-1 rounded-md ${
                              darkMode
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-blue-500 hover:bg-blue-600'
                            } text-white text-sm`}
                          >
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exam Trends */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-xl font-semibold mb-4">Exam Trends</h2>
                    <div className="h-64">
                      {/* In a real application, we would render a chart here */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Chart would render here with exam trends data</p>
                      </div>
                    </div>
                  </div>

                  {/* Score Distribution */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
                    <div className="h-64">
                      {/* In a real application, we would render a chart here */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Chart would render here with score distribution data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exams' && (
              <div className="space-y-6">
                {/* Exam Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                  <div className="flex items-center space-x-2 mb-2 md:mb-0">
                    <input
                      type="text"
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <Link
                    to="/create-exam"
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition`}
                  >
                    Create New Exam
                  </Link>
                </div>

                {/* Exam Table */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Exam Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Participants</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {filteredExams().length > 0 ? (
                          filteredExams().map((exam) => (
                            <tr key={exam.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium">{exam.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{exam.course}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{new Date(exam.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  exam.status === 'scheduled'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : exam.status === 'in-progress'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {exam.status === 'scheduled'
                                    ? 'Scheduled'
                                    : exam.status === 'in-progress'
                                    ? 'In Progress'
                                    : 'Completed'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {exam.status === 'in-progress'
                                  ? `${exam.active}/${exam.enrolled} (${Math.round((exam.active / exam.enrolled) * 100)}% active)`
                                  : exam.status === 'completed'
                                  ? `${exam.submitted}/${exam.enrolled} (${Math.round((exam.submitted / exam.enrolled) * 100)}% submitted)`
                                  : `${exam.enrolled} enrolled`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <Link
                                    to={`/exam/${exam.id}`}
                                    className={`px-3 py-1 rounded-md ${
                                      darkMode
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    } text-white text-sm`}
                                  >
                                    View
                                  </Link>
                                  {exam.status === 'in-progress' && (
                                    <button
                                      onClick={() => showProctoringControls(exam.id)}
                                      className={`px-3 py-1 rounded-md ${
                                        darkMode
                                          ? 'bg-green-600 hover:bg-green-700'
                                          : 'bg-green-500 hover:bg-green-600'
                                      } text-white text-sm`}
                                    >
                                      Proctor
                                    </button>
                                  )}
                                  {exam.status === 'completed' && (
                                    <button
                                      onClick={() => exportResults(exam.id)}
                                      className={`px-3 py-1 rounded-md ${
                                        darkMode
                                          ? 'bg-purple-600 hover:bg-purple-700'
                                          : 'bg-purple-500 hover:bg-purple-600'
                                      } text-white text-sm`}
                                    >
                                      Export
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center">No exams found matching your filters</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

{activeTab === 'students' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    placeholder="Search students..."
                    className={`px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition`}
                  >
                    Add Student
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Matriculation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Exams Taken</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Avg. Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {examData.students && examData.students.map((student) => (
                        <tr key={student.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{student.matric}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{student.exams}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{student.avgScore}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">{student.lastActive}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/student/${student.id}`}
                              className={`px-3 py-1 rounded-md ${
                                darkMode
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              } text-white text-sm`}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className={`px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition`}
                  >
                    Add Course
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Exams</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Avg. Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {examData.courses && examData.courses.map((course) => (
                        <tr key={course.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{course.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.students}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.exams}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.avgScore}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/course/${course.id}`}
                              className={`px-3 py-1 rounded-md ${
                                darkMode
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              } text-white text-sm`}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTimeframe('week')}
                      className={`px-3 py-1 rounded-md ${
                        timeframe === 'week'
                          ? darkMode
                            ? 'bg-blue-600'
                            : 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setTimeframe('month')}
                      className={`px-3 py-1 rounded-md ${
                        timeframe === 'month'
                          ? darkMode
                            ? 'bg-blue-600'
                            : 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setTimeframe('year')}
                      className={`px-3 py-1 rounded-md ${
                        timeframe === 'year'
                          ? darkMode
                            ? 'bg-blue-600'
                            : 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                      }`}
                    >
                      Year
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exam Trends */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h3 className="text-lg font-semibold mb-2">Exam Performance Trends</h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Performance trend chart would render here</p>
                      </div>
                    </div>
                  </div>

                  {/* Participation Rate */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h3 className="text-lg font-semibold mb-2">Participation Rate</h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Participation rate chart would render here</p>
                      </div>
                    </div>
                  </div>

                  {/* Score Distribution */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h3 className="text-lg font-semibold mb-2">Score Distribution</h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Score distribution chart would render here</p>
                      </div>
                    </div>
                  </div>

                  {/* Device Usage */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h3 className="text-lg font-semibold mb-2">Device Usage</h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Device usage chart would render here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h2 className="text-xl font-semibold mb-6">System Settings</h2>
                
                <div className="space-y-6">
                  {/* General Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">System Name</label>
                        <input
                          type="text"
                          defaultValue="Exam System"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Institution Name</label>
                        <input
                          type="text"
                          defaultValue="Sample University"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Admin Email</label>
                        <input
                          type="email"
                          defaultValue="admin@example.com"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Time Zone</label>
                        <select
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option>UTC (Coordinated Universal Time)</option>
                          <option>EST (Eastern Standard Time)</option>
                          <option>CST (Central Standard Time)</option>
                          <option>PST (Pacific Standard Time)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Exam Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Exam Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Default Exam Duration (minutes)</label>
                        <input
                          type="number"
                          defaultValue="60"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Default Points Per Question</label>
                        <input
                          type="number"
                          defaultValue="1"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Enable Proctoring by Default</span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Randomize Question Order</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Require Two-Factor Authentication for Admin Users</span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Log All Admin Actions</span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Enable IP Restrictions</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      } transition`}
                    >
                      Cancel
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        darkMode
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white transition`}
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Component for stats cards on the dashboard
const StatCard = ({ title, value, icon, darkMode, highlight }) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        highlight
          ? darkMode
            ? 'bg-blue-900'
            : 'bg-blue-50 border border-blue-200'
          : darkMode
          ? 'bg-gray-800'
          : 'bg-white'
      }`}
    >
      <div className="flex items-center">
        <div
          className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Component for action cards on the dashboard
const ActionCard = ({ title, description, icon, link, darkMode }) => {
  return (
    <Link
      to={link}
      className={`flex items-center p-4 rounded-lg shadow-md transition hover:shadow-lg ${
        darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div
        className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}
      >
        <span className="text-xl">{icon}</span>
      </div>
      <div className="ml-4">
        <h3 className="font-medium">{title}</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      </div>
    </Link>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  highlight: PropTypes.bool
};

ActionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  darkMode: PropTypes.bool
};

export default AdminPanel;