import  { useState } from 'react';
import PropTypes from 'prop-types';

const QuestionCard = ({ 
  question, 
  onAnswerSelect,
  questionNumber = 1,
  totalQuestions = 1
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);
    onAnswerSelect(answer);
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch(question.difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'hard': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="p-6 border border-border dark:border-gray-700 rounded-xl shadow-lg bg-surface-elevated dark:bg-gray-800">
      {/* Question Header */}
      <div className="flex flex-wrap justify-between items-start mb-6 pb-4 border-b border-border dark:border-gray-700">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-sm font-medium">
              Question {questionNumber} of {totalQuestions}
            </span>
            {question.points && (
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                {question.points} point{question.points !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-text-primary dark:text-gray-100">Question ID: {question.id}</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {question.difficulty && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor()}`}>
              {question.difficulty}
            </span>
          )}
          {question.category && (
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium">
              {question.category}
            </span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-text-primary dark:text-gray-100">
          {question.questionText}
        </h3>
        
        {/* Question Type Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {question.questionType.replace('_', ' ')}
        </div>
      </div>

      {/* Question Image */}
      {question.imageUrl && (
        <div className="mb-6">
          <div className="relative rounded-lg overflow-hidden border border-border dark:border-gray-700">
            <img 
              src={question.imageUrl} 
              alt="Question visual" 
              className="w-full h-auto max-h-64 object-contain bg-gray-50 dark:bg-gray-900"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
              }}
            />
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs">
              Image Reference
            </div>
          </div>
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3">
        {question.questionType === 'MULTIPLE_CHOICE' && question.options?.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${selectedAnswer === option 
                ? 'border-primary dark:border-primary bg-primary/5 dark:bg-primary/10' 
                : 'border-border dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
          >
            <input
              type="radio"
              name={`answer-${question.id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={handleAnswerChange}
              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 dark:border-gray-600"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium
                  ${selectedAnswer === option 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-text-primary dark:text-gray-100">{option}</span>
              </div>
            </div>
            {selectedAnswer === option && (
              <svg className="w-5 h-5 text-green-500 dark:text-green-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </label>
        ))}

        {question.questionType === 'TRUE_FALSE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${selectedAnswer === 'True' 
                ? 'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-border dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <input
                type="radio"
                name={`answer-${question.id}`}
                value="True"
                checked={selectedAnswer === 'True'}
                onChange={handleAnswerChange}
                className="h-5 w-5 text-green-500 focus:ring-green-500 border-gray-300 dark:border-gray-600"
              />
              <div className="ml-3 flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center
                  ${selectedAnswer === 'True' ? 'bg-green-500' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  <span className={`text-sm font-medium ${selectedAnswer === 'True' ? 'text-white' : 'text-green-600 dark:text-green-400'}`}>
                    T
                  </span>
                </div>
                <span className={`text-lg font-medium ${selectedAnswer === 'True' ? 'text-green-700 dark:text-green-300' : 'text-text-primary dark:text-gray-100'}`}>
                  True
                </span>
              </div>
            </label>

            <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${selectedAnswer === 'False' 
                ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-border dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <input
                type="radio"
                name={`answer-${question.id}`}
                value="False"
                checked={selectedAnswer === 'False'}
                onChange={handleAnswerChange}
                className="h-5 w-5 text-red-500 focus:ring-red-500 border-gray-300 dark:border-gray-600"
              />
              <div className="ml-3 flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center
                  ${selectedAnswer === 'False' ? 'bg-red-500' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <span className={`text-sm font-medium ${selectedAnswer === 'False' ? 'text-white' : 'text-red-600 dark:text-red-400'}`}>
                    F
                  </span>
                </div>
                <span className={`text-lg font-medium ${selectedAnswer === 'False' ? 'text-red-700 dark:text-red-300' : 'text-text-primary dark:text-gray-100'}`}>
                  False
                </span>
              </div>
            </label>
          </div>
        )}

        {/* For other question types */}
        {!['MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(question.questionType) && (
          <div className="p-4 border border-border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <p className="text-text-secondary dark:text-gray-400 mb-3">
              {question.questionType === 'SHORT_ANSWER' && 'Please type your answer below:'}
              {question.questionType === 'FILL_IN_THE_BLANK' && 'Fill in the blank with the correct answer:'}
              {question.questionType === 'IMAGE_UPLOAD' && 'Please upload your answer image:'}
            </p>
            
            {question.questionType === 'IMAGE_UPLOAD' ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Upload your answer image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const answer = URL.createObjectURL(file);
                      setSelectedAnswer(answer);
                      onAnswerSelect(answer);
                    }
                  }}
                  className="text-sm text-gray-500"
                />
              </div>
            ) : (
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => {
                  setSelectedAnswer(e.target.value);
                  onAnswerSelect(e.target.value);
                }}
                placeholder="Type your answer here..."
                className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-text-primary dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                         transition-all duration-200"
              />
            )}
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {selectedAnswer && (
        <div className="mt-6 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Answer selected</span>
            <span className="text-sm ml-2 opacity-75">(Click to change)</span>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    questionText: PropTypes.string.isRequired,
    questionType: PropTypes.oneOf([
      'MULTIPLE_CHOICE',
      'TRUE_FALSE', 
      'SHORT_ANSWER',
      'IMAGE_UPLOAD',
      'FILL_IN_THE_BLANK'
    ]).isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    points: PropTypes.number,
    difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']),
    category: PropTypes.string,
  }).isRequired,
  
  onAnswerSelect: PropTypes.func.isRequired,
  
  questionNumber: PropTypes.number,
  totalQuestions: PropTypes.number,
};

// Default props
QuestionCard.defaultProps = {
  questionNumber: 1,
  totalQuestions: 1,
};

export default QuestionCard;


