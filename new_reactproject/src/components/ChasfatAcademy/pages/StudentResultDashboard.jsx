// components/student/StudentResultsDashboard.jsx
import  { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Trophy, TrendingUp, Clock, XCircle, BookOpen, Eye,ArrowLeft,
//  CheckCircle,  HelpCircle,
 // Download, Calendar, Award,
   Target, AlertCircle
} from 'lucide-react';
import { useStudentResults } from '@/hooks/useStudentResults';

import { useTheme } from '@/hooks/useTheme';

const StudentResultsDashboard = () => {
  const { darkMode } = useTheme();
 // const { student } = useSelector(state => state.studentAuth);
  const [selectedExamId, setSelectedExamId] = useState(null);
  
  const { 
    results, 
    resultsLoading, 
    performanceStats, 
    performanceLoading,
    examResultDetails,
    detailsLoading,
    detailsError
  } = useStudentResults(selectedExamId);

  if (resultsLoading || performanceLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-md p-6 mb-8`}>
        
        {/*
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Exam Results Dashboard</h1>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                View your exam performance and detailed results
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Trophy className="w-4 h-4" />
                <span>{performanceStats.passedExams || 0} Exams Passed</span>
              </div>
            </div>
          </div>
          */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
  <div>
    <h1 className="text-2xl font-bold">Exam Results Dashboard</h1>
    <p>View your exam performance and detailed results</p>
  </div>
  <div className="flex items-center gap-3">
    <Link 
      to="/student_exam_login"
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        darkMode 
          ? 'text-gray-300 hover:bg-gray-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Link>
    <div className="text-sm text-gray-500">
      <Trophy className="w-4 h-4 inline mr-1" />
      {performanceStats.passedExams} Exams Passed
    </div>
  </div>
</div>



        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Average Score',
              value: `${performanceStats.averageScore?.toFixed(1) || '0.0'}%`,
              icon: BarChart3,
              color: 'blue',
              description: 'Across all exams'
            },
            {
              title: 'Pass Rate',
              value: `${performanceStats.passRate || 0}%`,
              icon: TrendingUp,
              color: 'green',
              description: 'Exams passed'
            },
            {
              title: 'Exams Taken',
              value: performanceStats.totalExams || 0,
              icon: BookOpen,
              color: 'yellow',
              description: 'Total attempts'
            },
            {
              title: 'Questions',
              value: `${performanceStats.totalCorrectAnswers || 0}/${performanceStats.totalQuestionsAnswered || 0}`,
              icon: Target,
              color: 'purple',
              description: 'Correct/Total'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                } rounded-lg`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                {stat.title}
              </h3>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results List - 2/3 width */}
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Exam Results</h2>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {results.length} {results.length === 1 ? 'Result' : 'Results'}
                </span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No exam results available</p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Complete an exam to see your results here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} border rounded-lg p-4 transition-colors`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{result.exam.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {result.exam.course.code}
                            </span>
                            <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {new Date(result.submittedAt).toLocaleDateString()}
                            </span>
                            <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Clock className="w-3 h-3" />
                              {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m` : '--'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              result.isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {result.percentage}%
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {result.correctAnswers}/{result.totalQuestions} correct
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.isPassed 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                          }`}>
                            {result.grade}
                          </div>
                          
                          <button
                            onClick={() => setSelectedExamId(result.exam.id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Performance by Course */}
          <div>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-md p-6`}>
              <h2 className="text-xl font-bold mb-6">Performance by Course</h2>
              
              {performanceStats.byCourse?.length > 0 ? (
                <div className="space-y-4">
                  {performanceStats.byCourse.map((course, index) => (
                    <div key={index} className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border rounded-lg p-4`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{course.course}</h4>
                        <span className="text-sm font-semibold">{course.averageScore.toFixed(1)}%</span>
                      </div>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {course.code}
                      </p>
                      <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2`}>
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(course.averageScore, 100)}%` }}
                        />
                      </div>
                      <div className={`flex justify-between text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span>{course.totalExams} exam{course.totalExams !== 1 ? 's' : ''}</span>
                        <span>Average</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>No course data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exam Details Modal */}
        {selectedExamId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Exam Result Details</h2>
                  <button
                    onClick={() => setSelectedExamId(null)}
                    className={`p-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors`}
                  >
                    <XCircle className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
                
                {detailsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  </div>
                ) : detailsError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Failed to load exam details</p>
                  </div>
                ) : examResultDetails ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                      <h3 className="text-lg font-bold mb-2">{examResultDetails.result.exam.title}</h3>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {examResultDetails.result.exam.course.title}
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Submitted: {new Date(examResultDetails.result.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Score Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { 
                          value: examResultDetails.result.correctAnswers, 
                          label: 'Correct', 
                          color: 'green' 
                        },
                        { 
                          value: examResultDetails.result.wrongAnswers, 
                          label: 'Wrong', 
                          color: 'red' 
                        },
                        { 
                          value: examResultDetails.result.unanswered, 
                          label: 'Unanswered', 
                          color: 'gray' 
                        },
                        { 
                          value: `${examResultDetails.result.percentage}%`, 
                          label: 'Score', 
                          color: examResultDetails.result.isPassed ? 'green' : 'red' 
                        }
                      ].map((item, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg text-center ${
                            item.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                            item.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                            darkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`text-2xl font-bold ${
                            item.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            item.color === 'red' ? 'text-red-600 dark:text-red-400' :
                            darkMode ? 'text-gray-300' : 'text-gray-800'
                          }`}>
                            {item.value}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Detailed Questions */}
                    <div>
                      <h4 className="font-bold mb-4">Question Analysis</h4>
                      <div className="space-y-3">
                        {examResultDetails.result.questionAnalysis?.map((question, index) => (
                          <div 
                            key={index} 
                            className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border rounded-lg p-4`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-medium">
                                  Q{question.questionNumber}: {question.question}
                                </span>
                                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Your answer: <span className={question.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {question.studentAnswer || 'Not answered'}
                                  </span>
                                </p>
                                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Correct answer: {question.correctAnswer}
                                </p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                question.isCorrect 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                                {question.isCorrect ? 'Correct' : 'Incorrect'}
                              </div>
                            </div>
                            {question.timeSpent && (
                              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Time spent: {question.timeSpent}s
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResultsDashboard;