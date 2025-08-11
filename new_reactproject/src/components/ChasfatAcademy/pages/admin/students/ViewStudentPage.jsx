import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ViewStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const token = localStorage.getItem('token');

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/student/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data?.student) {
          console.log('Student data loaded:', response.data.student); // Debug log
          setStudent(response.data.student);
        } else {
          setError('No student data received');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student data');
        console.error('Load Error:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && token) {
      fetchStudent();
    }
  }, [studentId, token]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get grade color
  const getGradeColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading student data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={() => navigate('/admin_panel')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 text-lg mb-4">Student not found</div>
        <button
          onClick={() => navigate('/admin_panel')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-600 mt-1">Comprehensive student information and performance</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/student/${studentId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Student
          </Link>
          <button
            onClick={() => navigate('/admin_panel')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Student Header Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
              <p className="text-blue-100 text-lg">Matric No: {student.matricNo}</p>
              <p className="text-blue-100">{student.department} • Level {student.level}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                student.isActive 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {student.isActive ? 'Active Student' : 'Inactive Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{student.stats?.totalCourses || 0}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{student.stats?.totalExams || 0}</div>
              <div className="text-sm text-gray-600">Exams Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{student.stats?.averageScore || 0}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{student.stats?.passedExams || 0}</div>
              <div className="text-sm text-gray-600">Passed Exams</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'courses', label: `Courses (${student.courses?.length || 0})` },
              { id: 'results', label: `Results (${student.results?.length || 0})` },
              { id: 'activity', label: 'Activity' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{student.email || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{student.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{student.department || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{student.level || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Active:</span>
                    <span className="font-medium">{formatDateTime(student.lastActive)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registered:</span>
                    <span className="font-medium">{formatDate(student.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Examiner Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Examiner Information</h3>
                {student.examiner ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{student.examiner.firstName} {student.examiner.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{student.examiner.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{student.examiner.phone || 'Not provided'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No examiner assigned</p>
                )}
              </div>

              {/* Performance Summary */}
              <div className="bg-gray-50 p-6 rounded-lg lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{student.stats?.highestScore || 0}%</div>
                    <div className="text-sm text-gray-600">Highest Score</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-xl font-bold text-red-600">{student.stats?.lowestScore || 0}%</div>
                    <div className="text-sm text-gray-600">Lowest Score</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-xl font-bold text-green-600">{student.stats?.activeCourses || 0}</div>
                    <div className="text-sm text-gray-600">Active Courses</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{student.stats?.totalAttendances || 0}</div>
                    <div className="text-sm text-gray-600">Total Attendances</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
              {student.courses && student.courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {student.courses.map(course => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{course.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.semester || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.creditHours || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              course.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {course.enrollmentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(course.enrolledAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              to={`/course/${course.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-lg mb-2">No courses enrolled</div>
                  <p className="text-gray-400">This student hasn&apos;t been enrolled in any courses yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
              {student.results && student.results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {student.results.map(result => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{result.exam?.title || 'Unknown Exam'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-mono text-sm">{result.exam?.course?.code}</div>
                            <div className="text-sm text-gray-500">{result.exam?.course?.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(result.score)}`}>
                              {result.score !== null ? `${result.score}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {result.grade || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.isPassed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.isPassed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(result.exam?.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-lg mb-2">No exam results available</div>
                  <p className="text-gray-400">This student hasn&apos;t taken any exams yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Recent Exam Sessions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Exam Sessions</h3>
                {student.examSessions && student.examSessions.length > 0 ? (
                  <div className="space-y-3">
                    {student.examSessions.map(session => (
                      <div key={session.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{session.exam?.title}</h4>
                            <p className="text-sm text-gray-600">{session.exam?.course?.code} - {session.exam?.course?.title}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Started: {formatDateTime(session.startedAt)}
                            </p>
                            {session.endedAt && (
                              <p className="text-sm text-gray-500">
                                Ended: {formatDateTime(session.endedAt)}
                              </p>
                            )}
                            {session.duration && (
                              <p className="text-sm text-gray-500">
                                Duration: {session.duration} minutes
                              </p>
                            )}
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.isActive ? 'Active' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">No recent exam sessions</div>
                    <p className="text-gray-400 text-sm">This student hasn&apos;t started any exam sessions yet.</p>
                  </div>
                )}
              </div>

              {/* Recent Attendances */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Attendances</h3>
                {student.attendances && student.attendances.length > 0 ? (
                  <div className="space-y-3">
                    {student.attendances.map(attendance => (
                      <div key={attendance.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{attendance.exam?.title}</h4>
                            <p className="text-sm text-gray-600">
                              {attendance.exam?.course?.code} - {attendance.exam?.course?.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDateTime(attendance.timestamp)}
                            </p>
                          </div>
                          <div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {attendance.status || 'Present'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">No attendance records</div>
                    <p className="text-gray-400 text-sm">This student has no recorded attendances yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStudentPage;