import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useQuestionsByExam } from '@hooks/useQuestion';
import { useDeleteQuestion } from '@hooks/useQuestion';

const ListQuestions = ({ examId }) => {
 // const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  
  // Use custom hooks
  const { 
    questions, 
    isLoading, 
    error, 
    refetch 
  } = useQuestionsByExam(examId);
  
  const { deleteQuestion, isLoading: isDeleting } = useDeleteQuestion();

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const result = await deleteQuestion(questionId);
      
      if (result.success) {
        toast.success('Question deleted successfully!');
        refetch(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to delete question');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary dark:text-gray-400">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold">Error Loading Questions</h3>
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

  if (!questions.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700 p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-text-primary dark:text-gray-100 mb-2">No Questions Found</h3>
          <p className="text-text-secondary dark:text-gray-400 mb-4">This exam doesn&apos;t have any questions yet.</p>
          <p className="text-sm text-text-secondary/70 dark:text-gray-500">Add questions using the question creation form.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100">Exam Questions</h2>
            <p className="text-text-secondary dark:text-gray-400 mt-1">
              Total: <span className="font-semibold text-primary dark:text-primary">{questions.length}</span> questions
            </p>
          </div>
          <div className="flex items-center gap-3">
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

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700 overflow-hidden"
          >
            {/* Question Header */}
            <div 
              className="p-4 border-b border-border dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              onClick={() => toggleExpand(question.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-sm font-medium">
                      Q{index + 1}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {question.points || 1} point{question.points !== 1 ? 's' : ''}
                    </span>
                    {question.difficulty && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${question.difficulty === 'easy' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : question.difficulty === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                        {question.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 line-clamp-2">
                    {question.questionText}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {question.questionType.replace('_', ' ')}
                    </span>
                    {question.category && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {question.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <svg 
                    className={`w-5 h-5 text-text-secondary dark:text-gray-400 transition-transform ${expandedQuestions[question.id] ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedQuestions[question.id] && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-border dark:border-gray-700">
                {/* Question Details */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-3">QUESTION DETAILS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Question ID</p>
                      <p className="text-text-primary dark:text-gray-100 font-mono">{question.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Created</p>
                      <p className="text-text-primary dark:text-gray-100">
                        {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Order</p>
                      <p className="text-text-primary dark:text-gray-100">{question.order || 1}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Status</p>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-2">CORRECT ANSWER</h4>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-green-700 dark:text-green-300 font-medium">{question.correctAnswer}</p>
                  </div>
                </div>

                {/* Options for Multiple Choice */}
                {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-3">OPTIONS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((option, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg border text-sm transition-all
                            ${option === question.correctAnswer 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' 
                              : 'bg-gray-50 dark:bg-gray-800 border-border dark:border-gray-700 text-text-primary dark:text-gray-300'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{String.fromCharCode(65 + i)}.</span>
                              <span>{option}</span>
                            </div>
                            {option === question.correctAnswer && (
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Correct
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Image */}
                {question.imageUrl && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-3">ATTACHED IMAGE</h4>
                    <div className="relative rounded-lg overflow-hidden border border-border dark:border-gray-700 max-w-md">
                      <img 
                        src={question.imageUrl} 
                        alt="Question" 
                        className="w-full h-auto max-h-48 object-contain bg-gray-50 dark:bg-gray-900"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-gray-700">
                  <button
                    onClick={() => {
                      // Navigate to edit page or open edit modal
                      toast.info('Edit functionality coming soon');
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 pt-6 border-t border-border dark:border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="text-sm text-text-secondary dark:text-gray-400">
            Showing {questions.length} question{questions.length !== 1 ? 's' : ''} for this exam
          </div>
          <div className="text-sm text-text-secondary dark:text-gray-400">
            Total Points: <span className="font-semibold text-primary dark:text-primary">
              {questions.reduce((sum, q) => sum + (parseFloat(q.points) || 1), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

ListQuestions.propTypes = {
  examId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ListQuestions;


