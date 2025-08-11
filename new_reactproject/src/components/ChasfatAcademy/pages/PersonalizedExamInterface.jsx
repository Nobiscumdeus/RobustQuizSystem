import { useState, useEffect, useCallback, useMemo } from "react";
import { Calculator, Send, User, BookOpen, CheckCircle2 } from "lucide-react";
import PropTypes from "prop-types";



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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Student & Exam Info */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{exam.title}</h1>
            <p className="text-gray-600">{student.firstName} {student.lastName} • {student.matricNo}</p>
            <p className="text-sm text-gray-500">{exam.course?.title}</p>
          </div>
        </div>

        {/* Timer & Actions */}
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

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{exam.currentQuestion || 1} of <strong>{exam.totalQuestions}</strong></span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((exam.currentQuestion || 1) / exam.totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Add prop validation
PersonalizedExamHeader.propTypes = {
  student: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    matricNo: PropTypes.string.isRequired
  }).isRequired,
  exam: PropTypes.shape({
    title: PropTypes.string.isRequired,
    course: PropTypes.shape({
      title: PropTypes.string
    }),
    currentQuestion: PropTypes.number,
    totalQuestions: PropTypes.number.isRequired
  }).isRequired,
  timeRemaining: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired
};

// Question Navigation Component
const PersonalizedQuestionNavigation = ({ questions, currentQuestion, onQuestionSelect, answers }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Question Navigation
      </h3>
      
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, index) => {
          const questionNumber = index + 1;
          const isAnswered = answers[questionNumber] !== undefined;
          const isCurrent = currentQuestion === questionNumber;
          
          return (
            <button
              key={questionNumber}
              onClick={() => onQuestionSelect(questionNumber)}
              className={`
                w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                ${isCurrent 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                  : isAnswered 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
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
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-gray-600">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-600">Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Current</span>
        </div>
      </div>
    </div>
  );
};

PersonalizedQuestionNavigation.propTypes = {
  questions: PropTypes.array.isRequired,
  currentQuestion: PropTypes.number.isRequired,
  onQuestionSelect: PropTypes.func.isRequired,
  answers: PropTypes.object.isRequired
};

// Enhanced Question Component
const PersonalizedQuizQuestion = ({ question, currentAnswer, onAnswerChange, questionNumber }) => {
  if (!question) return null;

  const handleAnswerSelect = (answer) => {
    onAnswerChange(questionNumber, answer);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            Question {questionNumber}
          </span>
          <span className="text-sm text-gray-500">({question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''})</span>
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

      {question.questionType === 'SHORT_ANSWER' && (
        <div className="mt-4">
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerSelect(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            
          />
        </div>
      )}
    </div>
  );
};

PersonalizedQuizQuestion.propTypes = {
  question: PropTypes.shape({
    questionText: PropTypes.string.isRequired,
    questionType: PropTypes.string.isRequired,
    options: PropTypes.array,
    points: PropTypes.number,
    imageUrl: PropTypes.string
  }),
  currentAnswer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAnswerChange: PropTypes.func.isRequired,
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

CalculatorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

// Main Personalized Exam Component
const PersonalizedExamInterface = ({ 
    
  student = { firstName: "John", lastName: "Doe", matricNo: "2024/CS/001" },
  examData = {
    id: 1,
    title: "Data Structures Final Exam",
    course: { title: "CSC 301 - Data Structures" },
    duration: 5,
    totalQuestions: 10
  },
  

}) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(examData.duration * 60); // Convert minutes to seconds
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

    //For Questions Interface 

  // Mock questions - in real app, fetch from API
  
  const mockQuestions = useMemo(() => [
    {
      id: 1,
      questionText: "What is the time complexity of binary search?",
      questionType: "MULTIPLE_CHOICE",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      points: 2
    },
    {
      id: 2,
      questionText: "Which data structure uses LIFO principle?",
      questionType: "MULTIPLE_CHOICE",
      options: ["Queue", "Stack", "Array", "Linked List"],
      points: 1
    },
    {
      id: 3,
      questionText: "Explain the difference between arrays and linked lists.",
      questionType: "SHORT_ANSWER",
      points: 5
    }
    // Add more questions as needed
  ], []);
  



  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted]);

  const handleAnswerChange = useCallback((questionNumber, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  }, []);

  const handleQuestionSelect = useCallback((questionNumber) => {
    setCurrentQuestion(questionNumber);
  }, []);

  const handleSubmit = useCallback(() => {
    if (window.confirm('Are you sure you want to submit your exam? This action cannot be undone.')) {
      setIsSubmitted(true);
      // ..................................Answers would be sent back to the backend here ...................


      console.log('Submitting answers:', answers);
    }
  }, [answers]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion < mockQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, mockQuestions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

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
            onClick={() => window.location.href = '/student/dashboard'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PersonalizedExamHeader 
          student={student}
          exam={{...examData, currentQuestion, totalQuestions: mockQuestions.length}}
          timeRemaining={timeRemaining}
          onSubmit={handleSubmit}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content: Quiz Questions */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            <PersonalizedQuizQuestion
              question={mockQuestions[currentQuestion - 1]}
              currentAnswer={answers[currentQuestion]}
              onAnswerChange={handleAnswerChange}
              questionNumber={currentQuestion}
            />
            
            {/* Navigation Buttons */}
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
                disabled={currentQuestion === mockQuestions.length}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            <PersonalizedQuestionNavigation
              questions={mockQuestions}
              currentQuestion={currentQuestion}
              onQuestionSelect={handleQuestionSelect}
              answers={answers}
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

            {/* Exam Stats */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Exam Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-medium">{Object.keys(answers).length}/{mockQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Used:</span>
                  <span className="font-medium">{Math.floor((examData.duration * 60 - timeRemaining) / 60)}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion:</span>
                  <span className="font-medium">{Math.round((Object.keys(answers).length / mockQuestions.length) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </div>
  );
};

PersonalizedExamInterface.propTypes = {
  student: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    matricNo: PropTypes.string.isRequired
  }),
  examData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    course: PropTypes.shape({
      title: PropTypes.string
    }),
    duration: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired
  }),
  //.......................We would make this examSession more robust later on 
  examSession:PropTypes.shape({
    id:PropTypes.number,
  })
};

export default PersonalizedExamInterface;