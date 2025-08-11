import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Clock, AlertCircle, CheckCircle, XCircle, BookOpen, LogOut, User, Lock, School } from 'lucide-react';
import { 
  studentLogin, 
 // fetchExamSession,
 startExamSession,
  selectCurrentExam,
  selectExamSession,
  selectStudent,
  selectIsAuthenticated,
  selectError,
  selectIsLoading,
  clearError,
  resetExam
} from '../../../features/ChasfatAcademy/exam/examinationSlice';

const StudentExamLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Select data from Redux store
  const currentExam = useSelector(selectCurrentExam);
  const examSession = useSelector(selectExamSession);
  const student = useSelector(selectStudent);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectError);
  const isLoading = useSelector(selectIsLoading);
  
  // Local component state
  const [matricNo, setMatricNo] = useState('');
  const [examPassword, setExamPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startingExam, setStartingExam] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

    // Check if exam session is active
    console.log(loginAttempted);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect to exam interface when session starts
  useEffect(() => {
    if (examSession?.id && currentExam?.id && isAuthenticated) {
      navigate(`/student/exam/${currentExam.id}`, { 
        state: { 
          sessionId: examSession.id,
          examData: currentExam,
          student,
          examinerInfo: currentExam.examiner
        } 
      });
    }
  }, [examSession, currentExam, isAuthenticated, navigate, student]);

  const handleLogin = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    
    setLoginAttempted(true);
    
    // Input validation
    if (!matricNo.trim()) {
      dispatch(clearError());
      dispatch(studentLogin.rejected({ 
        payload: 'Please enter your matriculation number' 
      }));
      return;
    }
    
    if (!examPassword.trim()) { 
      dispatch(clearError());
      dispatch(studentLogin.rejected({ 
        payload: 'Please enter the exam access password' 
      }));
      return;
    }

    try {
      // This will authenticate the student and load the exam data
      await dispatch(studentLogin({ matricNo: matricNo.trim(), password: examPassword.trim() }))
        .unwrap();
      
      // If successful, clear form
      setMatricNo('');
      setExamPassword('');
      setLoginAttempted(false);
    } catch (err) {
      console.error('Authentication error:', err);
      setLoginAttempted(false);
    }
  }, [matricNo, examPassword, dispatch]);

  const startExam = useCallback(async () => {
    if (!currentExam || !student) return;

    // Validate exam timing
    const now = new Date();
    const startTime = new Date(currentExam.startTime);
    const endTime = new Date(currentExam.endTime);
    
    if (now < startTime) {
      alert('This exam has not started yet.');
      return;
    }
    
    if (now > endTime) {
      alert('This exam has ended.');
      return;
    }

    // Check if student already has a session for this exam
    if (examSession?.isActive) {
      const continueMessage = `You have an existing session for this exam.\n\nWould you like to continue where you left off?`;
      if (window.confirm(continueMessage)) {
        // Continue existing session
        navigate(`/student/exam/${currentExam.id}`, { 
          state: { 
            sessionId: examSession.id,
            examData: currentExam,
            student,
            examinerInfo: currentExam.examiner,
            resuming: true
          } 
        });
        return;
      }
    }

    const confirmMessage = `You are about to start:\n\n"${currentExam.title}"\n\nExaminer: ${currentExam.examiner?.firstName} ${currentExam.examiner?.lastName}\nCourse: ${currentExam.course?.title} (${currentExam.course?.code})\nDuration: ${currentExam.duration} minutes\nQuestions: ${currentExam.totalQuestions || 'Multiple'}\n\nIMPORTANT INSTRUCTIONS:\n• Once started, the timer cannot be paused\n• Ensure stable internet connection\n• Close all unnecessary applications\n• Do not refresh or close the browser\n• Auto-submit will occur when time expires\n\nAre you ready to begin?`;
    
    if (!window.confirm(confirmMessage)) return;

    setStartingExam(true);
    
    try {
      await dispatch(startExamSession({ 
        examId: currentExam.id, 
        studentId: student.id 
      })).unwrap();
    } catch (err) {
      console.error('Failed to start exam:', err);
      setStartingExam(false);
      alert('An error occurred while starting the exam. Please try again.');
    }
  }, [currentExam, student, examSession, dispatch, navigate]);

  const handleLogout = useCallback(() => {
    dispatch(resetExam());
    setMatricNo('');
    setExamPassword('');
    setLoginAttempted(false);
  }, [dispatch]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const getExamTimeInfo = useCallback(() => {
    if (!currentExam) return null;
    
    const now = new Date();
    const startTime = new Date(currentExam.startTime);
    const endTime = new Date(currentExam.endTime);
    
    if (now < startTime) {
      const timeUntilStart = Math.ceil((startTime - now) / (1000 * 60));
      const hours = Math.floor(timeUntilStart / 60);
      const minutes = timeUntilStart % 60;
      return {
        status: 'scheduled',
        message: `Exam starts in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      };
    }
    
    if (now > endTime) {
      return {
        status: 'ended',
        message: 'Exam has ended',
        color: 'text-red-600',
        bg: 'bg-red-50'
      };
    }
    
    const remainingTime = Math.floor((endTime - now) / (1000 * 60));
    const hours = Math.floor(remainingTime / 60);
    const minutes = remainingTime % 60;
    
    return {
      status: 'active',
      message: `${hours > 0 ? `${hours}h ` : ''}${minutes}m remaining`,
      color: 'text-green-600',
      bg: 'bg-green-50'
    };
  }, [currentExam]);

  // Login Screen
  if (!isAuthenticated || !currentExam?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <School className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Exam Access Portal</h1>
            <p className="text-indigo-200">Enter your credentials to access your assigned exam</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="matricNo" className="block text-sm font-semibold text-gray-700 mb-3">
                  Matriculation Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="matricNo"
                    type="text"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 font-medium"
                    placeholder="e.g., CS/2024/001"
                    disabled={isLoading}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="examPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                  Exam Access Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="examPassword"
                    type={showPassword ? "text" : "password"}
                    value={examPassword}
                    onChange={(e) => setExamPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 font-medium"
                    placeholder="Enter exam access code"
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  This code was provided by your examiner
                </p>
              </div>

              <button
                type="submit"
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Access Exam'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Secure exam environment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timeInfo = getExamTimeInfo();
  const canStartExam = timeInfo?.status === 'active' && 
                      (!examSession || 
                       !examSession.isActive) &&
                      (examSession?.attemptCount || 0) < (currentExam.maxAttempts || 1);

  // Exam Ready Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Examiner Imprint */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-indigo-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-6">
              <div className="bg-indigo-100 rounded-full p-4">
                <User className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome, {student?.firstName} {student?.lastName}
                </h1>
                <div className="space-y-1 text-gray-600">
                  <p className="font-medium">Matric No: {student?.matricNo}</p>
                  {student?.department && <p>Department: {student?.department}</p>}
                  {student?.level && <p>Level: {student?.level}</p>}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Examiner Information */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <School className="w-5 h-5" />
              Exam Administered By
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-indigo-800">Examiner:</p>
                <p className="text-indigo-700">
                  {currentExam.examiner?.firstName} {currentExam.examiner?.lastName}
                </p>
              </div>
              <div>
                <p className="font-medium text-indigo-800">Contact:</p>
                <p className="text-indigo-700">{currentExam.examiner?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className="font-semibold text-lg">
              Current Time: {currentTime.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Exam Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentExam.title}</h2>
            <p className="text-lg text-gray-600">
              {currentExam.course?.title} ({currentExam.course?.code})
            </p>
          </div>

          {/* Exam Status */}
          {timeInfo && (
            <div className={`rounded-xl p-6 mb-8 border-2 ${timeInfo.bg} border-opacity-50`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeInfo.color} mb-2`}>
                  {timeInfo.message}
                </div>
                <div className="text-gray-600">
                  Exam Period: {new Date(currentExam.startTime).toLocaleString()} - {new Date(currentExam.endTime).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Exam Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">{currentExam.duration}</div>
              <div className="text-blue-700 font-medium">Minutes</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">
                {currentExam.totalQuestions || '?'}
              </div>
              <div className="text-green-700 font-medium">Questions</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600">
                {examSession?.attemptCount || 0}/{currentExam.maxAttempts || 1}
              </div>
              <div className="text-purple-700 font-medium">Attempts</div>
            </div>
          </div>

          {/* Instructions */}
          {currentExam.instructions && (
            <div className="bg-amber-50 rounded-xl p-6 mb-8 border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-3">Special Instructions:</h3>
              <p className="text-amber-700">{currentExam.instructions}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            {canStartExam ? (
              <button
                onClick={startExam}
                disabled={startingExam}
                className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                  startingExam
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {startingExam ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Preparing Exam...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 inline mr-3" />
                    Start Exam Now
                  </>
                )}
              </button>
            ) : (
              <div className="text-center">
                <button
                  disabled
                  className="px-12 py-4 rounded-xl font-bold text-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  <XCircle className="w-6 h-6 inline mr-3" />
                  {timeInfo?.status === 'scheduled' ? 'Exam Not Started' : 
                   timeInfo?.status === 'ended' ? 'Exam Ended' : 'Unavailable'}
                </button>
                <p className="mt-4 text-gray-600">
                  {timeInfo?.status === 'scheduled' && 'Please wait for the scheduled start time.'}
                  {timeInfo?.status === 'ended' && 'This exam session has concluded.'}
                  {examSession?.isActive && 'You have already completed this exam.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamLogin;