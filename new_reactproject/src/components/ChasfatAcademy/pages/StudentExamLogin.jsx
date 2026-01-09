import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Clock, AlertCircle, CheckCircle, 
  LogOut, User, Lock, School, BookOpen, Timer, Users , BarChart3
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Custom hooks
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useExamStatus } from '@/hooks/useExamStatus';
import { useTheme } from '@/hooks/useTheme';

const StudentExamLogin = () => {
  const navigate = useNavigate();
  
  // State
  const [matricNo, setMatricNo] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [examPassword, setExamPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Redux state
  const { student, isAuthenticated, availableExams } = useSelector(state => state.studentAuth);

  // Custom hooks
  const { 
    handleStudentLogin, 
    handleValidateExamAccess, 
    handleLogout,
    isLoggingIn, 
    isValidatingAccess,
    loginError 
  } = useStudentAuth();
  
  const { getExamStatus } = useExamStatus();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Login handler
  const handleLogin = useCallback(async (e) => {
    e?.preventDefault?.();
    
    if (!matricNo.trim()) {
      toast.error('Please enter a valid matriculation number');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await handleStudentLogin(matricNo);
      toast.success(`Welcome ${result.student.firstName}! Select your exam.`);
    } catch (err) {
      toast.error(err.data?.message || 'Login failed. Please check your matric number.');
    } finally {
      setIsSubmitting(false);
    }
  }, [matricNo, handleStudentLogin, isSubmitting]);

  // Exam access handler
  const handleExamAccess = useCallback(async (e) => {
    e?.preventDefault?.();

    // Validation
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }

    if (selectedExam.attemptsTaken >= selectedExam.maxAttempts) {
      toast.error(`Maximum attempts (${selectedExam.maxAttempts}) exceeded.`);
      return;
    }

    if (!examPassword.trim()) {
      toast.error('Please enter the exam password');
      return;
    }

    try {
      const result = await handleValidateExamAccess(selectedExam.id, examPassword);
      
      toast.success('Exam access granted! Redirecting...');
      
      // Navigate with state
      navigate(`/student/exam/${selectedExam.id}`, {
        state: {
          sessionId: result.examSession.id,
          examData: selectedExam,
          student,
          sessionInfo: result.examSession
        }
      });
    } catch (err) {
      // Handle specific error cases
      if (err.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      } else {
        toast.error(err.data?.message || 'Invalid exam password');
      }
    }
  }, [selectedExam, examPassword, handleValidateExamAccess, navigate, student, handleLogout]);

  // Logout handler
  const handleStudentLogout = useCallback(() => {
    handleLogout();
    setMatricNo('');
    setSelectedExam(null);
    setExamPassword('');
    window.location.href = '/student_exam_login';
  }, [handleLogout]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

    const { darkMode} = useTheme()

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="bg-surface rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg border border-border">
              <School className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Student Portal</h1>
            <p className="text-text-secondary">Enter your matric number to view available exams</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-border rounded-xl shadow-lg p-8"
          >
            {loginError && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                <p className="text-error text-sm font-medium">
                  {loginError.data?.message || 'Login failed'}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="matricNo" className="block text-sm font-semibold text-text-primary mb-3">
                  Matriculation Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input
                    id="matricNo"
                    type="text"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-primary placeholder:text-text-tertiary"
                    placeholder="e.g., MED001, CS/2024/001"
                    disabled={isLoggingIn}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-lg text-white font-bold transition-all ${
                  isLoggingIn 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-hover shadow-lg'
                }`}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Checking...
                  </div>
                ) : (
                  'View Available Exams'
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
                <Lock className="w-4 h-4" />
                <span>Secure exam access portal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }



  // Exam selection screen
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Student Info */}
        <div className="bg-surface border border-border rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Welcome, {student.firstName} {student.lastName}
                </h1>
                <p className="text-text-secondary">Matric No: {student.matricNo}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-text-tertiary text-sm flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {currentTime.toLocaleString()}
              </div>
              <button
                onClick={handleStudentLogout}
                className="flex items-center gap-2 px-4 py-2 bg-error hover:bg-error/80 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

   <div className="flex items-center gap-4 m-4">
  <Link 
    to="/student_results"
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium
      ${darkMode 
        ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      }
    `}
  >
    <BarChart3 className="w-4 h-4" />
    View Results
  </Link>
</div>













        {/* Available Exams */}
        <div className="bg-surface border border-border rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Your Available Exams</h2>
          
          {availableExams?.length > 0 ? (
            <div className="grid gap-6">
              {availableExams.map((exam) => {
                const status = getExamStatus(exam);
                const isSelected = selectedExam?.id === exam.id;
                
                return (
                  <motion.div
                    key={exam.id}
                    whileHover={{ scale: 1.005 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : `${status.borderColor} ${status.bg} hover:shadow-md`
                    }`}
                    onClick={() => status.canAccess && setSelectedExam(exam)}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary mb-2">{exam.title}</h3>
                        <p className="text-text-secondary mb-2">{exam.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary">
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
                        {exam.endTime && (
                          <p className="text-xs text-text-tertiary mt-1">
                            Ends: {new Date(exam.endTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="border-t border-primary/20 pt-4">
                        <div className="bg-surface-elevated rounded-lg p-4">
                          <p className="text-sm font-medium text-text-primary mb-2">Examiner:</p>
                          <p className="text-primary">
                            {exam.examiner.firstName} {exam.examiner.lastName}
                          </p>
                          {exam.instructions && (
                            <>
                              <p className="text-sm font-medium text-text-primary mb-2 mt-3">Instructions:</p>
                              <p className="text-sm text-text-secondary">{exam.instructions}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {!status.canAccess && (
                      <div className="mt-3 p-3 bg-surface-elevated rounded-lg">
                        <p className="text-sm text-text-secondary">
                          {status.status === 'scheduled' && 'This exam is not yet available.'}
                          {status.status === 'ended' && 'This exam has ended.'}
                          {status.status === 'completed' && 'You have used all your attempts for this exam.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <School className="w-16 h-16 text-border mx-auto mb-4" />
              <p className="text-xl text-text-secondary">No exams available at this time</p>
              <p className="text-text-tertiary mt-2">Check back later or contact your examiner</p>
            </div>
          )}
        </div>

        {/* Exam Access Form */}
        {selectedExam && getExamStatus(selectedExam).canAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl shadow-md p-8"
          >
            <h3 className="text-xl font-bold text-text-primary mb-6">
              Enter Exam Password for: {selectedExam.title}
            </h3>
            
            <form onSubmit={handleExamAccess} className="max-w-md">
              <div className="mb-6">
                <label htmlFor="examPassword" className="block text-sm font-semibold text-text-primary mb-3">
                  Exam Access Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input
                    id="examPassword"
                    type={showPassword ? "text" : "password"}
                    value={examPassword}
                    onChange={(e) => setExamPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-primary placeholder:text-text-tertiary"
                    placeholder="Enter exam access code"
                    disabled={isValidatingAccess}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                    disabled={isValidatingAccess}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-tertiary">
                  This code was provided by your examiner
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 px-6 rounded-lg text-white font-bold transition-all ${
                    isValidatingAccess 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-success hover:bg-success/80 shadow-lg'
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
                </motion.button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExam(null);
                    setExamPassword('');
                  }}
                  className="px-6 py-3 border border-border text-text-primary rounded-lg hover:bg-surface-elevated transition-colors"
                  disabled={isValidatingAccess}
                >
                  Cancel
                </button>
              </div> 
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentExamLogin;
