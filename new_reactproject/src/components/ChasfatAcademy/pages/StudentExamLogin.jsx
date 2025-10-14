import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Clock, AlertCircle, CheckCircle,  LogOut, User, Lock, School, BookOpen, Timer, Users } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthData, logout } from '../../../features/ChasfatAcademy/auth/studentAuthSlice';
import { useStudentLoginMutation, useValidateExamAccessMutation } from '../../../api/examinationApi';
import { toast } from 'react-toastify';

const StudentExamLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Step 1: Student Authentication
  const [matricNo, setMatricNo] = useState('');
 
  // Step 2: Exam Selection & Password
  const [selectedExam, setSelectedExam] = useState(null);
  const [examPassword, setExamPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting,setIsSubmitting] =useState(false);
  
  
  // General state
  const [currentTime, setCurrentTime] = useState(new Date());


  // Redux state
  const { student, isAuthenticated, availableExams } = useSelector(state => state.studentAuth);

  // RTK Query hooks
  const [studentLogin, { isLoading: isLoggingIn, error: loginError }] = useStudentLoginMutation();
  const [validateExamAccess, { isLoading: isValidatingAccess }] = useValidateExamAccessMutation();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

const handleStudentLogin = useCallback(async (e) => {
  if (e?.preventDefault) e.preventDefault();
  
  if (!matricNo || matricNo.trim() === '') {
    toast.error('Please enter a valid matriculation number');
    return;
  }

  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    const result = await studentLogin({ matricNo: matricNo.trim() }).unwrap();
    
    console.log('✅ Frontend: Login success:', result);
    
    // ADD THESE LINES:
    console.log('Raw token from API:', result.token);
    localStorage.setItem('studentToken', result.token);
    console.log('Token stored in localStorage:', localStorage.getItem('studentToken'));
    console.log('Token length:', result.token?.length);
    
    dispatch(setAuthData(result));
    toast.success(`Welcome ${result.student.firstName}! Select your exam.`);
    
  } catch (err) {
     localStorage.removeItem('studentToken');
    console.error('❌ Frontend: Login error caught:', err);
    toast.error(err.data?.message || 'Login failed. Please check your matric number.');
  } finally {
    setIsSubmitting(false); // You're missing this - could cause button to stay disabled
  }
}, [matricNo, studentLogin, dispatch, isSubmitting]);




  //.................................................Use Effects for DEBUGGING .....................................
  // Debug: Monitor authentication state
useEffect(() => {
  console.log('Auth state changed:', { 
    isAuthenticated, 
    student: student?.firstName,
    token: localStorage.getItem('studentToken'),
    availableExamsCount: availableExams?.length 
  });
}, [isAuthenticated, student, availableExams]);

// Debug: Monitor API calls
useEffect(() => {
  if (loginError) {
    console.log('Login error:', loginError);
  }
}, [loginError]);


//...................................................................................................................


const handleExamAccess = useCallback(async (e) => {
  if (e?.preventDefault) e.preventDefault();

  // Check if we have a valid token
  const currentToken = localStorage.getItem('studentToken');
  if (!currentToken) {
    toast.error('Authentication expired. Please login again.');
    dispatch(logout());
    return;
  }

  if (!selectedExam) {
    toast.error('Please select an exam first');
    return;
  }


    // ✅ NEW: Check max attempts before even asking for password
  if (selectedExam.attemptsTaken >= selectedExam.maxAttempts) {
    toast.error(`Maximum attempts (${selectedExam.maxAttempts}) exceeded. You cannot take this exam again.`);
    return;
  }




  if (!examPassword || examPassword.trim() === '') {
    toast.error('Please enter the exam password');
    return;
  }

  try {
    const result = await validateExamAccess({
      examId: selectedExam.id,
      password: examPassword.trim()
    }).unwrap();

    console.log('Exam access granted:', result);
    toast.success('Exam access granted! Redirecting...');
    




   // Add a small delay to ensure session is fully created
    setTimeout(() => {
      navigate(`/student/exam/${selectedExam.id}`, {
        state: {
          sessionId: result.examSession.id,
          examData: selectedExam,
          student,
          sessionInfo: result.examSession
        }
      });
    }, 500); // 500ms delay


    console.log("Navigating to:", `/student/exam/${selectedExam.id}`); // Add this line

  } catch (err) {
    console.error('Exam access error details:', err);
    
    // Handle token expiration specifically
    if (err.status === 401 || err.data?.message?.includes('token')) {
      toast.error('Session expired. Please login again.');
      dispatch(logout());
    } else {
      toast.error(err.data?.message || 'Invalid exam password');
    }
  }
}, [selectedExam, examPassword, validateExamAccess, navigate, student, dispatch]);

/*
  const handleLogout = useCallback(() => {
    dispatch(logout());
    setMatricNo('');
    setSelectedExam(null);
    localStorage.removeItem('studentToken');
    setExamPassword('');
    setLoginAttempted(false);
    setPasswordAttempted(false);
    setExamSession(null);
  }, [dispatch]);
  */
const handleLogout = useCallback(() => {
  localStorage.removeItem('studentToken');
  dispatch(logout());
  setMatricNo('');
  setSelectedExam(null);
  setExamPassword('');
  
  // Force immediate redirect
  window.location.href = '/student_exam_login';
}, [dispatch]);


  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const getExamStatus = useCallback((exam) => {
    const now = new Date();
    const startTime = exam.startTime ? new Date(exam.startTime) : null;
    const endTime = exam.endTime ? new Date(exam.endTime) : null;

    if (startTime && now < startTime) {
      const timeUntilStart = Math.ceil((startTime - now) / (1000 * 60));
      return {
        status: 'scheduled',
        message: `Starts in ${Math.floor(timeUntilStart / 60)}h ${timeUntilStart % 60}m`,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        borderColor: 'border-blue-200',
        canAccess: false
      };
    }

    if (endTime && now > endTime) {
      return {
        status: 'ended',
        message: 'Exam ended',
        color: 'text-red-600',
        bg: 'bg-red-50',
        borderColor: 'border-red-200',
        canAccess: false
      };
    }

    // Check attempt limits
    if (exam.attemptsTaken >= exam.maxAttempts) {
      return {
        status: 'completed',
        message: `Completed (${exam.attemptsTaken}/${exam.maxAttempts})`,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        borderColor: 'border-gray-200',
        canAccess: false
      };
    }

    const remainingTime = endTime ? Math.floor((endTime - now) / (1000 * 60)) : null;
    return {
      status: 'available',
      message: remainingTime ? `${Math.floor(remainingTime / 60)}h ${remainingTime % 60}m left` : 'Available',
      color: 'text-green-600',
      bg: 'bg-green-50',
      borderColor: 'border-green-200',
      canAccess: true
    };
  }, []);

  // Add this right before your render logic (before the "if (!isAuthenticated)" check)
console.log('🔍 StudentExamLogin Debug:', {
  isAuthenticated,
  student,
  availableExams,
  availableExamsLength: availableExams?.length
})

  // Step 1: Student Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <School className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Portal</h1>
            <p className="text-indigo-200">Enter your matric number to view available exams</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">
                  {loginError.data?.message || 'Login failed'}
                </p>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-6">
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
                    placeholder="e.g., MED001, CS/2024/001"
                    disabled={isLoggingIn}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-200 ${
                  isLoggingIn 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]'
                }`}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Checking...
                  </div>
                ) : (
                  'View Available Exams'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Secure exam access portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Exam Selection & Password Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Student Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-indigo-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 rounded-full p-3">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome, {student.firstName} {student.lastName}
                </h1>
                <p className="text-gray-600">Matric No: {student.matricNo}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                {currentTime.toLocaleString()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Available Exams */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Available Exams</h2>
          
          {availableExams && availableExams.length > 0 ? (
            <div className="grid gap-6">
              {availableExams.map((exam) => {
                const status = getExamStatus(exam);
                const isSelected = selectedExam?.id === exam.id;
                
                return (
                  <div
                    key={exam.id}
                    className={`border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                        : `${status.borderColor} ${status.bg} hover:shadow-md`
                    }`}
                    onClick={() => status.canAccess && setSelectedExam(exam)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.title}</h3>
                        <p className="text-gray-600 mb-2">{exam.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {exam.course.code}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            {exam.duration} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {exam.attemptsTaken}/{exam.maxAttempts} attempts
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.bg} border ${status.borderColor}`}>
                          {status.message}
                        </div>
                        {exam.timeRemaining && (
                          <p className="text-xs text-gray-500 mt-1">
                            Ends: {exam.endTime ? new Date(exam.endTime).toLocaleDateString() : 'No deadline'}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="border-t border-indigo-200 pt-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm font-medium text-indigo-800 mb-2">Examiner:</p>
                          <p className="text-indigo-700">
                            {exam.examiner.firstName} {exam.examiner.lastName}
                          </p>
                          {exam.instructions && (
                            <>
                              <p className="text-sm font-medium text-indigo-800 mb-2 mt-3">Instructions:</p>
                              <p className="text-sm text-indigo-700">{exam.instructions}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {!status.canAccess && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600">
                          {status.status === 'scheduled' && 'This exam is not yet available.'}
                          {status.status === 'ended' && 'This exam has ended.'}
                          {status.status === 'completed' && 'You have used all your attempts for this exam.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No exams available at this time</p>
              <p className="text-gray-400 mt-2">Check back later or contact your examiner</p>
            </div>
          )}
        </div>

        {/* Exam Access Form */}
        {selectedExam && getExamStatus(selectedExam).canAccess && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Enter Exam Password for: {selectedExam.title}
            </h3>
            
            <form onSubmit={handleExamAccess} className="max-w-md">
              <div className="mb-6">
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
                    disabled={isValidatingAccess}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    disabled={isValidatingAccess}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  This code was provided by your examiner
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className={`flex-1 py-3 px-6 rounded-xl text-white font-bold transition-all duration-200 ${
                    isValidatingAccess 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  }`}
                  disabled={isValidatingAccess}
                >
                  {isValidatingAccess ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Validating...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Start Exam
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExam(null);
                    setExamPassword('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={isValidatingAccess}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamLogin;