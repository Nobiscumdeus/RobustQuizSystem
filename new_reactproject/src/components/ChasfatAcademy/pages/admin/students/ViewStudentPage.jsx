import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStudentWithDetails, useStudentHelpers } from '@hooks/useStudent';

const ViewStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  // Use our custom hooks
  const { 
    student, 
    stats, 
    isLoading, 
    error, 
    //refetch 
  } = useStudentWithDetails(studentId);
  
  const { formatDate, formatDateTime, getGradeColor } = useStudentHelpers();
  
  const [activeTab, setActiveTab] = useState('overview');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgb(var(--color-primary))' }}
        ></div>
        <span 
          className="ml-3 text-lg"
          style={{ color: 'rgb(var(--color-text-secondary))' }}
        >
          Loading student data...
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-8">
        <div 
          className="text-lg mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))'
          }}
        >
          {error}
        </div>
        <button
          onClick={() => navigate('/admin_panel')}
          className="px-4 py-2 rounded-md"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'white'
          }}
        >
          Back to List
        </button>
      </div>
    );
  }

  // No student found
  if (!student) {
    return (
      <div className="text-center p-8">
        <div 
          className="text-lg mb-4"
          style={{ color: 'rgb(var(--color-text-secondary))' }}
        >
          Student not found
        </div>
        <button
          onClick={() => navigate('/admin_panel')}
          className="px-4 py-2 rounded-md"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'white'
          }}
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
          <h1 
            className="text-3xl font-bold"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Student Details
          </h1>
          <p 
            className="mt-1"
            style={{ color: 'rgb(var(--color-text-secondary))' }}
          >
            Comprehensive student information and performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/student/${studentId}/edit`}
            className="px-4 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: 'rgb(var(--color-primary))',
              color: 'white'
            }}
          >
            Edit Student
          </Link>
          <button
            onClick={() => navigate('/admin_panel')}
            className="px-4 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: 'rgb(var(--color-surface-elevated))',
              color: 'rgb(var(--color-text-primary))',
              border: '1px solid rgb(var(--color-border))'
            }}
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Student Header Card */}
      <div 
        className="rounded-lg overflow-hidden mb-6"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div 
          className="p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)'
          }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
              <p className="opacity-90 text-lg">Matric No: {student.matricNo}</p>
              <p className="opacity-90">{student.department} • Level {student.level}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span 
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: student.isActive 
                    ? 'rgb(var(--color-success))' 
                    : 'rgb(var(--color-error))',
                  color: 'white'
                }}
              >
                {student.isActive ? 'Active Student' : 'Inactive Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div 
          className="p-6 border-b"
          style={{
            backgroundColor: 'rgb(var(--color-background))',
            borderColor: 'rgb(var(--color-border))'
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: 'rgb(var(--color-primary))' }}
              >
                {stats?.totalCourses || 0}
              </div>
              <div 
                className="text-sm"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Total Courses
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: 'rgb(var(--color-success))' }}
              >
                {stats?.totalExams || 0}
              </div>
              <div 
                className="text-sm"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Exams Taken
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: 'rgb(168, 85, 247)' }}
              >
                {stats?.averageScore || 0}%
              </div>
              <div 
                className="text-sm"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Average Score
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: 'rgb(var(--color-info))' }}
              >
                {stats?.passedExams || 0}
              </div>
              <div 
                className="text-sm"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Passed Exams
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div 
        className="rounded-lg mb-6"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ borderColor: 'rgb(var(--color-border))' }} className="border-b">
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
                style={{
                  borderBottomColor: activeTab === tab.id ? 'rgb(var(--color-primary))' : 'transparent',
                  color: activeTab === tab.id 
                    ? 'rgb(var(--color-primary))' 
                    : 'rgb(var(--color-text-secondary))'
                }}
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
              <div 
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'rgb(var(--color-background))'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  Basic Information
                </h3>
                <div className="space-y-4">
                  {[
                    ['Email', student.email || 'Not provided'],
                    ['Phone', student.phone || 'Not provided'],
                    ['Department', student.department || 'Not specified'],
                    ['Level', student.level || 'Not specified'],
                    ['Last Active', formatDateTime(student.lastActive)],
                    ['Registered', formatDate(student.createdAt)]
                  ].map(([label, value], index) => (
                    <div key={index} className="flex justify-between">
                      <span style={{ color: 'rgb(var(--color-text-secondary))' }}>{label}:</span>
                      <span style={{ color: 'rgb(var(--color-text-primary))' }} className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examiner Information */}
              <div 
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'rgb(var(--color-background))'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  Examiner Information
                </h3>
                {student.examiner ? (
                  <div className="space-y-4">
                    {[
                      ['Name', `${student.examiner.firstName} ${student.examiner.lastName}`],
                      ['Email', student.examiner.email],
                      ['Phone', student.examiner.phone || 'Not provided']
                    ].map(([label, value], index) => (
                      <div key={index} className="flex justify-between">
                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>{label}:</span>
                        <span style={{ color: 'rgb(var(--color-text-primary))' }} className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'rgb(var(--color-text-secondary))' }}>No examiner assigned</p>
                )}
              </div>

              {/* Performance Summary */}
              <div 
                className="p-6 rounded-lg lg:col-span-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  Performance Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    className="text-center p-4 rounded-lg"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <div 
                      className="text-xl font-bold"
                      style={{ color: 'rgb(var(--color-primary))' }}
                    >
                      {stats?.highestScore || 0}%
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Highest Score
                    </div>
                  </div>
                  <div 
                    className="text-center p-4 rounded-lg"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <div 
                      className="text-xl font-bold"
                      style={{ color: 'rgb(var(--color-error))' }}
                    >
                      {stats?.lowestScore || 0}%
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Lowest Score
                    </div>
                  </div>
                  <div 
                    className="text-center p-4 rounded-lg"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <div 
                      className="text-xl font-bold"
                      style={{ color: 'rgb(var(--color-success))' }}
                    >
                      {stats?.activeCourses || 0}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Active Courses
                    </div>
                  </div>
                  <div 
                    className="text-center p-4 rounded-lg"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <div 
                      className="text-xl font-bold"
                      style={{ color: 'rgb(168, 85, 247)' }}
                    >
                      {stats?.totalAttendances || 0}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Total Attendances
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Enrolled Courses
              </h3>
              {student.courses && student.courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
                    <thead style={{ backgroundColor: 'rgb(var(--color-background))' }}>
                      <tr>
                        {['Course Code', 'Title', 'Semester', 'Credit Hours', 'Status', 'Enrolled', 'Action'].map((header) => (
                          <th 
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-text-secondary))' }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ 
                      backgroundColor: 'rgb(var(--color-surface-elevated))',
                      borderColor: 'rgb(var(--color-border))' 
                    }}>
                      {student.courses.map(course => (
                        <tr key={course.id} className="hover:opacity-90">
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                            {course.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'rgb(var(--color-text-primary))' }}>
                            {course.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                            {course.semester || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                            {course.creditHours || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: course.isActive 
                                  ? 'rgba(52, 211, 153, 0.2)' 
                                  : 'rgba(75, 85, 99, 0.2)',
                                color: course.isActive 
                                  ? 'rgb(52, 211, 153)' 
                                  : 'rgb(156, 163, 175)'
                              }}
                            >
                              {course.enrollmentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                            {formatDate(course.enrolledAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              to={`/course/${course.id}`}
                              style={{ color: 'rgb(var(--color-primary))' }}
                              className="font-medium hover:opacity-80"
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
                <div 
                  className="text-center py-8 rounded-lg"
                  style={{
                    backgroundColor: 'rgb(var(--color-background))'
                  }}
                >
                  <div 
                    className="text-lg mb-2"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    No courses enrolled
                  </div>
                  <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    This student hasn&apos;t been enrolled in any courses yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Exam Results
              </h3>
              {student.results && student.results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
                    <thead style={{ backgroundColor: 'rgb(var(--color-background))' }}>
                      <tr>
                        {['Exam', 'Course', 'Score', 'Grade', 'Status', 'Date'].map((header) => (
                          <th 
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-text-secondary))' }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ 
                      backgroundColor: 'rgb(var(--color-surface-elevated))',
                      borderColor: 'rgb(var(--color-border))' 
                    }}>
                      {student.results.map(result => {
                        const gradeColor = getGradeColor(result.score);
                        return (
                          <tr key={result.id} className="hover:opacity-90">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div style={{ color: 'rgb(var(--color-text-primary))' }} className="font-medium">
                                {result.exam?.title || 'Unknown Exam'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-mono text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                                {result.exam?.course?.code}
                              </div>
                              <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                                {result.exam?.course?.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                  backgroundColor: gradeColor.bg,
                                  color: gradeColor.text
                                }}
                              >
                                {result.score !== null ? `${result.score}%` : 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>
                              {result.grade || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: result.isPassed 
                                    ? 'rgba(52, 211, 153, 0.2)' 
                                    : 'rgba(239, 68, 68, 0.2)',
                                  color: result.isPassed 
                                    ? 'rgb(52, 211, 153)' 
                                    : 'rgb(239, 68, 68)'
                                }}
                              >
                                {result.isPassed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                              {formatDate(result.exam?.date)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div 
                  className="text-center py-8 rounded-lg"
                  style={{
                    backgroundColor: 'rgb(var(--color-background))'
                  }}
                >
                  <div 
                    className="text-lg mb-2"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    No exam results available
                  </div>
                  <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    This student hasn&apos;t taken any exams yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Recent Exam Sessions */}
              <div>
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  Recent Exam Sessions
                </h3>
                {student.examSessions && student.examSessions.length > 0 ? (
                  <div className="space-y-3">
                    {student.examSessions.map(session => (
                      <div 
                        key={session.id} 
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: 'rgb(var(--color-background))',
                          borderColor: 'rgb(var(--color-border))'
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>
                              {session.exam?.title}
                            </h4>
                            <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                              {session.exam?.course?.code} - {session.exam?.course?.title}
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                              Started: {formatDateTime(session.startedAt)}
                            </p>
                            {session.endedAt && (
                              <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                                Ended: {formatDateTime(session.endedAt)}
                              </p>
                            )}
                            {session.duration && (
                              <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                                Duration: {session.duration} minutes
                              </p>
                            )}
                          </div>
                          <div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: session.isActive 
                                  ? 'rgba(52, 211, 153, 0.2)' 
                                  : 'rgba(75, 85, 99, 0.2)',
                                color: session.isActive 
                                  ? 'rgb(52, 211, 153)' 
                                  : 'rgb(156, 163, 175)'
                              }}
                            >
                              {session.isActive ? 'Active' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="text-center py-6 rounded-lg"
                    style={{
                      backgroundColor: 'rgb(var(--color-background))'
                    }}
                  >
                    <div style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      No recent exam sessions
                    </div>
                    <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      This student hasn&apos;t started any exam sessions yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Attendances */}
              <div>
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  Recent Attendances
                </h3>
                {student.attendances && student.attendances.length > 0 ? (
                  <div className="space-y-3">
                    {student.attendances.map(attendance => (
                      <div 
                        key={attendance.id} 
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: 'rgb(var(--color-background))',
                          borderColor: 'rgb(var(--color-border))'
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>
                              {attendance.exam?.title}
                            </h4>
                            <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                              {attendance.exam?.course?.code} - {attendance.exam?.course?.title}
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                              {formatDateTime(attendance.timestamp)}
                            </p>
                          </div>
                          <div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: 'rgb(59, 130, 246)'
                              }}
                            >
                              {attendance.status || 'Present'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="text-center py-6 rounded-lg"
                    style={{
                      backgroundColor: 'rgb(var(--color-background))'
                    }}
                  >
                    <div style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      No attendance records
                    </div>
                    <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      This student has no recorded attendances yet.
                    </p>
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



