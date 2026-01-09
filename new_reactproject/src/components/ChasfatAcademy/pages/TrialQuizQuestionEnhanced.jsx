import { useSelector, useDispatch } from 'react-redux';
import { submitAnswer, nextQuestion, prevQuestion } from "../../../features/ChasfatAcademy/trial_quiz/trial_quizSlice";
import { motion } from 'framer-motion';

const EnhancedQuizQuestion = () => {
  const dispatch = useDispatch();
  const { questions, currentQuestion, answers } = useSelector(state => state.trial_quiz);
  const question = questions[currentQuestion];

  // Get answer for current question using question.id
  const currentQuestionAnswer = answers[question.id];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface border border-border shadow-lg rounded-xl p-6"
    >
      {/* Question Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-primary rounded-full mr-3"></div>
            <div>
              <span className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>
          
          {/* Question Type Indicator */}
          <div className="flex items-center text-sm text-text-secondary">
            <span className="bg-surface-elevated px-3 py-1 rounded-lg border border-border">
              {question.type || "Multiple Choice"}
            </span>
          </div>
        </div>
        
        {/* Question Text */}
        <div className="mb-2">
          <h3 className="text-2xl font-bold text-text-primary leading-relaxed">
            {question.questionText}
          </h3>
          {question.description && (
            <p className="mt-3 text-text-secondary text-lg">
              {question.description}
            </p>
          )}
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-4 mb-8">
        {question.answers.map((answer, index) => (
          <motion.button
            key={answer.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => dispatch(submitAnswer(answer))}
            className={`
              w-full text-left p-5 rounded-xl border transition-all duration-200
              flex items-start group
              ${currentQuestionAnswer?.id === answer.id 
                ? 'bg-primary/10 border-primary shadow-md' 
                : 'border-border hover:bg-surface-elevated hover:shadow-sm'
              }
            `}
          >
            {/* Answer Index/Letter */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-bold
              ${currentQuestionAnswer?.id === answer.id 
                ? 'bg-primary text-white' 
                : 'bg-surface-elevated text-text-secondary'
              }
            `}>
              {String.fromCharCode(65 + index)} {/* A, B, C, D, etc. */}
            </div>
            
            {/* Answer Text */}
            <div className="flex-1">
              <p className={`
                text-lg font-medium
                ${currentQuestionAnswer?.id === answer.id 
                  ? 'text-text-primary' 
                  : 'text-text-primary'
                }
              `}>
                {answer.answerText}
              </p>
              {answer.explanation && currentQuestionAnswer?.id === answer.id && (
                <p className="mt-2 text-sm text-text-secondary">
                  {answer.explanation}
                </p>
              )}
            </div>
            
            {/* Selection Indicator */}
            {currentQuestionAnswer?.id === answer.id && (
              <div className="ml-4 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(prevQuestion())}
          disabled={currentQuestion === 0}
          className={`
            px-6 py-3 rounded-lg font-medium flex items-center transition-all
            ${currentQuestion === 0 
              ? 'text-text-tertiary cursor-not-allowed opacity-50' 
              : 'text-primary hover:bg-primary/10'
            }
          `}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous Question
        </motion.button>

        <div className="text-center text-sm text-text-secondary">
          Select an answer to continue
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(nextQuestion())}
          disabled={currentQuestion === questions.length - 1}
          className={`
            px-6 py-3 rounded-lg font-medium flex items-center transition-all
            ${currentQuestion === questions.length - 1
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-hover text-white shadow-lg'
            }
          `}
        >
          Next Question
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EnhancedQuizQuestion;



/*

import { useSelector, useDispatch } from 'react-redux';
import {submitAnswer, nextQuestion, prevQuestion} from "../../../features/ChasfatAcademy/trial_quiz/trial_quizSlice";


const EnhancedQuizQuestion = () => {
  const dispatch = useDispatch();
  const { questions, currentQuestion, answers } = useSelector(state => state.trial_quiz);
  const question = questions[currentQuestion];

  // Get answer for current question using question.id
  const currentQuestionAnswer = answers[question.id];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          {question.questionText}
        </h3>
      </div>

      <div className="space-y-3">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => dispatch(submitAnswer(answer))}
            className={`
              w-full text-left p-4 rounded-lg border
              transition-all duration-200
              ${currentQuestionAnswer?.id === answer.id 
                ? 'bg-blue-50 border-blue-500' 
                : 'hover:bg-gray-50 border-gray-200'}
            `}
          >
            {answer.answerText}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => dispatch(prevQuestion())}
          disabled={currentQuestion === 0}
          className="px-4 py-2 text-blue-600 disabled:text-gray-400"
        >
          Previous
        </button>
        <button
          onClick={() => dispatch(nextQuestion())}
          disabled={currentQuestion === questions.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EnhancedQuizQuestion;

*/