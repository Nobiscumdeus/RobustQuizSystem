
import { useState, useEffect, useCallback, useMemo } from "react";
import { Calculator, Send, User, BookOpen, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@hooks/useTheme";

import { useStudentExam } from '@hooks/useStudentExam';

import PropTypes from "prop-types";

import { setExamQuestions, setExamSession, updateAnswer, clearExamData } from "../../../features/ChasfatAcademy/auth/studentAuthSlice";
import { toast } from 'react-toastify';

// Personalized Exam Header Component
const PersonalizedExamHeader = ({ student, exam, timeRemaining, onSubmit }) => {

  
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const timeColor = useMemo(() => {
    if (timeRemaining <= 300) return 'text-red-600'; // Last 5 minutes
    if (timeRemaining <= 900) return 'text-orange-600'; // Last 15 minutes
    return 'text-green-600';
  }, [timeRemaining]);

  /*
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{exam?.title || 'Loading...'}</h1>
            <p className="text-gray-600">{student?.firstName} {student?.lastName} • {student?.matricNo}</p>
            <p className="text-sm text-gray-500">{exam?.course?.title || 'Loading course...'}</p>
          </div>
        </div>

     
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-2xl font-mono font-bold ${timeColor}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-xs text-gray-500">Time Remaining</p>
          </div>
          
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Submit Exam
          </button>
        </div>
      </div>

      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{exam?.currentQuestion || 1} of <strong>{exam?.totalQuestions || 0}</strong></span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${exam?.totalQuestions ? ((exam.currentQuestion || 1) / exam.totalQuestions) * 100 : 0}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
  */
 const { darkMode } = useTheme();

return (
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Student & Exam Info */}
      <div className="flex items-center gap-4">
        <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full p-3`}>
          <User className={`w-6 h-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {exam?.title || 'Loading...'}
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {student?.firstName} {student?.lastName} • {student?.matricNo}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {exam?.course?.title || 'Loading course...'}
          </p>
        </div>
      </div>

      {/* Timer & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className={`text-2xl font-mono font-bold ${timeColor} ${darkMode ? 'text-gray-100' : ''}`}>
            {formatTime(timeRemaining)}
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Time Remaining
          </p>
        </div>
        
        <button
          onClick={onSubmit}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          Submit Exam
        </button>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-2">
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          Progress
        </span>
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          {exam?.currentQuestion || 1} of{' '}
          <strong className={darkMode ? 'text-gray-100' : 'text-gray-800'}>
            {exam?.totalQuestions || 0}
          </strong>
        </span>
      </div>
      <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
        <div 
          className={`${darkMode ? 'bg-blue-500' : 'bg-blue-600'} h-3 rounded-full transition-all duration-300`}
          style={{ 
            width: `${exam?.totalQuestions ? ((exam.currentQuestion || 1) / exam.totalQuestions) * 100 : 0}%` 
          }}
        ></div>
      </div>
    </div>
  </div>
);




};

PersonalizedExamHeader.propTypes ={
  student:PropTypes.shape({
    firstName:PropTypes.string.isRequired,
    lastName:PropTypes.string.isRequired,
    matricNo:PropTypes.string.isRequired
  }),
  exam:PropTypes.shape({
    title:PropTypes.string,
    course:PropTypes.shape({
      title:PropTypes.string
    }),
    currentQuestion:PropTypes.number,
    totalQuestions:PropTypes.number,
    duration:PropTypes.number
  }),
  timeRemaining:PropTypes.number.isRequired,
  onSubmit:PropTypes.func.isRequired
}
// Question Navigation Component
const PersonalizedQuestionNavigation = ({ questions, currentQuestion, onQuestionSelect, answers }) => {
    const { darkMode } = useTheme();

  if (!questions || questions.length === 0) {

/*
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          <span>Loading questions...</span>
        </div>
      </div>
    );
    */


return (
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
    <div className="flex items-center justify-center">
      <Loader className={`w-5 h-5 animate-spin mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
        Loading questions...
      </span>
    </div>
  </div>
);

  }



return (
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <BookOpen className="w-5 h-5" />
      Question Navigation
    </h3>
    
    <div className="grid grid-cols-5 gap-2">
      {questions.map((_, index) => {
        const questionNumber = index + 1;
        const isAnswered = answers[questionNumber] !== undefined && answers[questionNumber] !== '';
        const isCurrent = currentQuestion === questionNumber;
        
        return (
          <button
            key={questionNumber}
            onClick={() => onQuestionSelect(questionNumber)}
            className={`
              w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
              ${isCurrent 
                ? darkMode 
                  ? 'bg-blue-500 text-white ring-2 ring-blue-700' 
                  : 'bg-blue-600 text-white ring-2 ring-blue-300'
                : isAnswered 
                  ? darkMode
                    ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                  : darkMode
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {questionNumber}
          </button>
        );
      })}
    </div>
    
    <div className="mt-4 space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}></div>
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Answered</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Not Answered</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Current</span>
      </div>
    </div>
  </div>
);


};

PersonalizedQuestionNavigation.propTypes ={
  questions:PropTypes.arrayOf(PropTypes.object),
  currentQuestion:PropTypes.number.isRequired,
  onQuestionSelect:PropTypes.func.isRequired,
  answers:PropTypes.object
}
// Enhanced Question Component
const PersonalizedQuizQuestion = ({ question, currentAnswer, onAnswerChange, questionNumber }) => {
  
  const { darkMode } = useTheme();
  if (!question) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin mr-3" />
        <span>Loading question...</span>
      </div>
    );
  }

  const handleAnswerSelect = (answer) => {
    onAnswerChange(parseInt(questionNumber), answer);
  };

 

return (
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={`${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} px-3 py-1 rounded-full text-sm font-medium`}>
          Question {questionNumber}
        </span>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          ({question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''})
        </span>
      </div>
      
      <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
        {question.questionText}
      </h2>
      
      {question.imageUrl && (
        <div className="mb-6">
          <img 
            src={question.imageUrl} 
            alt="Question illustration" 
            className="max-w-full h-auto rounded-lg border"
            onError={(e) => {
              e.target.style.display = 'none';
              console.log('Failed to load image:', question.imageUrl);
            }}
          />
        </div>
      )}
    </div>

    {/* Multiple Choice Options */}
    {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = currentAnswer === option;
          
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? darkMode 
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300' 
                    : 'border-blue-500 bg-blue-50 text-blue-700'
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${isSelected 
                    ? darkMode
                      ? 'border-blue-500 bg-blue-500 text-gray-100'
                      : 'border-blue-500 bg-blue-500 text-white'
                    : darkMode
                      ? 'border-gray-600 text-gray-400'
                      : 'border-gray-300 text-gray-600'
                  }
                `}>
                  {optionLetter}
                </div>
                <span className={`flex-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    )}

    {/* True/False Options */}
    {question.questionType === 'TRUE_FALSE' && (
      <div className="space-y-3">
        {['True', 'False'].map((option, index) => {
          const isSelected = currentAnswer === option;
          
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? darkMode 
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300' 
                    : 'border-blue-500 bg-blue-50 text-blue-700'
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${isSelected 
                    ? darkMode
                      ? 'border-blue-500 bg-blue-500 text-gray-100'
                      : 'border-blue-500 bg-blue-500 text-white'
                    : darkMode
                      ? 'border-gray-600 text-gray-400'
                      : 'border-gray-300 text-gray-600'
                  }
                `}>
                  {option.charAt(0)}
                </div>
                <span className={`flex-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    )}

    {/* Short Answer */}
    {question.questionType === 'SHORT_ANSWER' && (
      <div className="mt-4">
        <textarea
          value={currentAnswer || ''}
          onChange={(e) => handleAnswerSelect(e.target.value)}
          placeholder="Type your answer here..."
          className={`
            w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
            ${darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
              : 'border-gray-300 text-gray-800 placeholder-gray-500'
            }
          `}
          rows={4}
        />
      </div>
    )}

    {/* Fill in the Blank */}
    {question.questionType === 'FILL_IN_THE_BLANK' && (
      <div className="mt-4">
        <input
          type="text"
          value={currentAnswer || ''}
          onChange={(e) => handleAnswerSelect(e.target.value)}
          placeholder="Enter your answer..."
          className={`
            w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
              : 'border-gray-300 text-gray-800 placeholder-gray-500'
            }
          `}
        />
      </div>
    )}
  </div>
);



};

PersonalizedQuizQuestion.propTypes ={
  question:PropTypes.shape({
    id:PropTypes.number,
    questionText:PropTypes.string,
    questionType:PropTypes.oneOf([
      'MULTIPLE_CHOICE',
      'TRUE_FALSE', 
      'SHORT_ANSWER', 
      'FILL_IN_THE_BLANK',
      'IMAGE_UPLOAD'
    ]),
    options:PropTypes.arrayOf(PropTypes.string),
    points:PropTypes.number,
    imageUrl:PropTypes.string
  }),
  currentAnswer:PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onAnswerChange:PropTypes.func.isRequired,
  questionNumber:PropTypes.number.isRequired
}
// Calculator Modal Component (unchanged)
const CalculatorModal = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const calculate = useCallback((firstOperand, secondOperand, operation) => {
    switch (operation) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '*': return firstOperand * secondOperand;
      case '/': return firstOperand / secondOperand;
      case '=': return secondOperand;
      default: return secondOperand;
    }
  }, []);

  const handleNumber = useCallback((num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  }, [display, waitingForOperand]);

  const handleOperation = useCallback((nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, calculate]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Calculator</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="bg-gray-100 p-3 rounded mb-4 text-right text-xl font-mono">
          {display}
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleClear} className="col-span-2 bg-red-500 text-white p-3 rounded hover:bg-red-600">Clear</button>
          <button onClick={() => handleOperation('/')} className="bg-gray-300 p-3 rounded hover:bg-gray-400">÷</button>
          <button onClick={() => handleOperation('*')} className="bg-gray-300 p-3 rounded hover:bg-gray-400">×</button>
          
          {[7, 8, 9].map(num => (
            <button key={num} onClick={() => handleNumber(num)} className="bg-gray-200 p-3 rounded hover:bg-gray-300">{num}</button>
          ))}
          <button onClick={() => handleOperation('-')} className="bg-gray-300 p-3 rounded hover:bg-gray-400">-</button>
          
          {[4, 5, 6].map(num => (
            <button key={num} onClick={() => handleNumber(num)} className="bg-gray-200 p-3 rounded hover:bg-gray-300">{num}</button>
          ))}
          <button onClick={() => handleOperation('+')} className="bg-gray-300 p-3 rounded hover:bg-gray-400">+</button>
          
          {[1, 2, 3].map(num => (
            <button key={num} onClick={() => handleNumber(num)} className="bg-gray-200 p-3 rounded hover:bg-gray-300">{num}</button>
          ))}
          <button onClick={() => handleOperation('=')} className="row-span-2 bg-blue-500 text-white rounded hover:bg-blue-600">=</button>
          
          <button onClick={() => handleNumber(0)} className="col-span-2 bg-gray-200 p-3 rounded hover:bg-gray-300">0</button>
          <button onClick={() => handleNumber('.')} className="bg-gray-200 p-3 rounded hover:bg-gray-300">.</button>
        </div>
      </div>
    </div>
  );
};

CalculatorModal.propTypes={
  isOpen:PropTypes.bool.isRequired,
  onClose:PropTypes.func.isRequired
}

// Main Personalized Exam Component - COMPLETELY DYNAMIC
const PersonalizedExamInterface = () => {
  const { examId } = useParams();
  console.log(examId)
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux and location state
  const { student, examQuestions, examAnswers} = useSelector(state => state.studentAuth);
  const { sessionId, examData: locationExamData } = location.state || {};



  // Component state
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

   const [examSessionData, setExamSessionData] = useState(null);
const [sessionError, setSessionError] = useState(null);
const { 
  handleStartExamSession,
  handleSaveAnswer,
  handleSaveAnswerBatch,
  handleSubmitExam,
  //handleSendHeartbeat,
  isStartingSession: sessionLoading,
  //isSubmitting
} = useStudentExam();

useEffect(() => {
  const startSession = async () => {
    if (sessionId) {
      try {
        const data = await handleStartExamSession(sessionId);
        setExamSessionData(data);
      } catch (error) {
        setSessionError(error);
      }
    }
  };
  startSession();
}, [sessionId, handleStartExamSession]);

 const { darkMode } = useTheme();

    // Add at the top of your component
console.log('🔍 Component Debug:', {
  sessionId,
  locationState: location.state,
  examQuestions: examQuestions?.length,
  examAnswers: Object.keys(examAnswers || {}).length,
  examSessionData: !!examSessionData,
  sessionError,
  isLoading,
  sessionLoading
});
  // Initialize exam data when component mounts or data loads
  useEffect(() => {
    if (!sessionId) {
      toast.error('No session ID found. Redirecting...');
      navigate('/student_exam_login');
      return;
    }

    if (examSessionData) {
      dispatch(setExamQuestions(examSessionData.questions || []));
      dispatch(setExamSession(examSessionData.examSession));
      
      // Set initial time remaining from session
      if (examSessionData.examSession?.timeRemaining) {
        setTimeRemaining(examSessionData.examSession.timeRemaining);
      }
      
      setIsLoading(false);
    }
  }, [examSessionData, sessionId, dispatch, navigate]);

  // Handle session errors
  useEffect(() => {
    if (sessionError) {
      toast.error('Failed to load exam session');
      console.error('Session error:', sessionError);
      navigate('/student_exam_login');
    }
  }, [sessionError, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted && !isLoading) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isLoading) {
      handleAutoSubmit();
    }
  }, [timeRemaining, isSubmitted, isLoading]);


 useEffect(() => {
  if (sessionId && examAnswers && Object.keys(examAnswers).length > 0) {
    const autoSaveInterval = setInterval(async () => {
      const answersArray = Object.entries(examAnswers).map(([questionNumber, answer]) => ({
        questionId: examQuestions[parseInt(questionNumber) - 1]?.id,
        answer
      })).filter(item => item.questionId);

      if (answersArray.length > 0) {
        try {
          await handleSaveAnswerBatch(sessionId, answersArray);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }
}, [sessionId, examAnswers, examQuestions, handleSaveAnswerBatch]);



  // Dynamic exam data
  const examData = useMemo(() => {
    if (examSessionData?.exam) {
      return {
        ...examSessionData.exam,
        currentQuestion,
        totalQuestions: examQuestions?.length || 0
      };
    }
    return locationExamData ? {
      ...locationExamData,
      currentQuestion,
      totalQuestions: examQuestions?.length || 0
    } : null;
  }, [examSessionData, locationExamData, currentQuestion, examQuestions]);



 const handleAnswerChange = useCallback(async (questionNumber, answer) => {
  dispatch(updateAnswer({ questionNumber, answer }));
  
  // Save individual answer to backend
  const question = examQuestions[questionNumber - 1];
  if (question && sessionId) {
    try {
      await handleSaveAnswer(sessionId, question.id, answer);
    } catch (err) {
      console.error('Failed to save answer:', err);
      toast.error('Failed to save answer. Please try again.');
    }
  }
}, [dispatch, examQuestions, sessionId, handleSaveAnswer]);


  const handleQuestionSelect = useCallback((questionNumber) => {
    if (questionNumber >= 1 && questionNumber <= examQuestions.length) {
      setCurrentQuestion(questionNumber);
    }
  }, [examQuestions.length]);


const handleSubmit = useCallback(async () => {
  if (!window.confirm('Are you sure you want to submit your exam? This action cannot be undone.')) {
    return;
  }

  try {
    await handleSubmitExam(sessionId);
    setIsSubmitted(true);
    dispatch(clearExamData());
    toast.success('Exam submitted successfully!');
  } catch (error) {
    console.error('Submit error:', error);
    toast.error(error.data?.message || 'Failed to submit exam. Please try again.');
  }
}, [sessionId, handleSubmitExam, dispatch]);


 const handleAutoSubmit = useCallback(async () => {
  try {
    await handleSubmitExam(sessionId);
    setIsSubmitted(true);
    dispatch(clearExamData());
    toast.info('Exam auto-submitted due to time expiry');
  } catch (error) {
    console.error('Auto-submit error:', error);
    toast.error(error.data?.message || 'Failed to auto-submit exam');
  }
}, [sessionId, handleSubmitExam, dispatch]);


  const handleNextQuestion = useCallback(() => {
    if (currentQuestion < examQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, examQuestions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  // Loading state
  if (isLoading || sessionLoading || !examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Exam...</h2>
          <p className="text-gray-600">Please wait while we prepare your exam</p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Exam Load Error</h2>
          <p className="text-gray-600 mb-6">
            Unable to load your exam. Please check your connection and try again.
          </p>
          <button 
            onClick={() => navigate('/student_exam_login')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Submission success state
  /*
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your answers have been recorded. You will receive your results soon.
          </p>
          <button 
            onClick={() => navigate('/student_exam_login')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
    */
   if (isSubmitted) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Exam Submitted Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your answers have been recorded. You will receive your results soon.
        </p>
        <button 
          onClick={() => navigate('/student_exam_login')}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

  // Main exam interface
  /*
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      
        <PersonalizedExamHeader 
          student={student}
          exam={examData}
          timeRemaining={timeRemaining}
          onSubmit={handleSubmit}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         
        

          <div className="col-span-1 lg:col-span-3 space-y-6">
            <PersonalizedQuizQuestion
              question={examQuestions[currentQuestion - 1]}
              currentAnswer={examAnswers[currentQuestion]}
              onAnswerChange={handleAnswerChange}
              questionNumber={currentQuestion}
            />
            
          
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 1}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestion === examQuestions.length}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

        
          <div className="col-span-1 space-y-6">
            <PersonalizedQuestionNavigation
              questions={examQuestions}
              currentQuestion={currentQuestion}
              onQuestionSelect={handleQuestionSelect}
              answers={examAnswers}
            />

            <button
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              onClick={handleSubmit}
            >
              <Send className="w-4 h-4" />
              Submit Exam
            </button>

            <button
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              onClick={() => setIsCalculatorOpen(true)}
            >
              <Calculator className="w-4 h-4" />
              Calculator
            </button>

         
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Exam Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-medium">
                    {Object.keys(examAnswers || {}).filter(key => examAnswers[key] !== '' && examAnswers[key] !== undefined).length}/{examQuestions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Used:</span>
                  <span className="font-medium">
                    {Math.floor(((examData?.duration * 60 || 0) - timeRemaining) / 60)}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completion:</span>
                  <span className="font-medium">
                    {examQuestions.length ? Math.round((Object.keys(examAnswers || {}).filter(key => examAnswers[key] !== '' && examAnswers[key] !== undefined).length / examQuestions.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </div>
  );
  */



return (
  <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4 sm:px-6 lg:px-8`}>
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <PersonalizedExamHeader 
        student={student}
        exam={examData}
        timeRemaining={timeRemaining}
        onSubmit={handleSubmit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content: Quiz Questions */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <PersonalizedQuizQuestion
            question={examQuestions[currentQuestion - 1]}
            currentAnswer={examAnswers[currentQuestion]}
            onAnswerChange={handleAnswerChange}
            questionNumber={currentQuestion}
          />
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 1}
              className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestion === examQuestions.length}
              className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          <PersonalizedQuestionNavigation
            questions={examQuestions}
            currentQuestion={currentQuestion}
            onQuestionSelect={handleQuestionSelect}
            answers={examAnswers}
          />

          <button
            className={`w-full text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              darkMode
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={handleSubmit}
          >
            <Send className="w-4 h-4" />
            Submit Exam
          </button>

          <button
            className={`w-full text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              darkMode
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
            onClick={() => setIsCalculatorOpen(true)}
          >
            <Calculator className="w-4 h-4" />
            Calculator
          </button>

          {/* Exam Stats */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Exam Statistics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Questions Answered:
                </span>
                <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {Object.keys(examAnswers || {}).filter(key => examAnswers[key] !== '' && examAnswers[key] !== undefined).length}/{examQuestions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Time Used:
                </span>
                <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {Math.floor(((examData?.duration * 60 || 0) - timeRemaining) / 60)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Completion:
                </span>
                <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {examQuestions.length ? Math.round((Object.keys(examAnswers || {}).filter(key => examAnswers[key] !== '' && examAnswers[key] !== undefined).length / examQuestions.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Calculator Modal */}
    <CalculatorModal 
      isOpen={isCalculatorOpen} 
      onClose={() => setIsCalculatorOpen(false)} 
    />
  </div>
);

};

export default PersonalizedExamInterface;