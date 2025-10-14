/*
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Calculator, Send, User, BookOpen, CheckCircle2, AlertTriangle, Wifi, WifiOff, Save, Clock } from "lucide-react";
import PropTypes from "prop-types";

import {
  fetchExamSession,
  setLocalAnswer,
  autoSaveAnswer,
  submitExam,
  autoSubmitExam,
  goToQuestion,
  nextQuestion,
  previousQuestion,
  toggleFlagQuestion,
  tickTimer,
  //updateTimer,
  logViolation,
  resetExam
} from '../src/features/ChasfatAcademy/exam/examinationSlice';

// Enhanced Exam Header Component
const DynamicExamHeader = ({ student, exam, timeRemaining, onSubmit, autoSaveStatus, connectionStatus }) => {
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const timeColor = useMemo(() => {
    if (timeRemaining <= 300) return 'text-red-600 animate-pulse'; // Last 5 minutes
    if (timeRemaining <= 900) return 'text-orange-600'; // Last 15 minutes
    return 'text-green-600';
  }, [timeRemaining]);

  */
 {/*}
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-4 z-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Student & Exam Info 
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{exam?.title}</h1>
            <p className="text-gray-600">{student?.firstName} {student?.lastName} • {student?.matricNo}</p>
            <p className="text-sm text-gray-500">{exam?.course?.courseTitle}</p>
          </div>
        </div>

        {/* Status Indicators & Timer 
        <div className="flex items-center gap-4">
          {/* Connection Status 
          <div className="flex items-center gap-2">
            {connectionStatus === 'online' ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
          </div>

          {/* Auto-save Status 
          <div className="flex items-center gap-2">
            <Save className={`w-4 h-4 ${autoSaveStatus === 'saving' ? 'animate-spin text-blue-600' : 
              autoSaveStatus === 'success' ? 'text-green-600' : 
              autoSaveStatus === 'error' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="text-xs text-gray-500">
              {autoSaveStatus === 'saving' ? 'Saving...' : 
               autoSaveStatus === 'success' ? 'Saved' : 
               autoSaveStatus === 'error' ? 'Error' : 'Auto-save'}
            </span>
          </div>

          {/* Timer 
          <div className="text-center">
            <div className={`text-2xl font-mono font-bold ${timeColor} flex items-center gap-2`}>
              <Clock className="w-5 h-5" />
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

      {/* Progress Bar
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{exam?.currentQuestionIndex + 1 || 1} of <strong>{exam?.totalQuestions}</strong></span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((exam?.currentQuestionIndex + 1 || 1) / (exam?.totalQuestions || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Warning for low time 
      {timeRemaining <= 600 && timeRemaining > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <span className="text-orange-800 text-sm font-medium">
            {timeRemaining <= 300 ? 'URGENT: Only 5 minutes remaining!' : 'Warning: 10 minutes remaining!'}
          </span>
        </div>
      )}
    </div>
  );
};

DynamicExamHeader.propTypes = {
  student: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    matricNo: PropTypes.string.isRequired
  }).isRequired,
  exam: PropTypes.shape({
    title: PropTypes.string.isRequired,
    course: PropTypes.shape({
      courseTitle: PropTypes.string.isRequired
    }),
    currentQuestionIndex: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired
  }).isRequired,
  timeRemaining: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  autoSaveStatus: PropTypes.oneOf(['saving', 'success', 'error', 'idle']).isRequired,
  connectionStatus: PropTypes.oneOf(['online', 'offline']).isRequired
};

// Dynamic Question Navigation Component
const DynamicQuestionNavigation = ({ questions, currentQuestionIndex, onQuestionSelect, answers, flaggedQuestions, visitedQuestions }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Question Navigation
      </h3>
      
      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((question, index) => {
          const questionNumber = index + 1;
          const isAnswered = answers[question.id] !== undefined && answers[question.id] !== '';
          const isCurrent = currentQuestionIndex === index;
          const isFlagged = flaggedQuestions.has(index);
          const isVisited = visitedQuestions.has(index);
          
          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`
                relative w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                ${isCurrent 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                  : isAnswered 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : isVisited
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {questionNumber}
              {isFlagged && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-gray-600">Answered ({Object.keys(answers).length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span className="text-gray-600">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-600">Not Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Flagged ({flaggedQuestions.size})</span>
        </div>
      </div>
    </div>
  );
};

DynamicQuestionNavigation.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  ).isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  onQuestionSelect: PropTypes.func.isRequired,
  answers: PropTypes.object.isRequired,
  flaggedQuestions: PropTypes.instanceOf(Set).isRequired,
  visitedQuestions: PropTypes.instanceOf(Set).isRequired
};


// Enhanced Dynamic Question Component
const DynamicQuizQuestion = ({ question, currentAnswer, onAnswerChange, onFlagToggle, isFlagged, questionNumber }) => {
  if (!question) return null;

  const handleAnswerSelect = (answer) => {
    onAnswerChange(question.id, answer);
  };

  const renderQuestionByType = () => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = currentAnswer === option;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300 text-gray-600'
                      }
                    `}>
                      {optionLetter}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => {
              const isSelected = currentAnswer === option;
              
              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300 text-gray-600'
                      }
                    `}>
                      {option === 'True' ? 'T' : 'F'}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'SHORT_ANSWER':
      case 'ESSAY':
        return (
          <div className="mt-4">
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              rows={question.type === 'ESSAY' ? 8 : 4}
            />
            <div className="mt-2 text-sm text-gray-500">
              Characters: {(currentAnswer || '').length}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Question type &quot;{question.type}&quot; not supported yet.
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              Question {questionNumber}
            </span>
            <span className="text-sm text-gray-500">({question.marks || 1} mark{(question.marks || 1) !== 1 ? 's' : ''})</span>
          </div>
          
          <button
            onClick={() => onFlagToggle(questionNumber - 1)}
            className={`
              flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors
              ${isFlagged 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <div className={`w-3 h-3 rounded-full ${isFlagged ? 'bg-red-500' : 'bg-gray-400'}`}></div>
            {isFlagged ? 'Flagged' : 'Flag'}
          </button>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {question.questionText}
        </h2>
        
        {question.imageUrl && (
          <div className="mb-6">
            <img 
              src={question.imageUrl} 
              alt="Question illustration" 
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}
      </div>

      {renderQuestionByType()}
    </div>
  );
};

DynamicQuizQuestion.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']).isRequired,
    questionText: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    marks: PropTypes.number,
    imageUrl: PropTypes.string
  }).isRequired,
  currentAnswer: PropTypes.string,
  onAnswerChange: PropTypes.func.isRequired,
  onFlagToggle: PropTypes.func.isRequired,
  isFlagged: PropTypes.bool.isRequired,
  questionNumber: PropTypes.number.isRequired
};

// Calculator Modal Component
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
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
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

CalculatorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};


// Main Dynamic Exam Interface Component
const DynamicExamInterface = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  // Redux state
  const {
    currentExam,
    examSession,
    student,
    questions,
    answers,
    currentQuestionIndex,
    timeRemaining,
    flaggedQuestions,
    visitedQuestions,
    isLoading,
    isSubmitted,
    isSubmitting,
    autoSaveStatus,
    connectionStatus,
    proctoringEnabled,
    calculatorAllowed,
    error
  } = useSelector((state) => state.exam);

  // Get session info from navigation state
  const { sessionId, resuming } = location.state || {};
  //==================================================== will be removed ============================
  console.log(sessionId)
  console.log(resuming)

  // Load exam session on mount
  useEffect(() => {
    if (examId && student?.id && !currentExam) {
      dispatch(fetchExamSession({ 
        examId: parseInt(examId), 
        studentId: student.id 
      }));
    }
  }, [dispatch, examId, student?.id, currentExam]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        dispatch(tickTimer());
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleAutoSubmit('TIME_UP');
    }
  }, [timeRemaining, isSubmitted, dispatch]);

  // Auto-save answers with debouncing
  useEffect(() => {
    if (examSession?.id && currentQuestionIndex !== undefined && questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const currentAnswer = answers[currentQuestion?.id];
      
      if (currentAnswer !== undefined && currentAnswer !== '') {
        const timeoutId = setTimeout(() => {
          dispatch(autoSaveAnswer({
            sessionId: examSession.id,
            questionId: currentQuestion.id,
            answer: currentAnswer
          }));
        }, 2000); // 2 second delay for debouncing

        return () => clearTimeout(timeoutId);
      }
    }
  }, [answers, currentQuestionIndex, questions, examSession?.id, dispatch]);

  // Handle browser events and violations
  useEffect(() => {
    if (!proctoringEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch(logViolation({
          sessionId: examSession?.id,
          violationType: 'TAB_SWITCH',
          details: { timestamp: new Date().toISOString() }
        }));
      }
    };

    const handleBlur = () => {
      dispatch(logViolation({
        sessionId: examSession?.id,
        violationType: 'WINDOW_BLUR',
        details: { timestamp: new Date().toISOString() }
      }));
    };

    const handleKeyDown = (e) => {
      // Prevent common shortcuts
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 's', 'p', 'r'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        dispatch(logViolation({
          sessionId: examSession?.id,
          violationType: 'PROHIBITED_KEY',
          details: { key: e.key, timestamp: new Date().toISOString() }
        }));
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      dispatch(logViolation({
        sessionId: examSession?.id,
        violationType: 'RIGHT_CLICK',
        details: { timestamp: new Date().toISOString() }
      }));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [proctoringEnabled, examSession?.id, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Save current state before leaving
      if (examSession?.id && !isSubmitted) {
        dispatch(autoSaveAnswer({
          sessionId: examSession.id,
          questionId: questions[currentQuestionIndex]?.id,
          answer: answers[questions[currentQuestionIndex]?.id]
        }));
      }
    };
  }, []);

  const handleAnswerChange = useCallback((questionId, answer) => {
    dispatch(setLocalAnswer({ questionId, answer }));
  }, [dispatch]);

  const handleQuestionSelect = useCallback((questionIndex) => {
    dispatch(goToQuestion(questionIndex));
  }, [dispatch]);

  const handleNextQuestion = useCallback(() => {
    dispatch(nextQuestion());
  }, [dispatch]);

  const handlePreviousQuestion = useCallback(() => {
    dispatch(previousQuestion());
  }, [dispatch]);

  const handleFlagToggle = useCallback((questionIndex) => {
    dispatch(toggleFlagQuestion(questionIndex));
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    setShowSubmitConfirmation(true);
  }, []);

  const confirmSubmit = useCallback(async () => {
    if (examSession?.id) {
      try {
        await dispatch(submitExam({
          sessionId: examSession.id,
          answers,
          violations: [] // violations are tracked in the store
        })).unwrap();
      } catch (error) {
        console.error('Submit failed:', error);
      }
    }
    setShowSubmitConfirmation(false);
  }, [dispatch, examSession?.id, answers]);

  const handleAutoSubmit = useCallback((reason = 'TIME_UP') => {
    if (examSession?.id) {
      dispatch(autoSubmitExam({
        sessionId: examSession.id,
        answers,
        reason
      }));
    }
  }, [dispatch, examSession?.id, answers]);

  // Loading state
  if (isLoading || !currentExam || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Exam...</h2>
          <p className="text-gray-600">Please wait while we prepare your exam.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your answers have been recorded. You will receive your results soon.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            <p>Questions Answered: {Object.keys(answers).length} of {questions.length}</p>
            <p>Submission Time: {new Date().toLocaleString()}</p>
          </div>
          <button 
            onClick={() => {
              dispatch(resetExam());
              navigate('/student/dashboard');
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header 
        <DynamicExamHeader 
          student={student}
          exam={{...currentExam, currentQuestionIndex, totalQuestions: questions.length}}
          timeRemaining={timeRemaining}
          onSubmit={handleSubmit}
          autoSaveStatus={autoSaveStatus}
          connectionStatus={connectionStatus}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content: Quiz Questions 
          <div className="col-span-1 lg:col-span-3 space-y-6">
            <DynamicQuizQuestion
              question={currentQuestion}
              currentAnswer={answers[currentQuestion?.id]}
              onAnswerChange={handleAnswerChange}
              onFlagToggle={handleFlagToggle}
              isFlagged={flaggedQuestions.has(currentQuestionIndex)}
              questionNumber={currentQuestionIndex + 1}
            />
            
            {/* Navigation Buttons
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleFlagToggle.bind(null, currentQuestionIndex)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    flaggedQuestions.has(currentQuestionIndex)
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {flaggedQuestions.has(currentQuestionIndex) ? 'Unflag' : 'Flag'} Question
                </button>
                
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar 
          <div className="col-span-1 space-y-6">
            <DynamicQuestionNavigation
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              visitedQuestions={visitedQuestions}
            />

            <button
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Exam
                </>
              )}
            </button>

            {calculatorAllowed && (
              <button
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                onClick={() => setIsCalculatorOpen(true)}
              >
                <Calculator className="w-4 h-4" />
                Calculator
              </button>
            )}

            {/* Exam Stats 
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Exam Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-medium">{Object.keys(answers).length}/{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions Flagged:</span>
                  <span className="font-medium">{flaggedQuestions.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Used:</span>
                  <span className="font-medium">
                    {Math.floor((currentExam.duration * 60 - timeRemaining) / 60)}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completion:</span>
                  <span className="font-medium">
                    {Math.round((Object.keys(answers).length / questions.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Status 
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Connection:</span>
                  <div className={`flex items-center gap-2 ${
                    connectionStatus === 'online' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {connectionStatus === 'online' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    <span className="font-medium capitalize">{connectionStatus}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Auto-save:</span>
                  <div className={`flex items-center gap-2 ${
                    autoSaveStatus === 'success' ? 'text-green-600' :
                    autoSaveStatus === 'error' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    <Save className="w-4 h-4" />
                    <span className="font-medium capitalize">{autoSaveStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal 
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />

      {/* Submit Confirmation Modal 
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Exam</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? This action cannot be undone.
            </p>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Questions Answered:</span>
                  <p className="font-medium">{Object.keys(answers).length} of {questions.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Time Remaining:</span>
                  <p className="font-medium">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Flagged Questions:</span>
                  <p className="font-medium">{flaggedQuestions.size}</p>
                </div>
                <div>
                  <span className="text-gray-500">Unanswered:</span>
                  <p className="font-medium text-orange-600">{questions.length - Object.keys(answers).length}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirmation(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Exam'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen warning for proctored exams 
      {proctoringEnabled && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Proctored Exam</span>
          </div>
          <p>Tab switching, right-clicking, and certain keyboard shortcuts are monitored and logged.</p>
        </div>
      )}
    </div>
  );
};

export default DynamicExamInterface;

*/}