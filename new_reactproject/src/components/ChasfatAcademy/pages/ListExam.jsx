import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCurrentUser } from '@hooks/useAuth';
import { useExaminerExams } from '@hooks/useQuestion';

const ListExams = () => {
  const [expandedExams, setExpandedExams] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const { user } = useCurrentUser();
  const { 
    exams, 
    isLoading, 
    error, 
    refetch,
    isEmpty 
  } = useExaminerExams(user?.id);

  const toggleExpand = (examId) => {
    setExpandedExams(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    if (now < startTime) return { status: 'upcoming', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
    if (now >= startTime && now <= endTime) return { status: 'active', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
    if (now > endTime) return { status: 'completed', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' };
    return { status: 'unknown', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' };
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary dark:text-gray-400">Loading exams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold">Error Loading Exams</h3>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={() => refetch()} 
                className="mt-3 text-sm px-3 py-1.5 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700 p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-semibold text-text-primary dark:text-gray-100 mb-2">No Exams Found</h3>
          <p className="text-text-secondary dark:text-gray-400 mb-4">You haven&apos;t created any exams yet.</p>
          <button
            onClick={() => window.location.href = '/create-exam'}
            className="px-4 py-2 rounded-lg bg-primary dark:bg-primary text-white hover:bg-primary-hover dark:hover:bg-primary-hover transition-colors"
          >
            Create Your First Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">My Exams</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">
              Total: <span className="font-semibold text-primary dark:text-primary">{exams.length}</span> exams
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-border dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-primary dark:bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-400'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-primary dark:bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-400'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-text-primary dark:text-gray-100">
                {exams.filter(e => getExamStatus(e).status === 'upcoming').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-text-primary dark:text-gray-100">
                {exams.filter(e => getExamStatus(e).status === 'active').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-text-primary dark:text-gray-100">
                {exams.filter(e => getExamStatus(e).status === 'completed').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl p-4 border border-border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary dark:text-gray-400">Total Duration</p>
              <p className="text-2xl font-bold text-text-primary dark:text-gray-100">
                {formatDuration(exams.reduce((sum, e) => sum + (e.duration || 0), 0))}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Exams Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
        {exams.map((exam) => {
          const status = getExamStatus(exam);
          
          return (
            <div 
              key={exam.id} 
              className={`bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${viewMode === 'list' ? 'flex' : ''}`}
            >
              {/* Exam Header */}
              <div 
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${viewMode === 'list' ? 'flex-1' : ''}`}
                onClick={() => toggleExpand(exam.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                  </div>
                  <span className="text-xs text-text-secondary dark:text-gray-400">
                    ID: {exam.id}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-2 line-clamp-2">
                  {exam.title}
                </h3>
                
                <div className="space-y-2 text-sm text-text-secondary dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(exam.duration || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(exam.startTime).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons (List View Only) */}
              {viewMode === 'list' && (
                <div className="flex flex-col border-l border-border dark:border-gray-700">
                  <button
                    onClick={() => toggleExpand(exam.id)}
                    className="flex-1 p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <svg 
                      className={`w-5 h-5 text-text-secondary dark:text-gray-400 transition-transform ${expandedExams[exam.id] ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Expanded Content */}
              {expandedExams[exam.id] && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-border dark:border-gray-700">
                  {/* Exam Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-2">EXAM DETAILS</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-text-secondary dark:text-gray-400">Course ID</p>
                          <p className="text-text-primary dark:text-gray-100 font-medium">{exam.courseId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary dark:text-gray-400">Examiner ID</p>
                          <p className="text-text-primary dark:text-gray-100 font-medium">{exam.examinerId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary dark:text-gray-400">Exam Code</p>
                          <p className="text-text-primary dark:text-gray-100 font-mono text-sm">{exam.examCode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-2">TIMINGS</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-text-secondary dark:text-gray-400">Start Time</p>
                          <p className="text-text-primary dark:text-gray-100">
                            {new Date(exam.startTime).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary dark:text-gray-400">End Time</p>
                          <p className="text-text-primary dark:text-gray-100">
                            {new Date(exam.endTime).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary dark:text-gray-400">Created</p>
                          <p className="text-text-primary dark:text-gray-100">
                            {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {exam.description && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-2">DESCRIPTION</h4>
                      <p className="text-text-primary dark:text-gray-100 p-3 rounded-lg bg-white dark:bg-gray-800 border border-border dark:border-gray-700">
                        {exam.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border dark:border-gray-700">
                    <button
                      onClick={() => {
                        // View exam details
                        window.location.href = `/exams/${exam.id}`;
                      }}
                      className="px-4 py-2 rounded-lg bg-primary dark:bg-primary text-white hover:bg-primary-hover dark:hover:bg-primary-hover transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        // Edit exam
                        toast.info('Edit functionality coming soon');
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Exam
                    </button>
                    <button
                      onClick={() => {
                        // View questions
                        window.location.href = `/exams/${exam.id}/questions`;
                      }}
                      className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      View Questions
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="mt-8 pt-6 border-t border-border dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-text-secondary dark:text-gray-400">
            Showing {exams.length} exam{exams.length !== 1 ? 's' : ''} • Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/create-exam'}
              className="px-4 py-2 rounded-lg bg-primary dark:bg-primary text-white hover:bg-primary-hover dark:hover:bg-primary-hover transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListExams;
/*
import { useState, useEffect } from 'react';
import axios from 'axios';

const ListExams = () => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get('/api/exams');
        setExams(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="mt-5 max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">List of Exams</h2>
      <ul>
        {exams.map((exam) => (
          <li key={exam.id} className="mb-4">
            <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <h3 className="text-xl font-bold">{exam.title}</h3>
              <p>Date: {new Date(exam.date).toLocaleString()}</p>
              <p>Duration: {exam.duration} minutes</p>
              <p>Course ID: {exam.courseId}</p>
              <p>Examiner ID: {exam.examinerId}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListExams;
*/