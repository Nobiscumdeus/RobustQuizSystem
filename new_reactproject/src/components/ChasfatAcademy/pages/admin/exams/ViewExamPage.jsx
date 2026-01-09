import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  useExam,
  useEligibleStudents,
  useCourseQuestions,
  useStudentResults,
  useQuestionAnalytics,
  useAttendances,
  useAddQuestionToExam,
  useAddRandomQuestions,
  useRemoveQuestionFromExam,
  useExamStudents,
} from '@/hooks/useExam';

const ViewExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();

  // Use our custom hooks
  const { 
    exam, 
    totalPoints, 
    isLoading: examLoading, 
    error: examError, 
    refetch: refetchExam 
  } = useExam(examId);

  const { 
    students: eligibleStudents, 
    isLoading: studentsLoading,
    refetch: refetchEligibleStudents 
  } = useEligibleStudents(examId);

  const { 
    questions: courseQuestions, 
    isLoading: questionsLoading,
    refetch: refetchCourseQuestions 
  } = useCourseQuestions(exam?.courseId);

  const { 
    results: studentResults, 
    isLoading: resultsLoading,
    refetch: refetchStudentResults 
  } = useStudentResults(examId);

  const { 
    analytics: questionAnalytics, 
    isLoading: analyticsLoading,
    refetch: refetchQuestionAnalytics 
  } = useQuestionAnalytics(examId);

  const { 
    attendances, 
    isLoading: attendancesLoading,
    refetch: refetchAttendances 
  } = useAttendances(examId);

  // Action hooks
  const { addQuestion, isLoading: addingQuestion } = useAddQuestionToExam();
  const { addRandomQuestions, isLoading: addingRandomQuestions } = useAddRandomQuestions();
  const { removeQuestion, isLoading: removingQuestion } = useRemoveQuestionFromExam();
  const { addStudent, removeStudent, isLoading: managingStudents } = useExamStudents();

  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [randomQuestionCount, setRandomQuestionCount] = useState(5);
  //const [error, setError] = useState(null);

  const isLoadingAction = addingQuestion || addingRandomQuestions || removingQuestion || managingStudents;
  const isLoading = examLoading || studentsLoading || questionsLoading || 
                   resultsLoading || analyticsLoading || attendancesLoading;

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to view this page');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Refetch all data when exam changes
  useEffect(() => {
    if (exam?.courseId) {
      refetchEligibleStudents();
      refetchCourseQuestions();
      refetchStudentResults();
      refetchQuestionAnalytics();
      refetchAttendances();
    }
  }, [exam?.courseId, refetchEligibleStudents, refetchCourseQuestions, 
      refetchStudentResults, refetchQuestionAnalytics, refetchAttendances]);

  // Handlers for actions
  const handleAddQuestion = async (questionId) => {
    if (!window.confirm('Add this question to the exam?')) return;
    
    const result = await addQuestion({ examId, questionId });
    if (result.success) {
      toast.success('Question added successfully');
      refetchExam();
      refetchQuestionAnalytics();
    } else {
      toast.error(result.error);
    }
  };

  const handleAddRandomQuestions = async () => {
    if (!window.confirm(`Add ${randomQuestionCount} random questions to the exam?`)) return;
    
    const result = await addRandomQuestions({ examId, count: randomQuestionCount });
    if (result.success) {
      toast.success(`${randomQuestionCount} questions added randomly`);
      refetchExam();
      refetchQuestionAnalytics();
    } else {
      toast.error(result.error);
    }
  };

  const handleRemoveQuestion = async (examQuestionId) => {
    if (!window.confirm('Remove this question from the exam?')) return;
    
    const result = await removeQuestion({ examId, examQuestionId });
    if (result.success) {
      toast.success('Question removed successfully');
      refetchExam();
      refetchQuestionAnalytics();
    } else {
      toast.error(result.error);
    }
  };

  const handleAddStudent = async (studentId, studentName) => {
    if (!window.confirm(`Add ${studentName} to this exam?`)) return;
    
    const result = await addStudent({ examId, studentId });
    if (result.success) {
      toast.success('Student added to exam');
      refetchExam();
      refetchEligibleStudents();
      refetchAttendances();
      refetchStudentResults();
    } else {
      toast.error(result.error);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this exam?`)) return;
    
    const result = await removeStudent({ examId, studentId });
    if (result.success) {
      toast.success('Student removed from exam');
      refetchExam();
      refetchEligibleStudents();
      refetchAttendances();
      refetchStudentResults();
    } else {
      toast.error(result.error);
    }
  };

  // Loading and error states
  if (isLoading && !exam) {
    return (
      <div className="flex justify-center items-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgb(var(--color-primary))' }}
        ></div>
        <span className="ml-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>
          Loading exam details...
        </span>
      </div>
    );
  }

  if (examError && !exam) {
    return (
      <div className="p-4 text-center">
        <div 
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))'
          }}
        >
          {examError}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-4 text-center">
        <p style={{ color: 'rgb(var(--color-text-primary))' }} className="mb-4">Exam not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Exams
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-bold"
          style={{ color: 'rgb(var(--color-text-primary))' }}
        >
          {exam.title}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Exams
        </button>
      </div>

      {/* Main Content */}
      <div 
        className="rounded-lg shadow p-6"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          color: 'rgb(var(--color-text-primary))'
        }}
      >
        {/* Exam Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 
              className="text-lg font-semibold mb-2"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Exam Information
            </h2>
            {[
              ['Course', exam.course?.title || 'N/A'],
              ['Date', new Date(exam.date).toLocaleDateString()],
              ['Duration', `${exam.duration} minutes`],
              ['Status', exam.isPublished ? 'Published' : 'Draft'],
              ['State', exam.state || 'N/A'],
              ['Total Points', totalPoints],
              ['Max Attempts', exam.maxAttempts || 1],
              ['Passing Score', `${exam.passingScore || '60.0'}%`],
              ['Created', new Date(exam.createdAt).toLocaleString()],
              ['Last Updated', new Date(exam.updatedAt).toLocaleString()],
              ['Examiner', `${exam.examiner?.firstName || ''} ${exam.examiner?.lastName || ''} (${exam.examiner?.email || 'N/A'})`],
            ].map(([label, value], idx) => (
              <p key={idx} className="mb-2">
                <span 
                  className="font-medium"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  {label}:
                </span>{' '}
                <span style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  {value}
                </span>
              </p>
            ))}
            
            {/* Password */}
            <p className="mb-2">
              <span 
                className="font-medium"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Password:
              </span>{' '}
              {exam.password ? (
                <>
                  <span style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    {showPassword ? exam.password : '••••••••'}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-sm"
                    style={{ color: 'rgb(var(--color-primary))' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </>
              ) : (
                <span style={{ color: 'rgb(var(--color-text-secondary))' }}>None</span>
              )}
            </p>

            {/* Timestamps */}
            {[
              ['Published At', exam.publishedAt],
              ['Activated At', exam.activatedAt],
              ['Completed At', exam.completedAt],
              ['Start Time', exam.startTime],
              ['End Time', exam.endTime],
            ].map(([label, timestamp], idx) => (
              <p key={idx} className="mb-2">
                <span 
                  className="font-medium"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  {label}:
                </span>{' '}
                <span style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  {timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}
                </span>
              </p>
            ))}
          </div>

          <div>
            <h2 
              className="text-lg font-semibold mb-2"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Instructions
            </h2>
            <p 
              className="whitespace-pre-line mb-4"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              {exam.instructions || 'No instructions provided'}
            </p>
            
            <h2 
              className="text-lg font-semibold mb-2"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Proctoring Settings
            </h2>
            <p 
              className="whitespace-pre-line text-sm"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              {exam.proctoringSettings ? 
                JSON.stringify(exam.proctoringSettings, null, 2) : 
                'No proctoring settings configured'}
            </p>
          </div>
        </div>

        {/* Eligible Students Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Eligible Students ({eligibleStudents.length})
            </h2>
            <button
              onClick={() => setShowManageStudents(!showManageStudents)}
              className="text-sm"
              style={{ color: 'rgb(var(--color-primary))' }}
              disabled={isLoadingAction}
            >
              {showManageStudents ? 'Hide' : 'Manage Students'}
            </button>
          </div>

          {showManageStudents && (
            <div 
              className="rounded-lg p-4 mb-4"
              style={{
                backgroundColor: 'rgb(var(--color-background))'
              }}
            >
              {eligibleStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligibleStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-3 rounded"
                      style={{
                        backgroundColor: 'rgb(var(--color-surface-elevated))'
                      }}
                    >
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
                        >
                          {student.firstName} {student.lastName}
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: 'rgb(var(--color-text-secondary))' }}
                        >
                          {student.matricNo}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: 'rgb(var(--color-text-secondary))' }}
                        >
                          {student.department} • Level {student.level}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: student.isActive 
                              ? 'rgba(52, 211, 153, 0.2)' 
                              : 'rgba(239, 68, 68, 0.2)',
                            color: student.isActive 
                              ? 'rgb(52, 211, 153)' 
                              : 'rgb(239, 68, 68)'
                          }}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {exam.students?.some((s) => s.id === student.id) ? (
                          <button
                            onClick={() => handleRemoveStudent(student.id, `${student.firstName} ${student.lastName}`)}
                            className="text-xs"
                            style={{ color: 'rgb(var(--color-error))' }}
                            disabled={isLoadingAction}
                          >
                            {isLoadingAction ? 'Removing...' : 'Remove'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddStudent(student.id, `${student.firstName} ${student.lastName}`)}
                            className="text-xs"
                            style={{ color: 'rgb(var(--color-primary))' }}
                            disabled={isLoadingAction}
                          >
                            {isLoadingAction ? 'Adding...' : 'Add to Exam'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  No eligible students found
                </p>
              )}
            </div>
          )}
        </div>

        {/* Student Results Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Student Results ({studentResults.length})
            </h2>
            <button
              onClick={refetchStudentResults}
              className="text-sm"
              style={{ color: 'rgb(var(--color-primary))' }}
              disabled={isLoadingAction}
            >
              Refresh Results
            </button>
          </div>
          <div 
            className="rounded-lg p-4 max-h-60 overflow-y-auto"
            style={{
              backgroundColor: 'rgb(var(--color-background))'
            }}
          >
            {studentResults.length > 0 ? (
              <div className="space-y-2">
                {studentResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="flex items-center justify-between p-3 rounded"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <div>
                      <p 
                        className="font-medium"
                        style={{ color: 'rgb(var(--color-text-primary))' }}
                      >
                        {result.student.firstName} {result.student.lastName}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        {result.student.matricNo}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        Time Spent: {result.timeSpent ? `${result.timeSpent} seconds` : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          color: 'rgb(59, 130, 246)'
                        }}
                      >
                        Score: {result.score}/{totalPoints} ({result.percentage}%)
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: result.status === 'COMPLETED' 
                            ? 'rgba(52, 211, 153, 0.2)' 
                            : 'rgba(245, 158, 11, 0.2)',
                          color: result.status === 'COMPLETED' 
                            ? 'rgb(52, 211, 153)' 
                            : 'rgb(245, 158, 11)'
                        }}
                      >
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                No results available
              </p>
            )}
          </div>
        </div>

        {/* Exam Sessions Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Exam Sessions ({exam.examSessions?.length || 0})
            </h2>
          </div>
          <div 
            className="rounded-lg p-4 max-h-60 overflow-y-auto"
            style={{
              backgroundColor: 'rgb(var(--color-background))'
            }}
          >
            {exam.examSessions?.length > 0 ? (
              <div className="space-y-2">
                {exam.examSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-3 rounded"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <p 
                      className="font-medium"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      Session ID: {session.id}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Student: {session.student.firstName} {session.student.lastName} ({session.student.matricNo})
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Started: {new Date(session.startedAt).toLocaleString()}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Ended: {session.endedAt ? new Date(session.endedAt).toLocaleString() : 'Ongoing'}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      IP Address: {session.ipAddress || 'N/A'}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      User Agent: {session.userAgent || 'N/A'}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Violations: {session.violations ? JSON.stringify(session.violations, null, 2) : 'None'}
                    </p>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: session.isActive 
                          ? 'rgba(52, 211, 153, 0.2)' 
                          : 'rgba(75, 85, 99, 0.2)',
                        color: session.isActive 
                          ? 'rgb(52, 211, 153)' 
                          : 'rgb(156, 163, 175)'
                      }}
                    >
                      {session.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                No exam sessions recorded
              </p>
            )}
          </div>
        </div>

        {/* Attendance Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Attendance ({attendances.length})
            </h2>
            <button
              onClick={refetchAttendances}
              className="text-sm"
              style={{ color: 'rgb(var(--color-primary))' }}
              disabled={isLoadingAction}
            >
              Refresh Attendance
            </button>
          </div>
          <div 
            className="rounded-lg p-4 max-h-60 overflow-y-auto"
            style={{
              backgroundColor: 'rgb(var(--color-background))'
            }}
          >
            {attendances.length > 0 ? (
              <div className="space-y-2">
                {attendances.map((attendance) => (
                  <div 
                    key={attendance.id} 
                    className="flex items-center justify-between p-3 rounded"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <div>
                      <p 
                        className="font-medium"
                        style={{ color: 'rgb(var(--color-text-primary))' }}
                      >
                        {attendance.student.firstName} {attendance.student.lastName}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        {attendance.student.matricNo}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        Timestamp: {new Date(attendance.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: attendance.status === 'present'
                          ? 'rgba(52, 211, 153, 0.2)'
                          : attendance.status === 'absent'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                        color: attendance.status === 'present'
                          ? 'rgb(52, 211, 153)'
                          : attendance.status === 'absent'
                          ? 'rgb(239, 68, 68)'
                          : 'rgb(245, 158, 11)'
                      }}
                    >
                      {attendance.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                No attendance records
              </p>
            )}
          </div>
        </div>

        {/* Question Analytics Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Question Analytics ({questionAnalytics.length})
            </h2>
            <button
              onClick={refetchQuestionAnalytics}
              className="text-sm"
              style={{ color: 'rgb(var(--color-primary))' }}
              disabled={isLoadingAction}
            >
              Refresh Analytics
            </button>
          </div>
          <div 
            className="rounded-lg p-4 max-h-60 overflow-y-auto"
            style={{
              backgroundColor: 'rgb(var(--color-background))'
            }}
          >
            {questionAnalytics.length > 0 ? (
              <div className="space-y-2">
                {questionAnalytics.map((analytic) => (
                  <div 
                    key={analytic.id} 
                    className="p-3 rounded"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface-elevated))'
                    }}
                  >
                    <p 
                      className="font-medium line-clamp-2"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      {analytic.question.questionText}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Total Attempts: {analytic.totalAttempts}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Correct Attempts: {analytic.correctAttempts} ({((analytic.correctAttempts / analytic.totalAttempts) * 100 || 0).toFixed(1)}%)
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Average Time: {analytic.averageTime ? `${analytic.averageTime.toFixed(1)} seconds` : 'N/A'}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      Difficulty Rating: {analytic.difficultyRating ? analytic.difficultyRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                No analytics available
              </p>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Questions ({exam.examQuestions?.length || 0})
            </h2>
            {!exam.isPublished && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddQuestions(!showAddQuestions)}
                  className="px-3 py-1 rounded text-sm"
                  style={{
                    backgroundColor: 'rgb(var(--color-primary))',
                    color: 'white'
                  }}
                  disabled={isLoadingAction}
                >
                  {showAddQuestions ? 'Hide' : 'Add Questions'}
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={randomQuestionCount}
                    onChange={(e) => setRandomQuestionCount(e.target.value)}
                    className="p-1 rounded"
                    style={{
                      backgroundColor: 'rgb(var(--color-background))',
                      border: '1px solid rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))',
                      width: '80px'
                    }}
                    disabled={isLoadingAction}
                  />
                  <button
                    onClick={handleAddRandomQuestions}
                    className="px-3 py-1 rounded text-sm"
                    style={{
                      backgroundColor: 'rgb(var(--color-success))',
                      color: 'white'
                    }}
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? 'Adding...' : 'Add Random'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Questions Panel */}
          {showAddQuestions && (
            <div 
              className="rounded-lg p-4 mb-4"
              style={{
                backgroundColor: 'rgb(var(--color-background))'
              }}
            >
              <h3 
                className="font-medium mb-3"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Available Course Questions
              </h3>
              {courseQuestions.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {courseQuestions.map((question) => (
                    <div 
                      key={question.id} 
                      className="flex items-start justify-between p-3 rounded"
                      style={{
                        backgroundColor: 'rgb(var(--color-surface-elevated))'
                      }}
                    >
                      <div className="flex-1">
                        <p 
                          className="font-medium text-sm"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
                        >
                          {question.questionText}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: 'rgba(75, 85, 99, 0.2)',
                              color: 'rgb(var(--color-text-secondary))'
                            }}
                          >
                            {question.questionType}
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: 'rgba(52, 211, 153, 0.2)',
                              color: 'rgb(52, 211, 153)'
                            }}
                          >
                            {question.points} pts
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: 'rgba(168, 85, 247, 0.2)',
                              color: 'rgb(168, 85, 247)'
                            }}
                          >
                            {question.category || 'Uncategorized'}
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: 'rgba(245, 158, 11, 0.2)',
                              color: 'rgb(245, 158, 11)'
                            }}
                          >
                            {question.difficulty || 'Unspecified'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddQuestion(question.id)}
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'rgb(var(--color-primary))',
                          color: 'white'
                        }}
                        disabled={isLoadingAction}
                      >
                        {isLoadingAction ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  No questions available
                </p>
              )}
            </div>
          )}

          {/* Exam Questions List */}
          <div className="space-y-4">
            {exam.examQuestions?.length > 0 ? (
              exam.examQuestions.map((examQuestion, index) => (
                <div 
                  key={examQuestion.id} 
                  className="border rounded-lg p-4"
                  style={{
                    borderColor: 'rgb(var(--color-border))'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p 
                      className="font-medium"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      Question {index + 1}: {examQuestion.question.questionText}
                    </p>
                    <div className="flex gap-2">
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          color: 'rgb(59, 130, 246)'
                        }}
                      >
                        {examQuestion.question.questionType}
                      </span>
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'rgba(52, 211, 153, 0.2)',
                          color: 'rgb(52, 211, 153)'
                        }}
                      >
                        {examQuestion.points} pts
                      </span>
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'rgba(168, 85, 247, 0.2)',
                          color: 'rgb(168, 85, 247)'
                        }}
                      >
                        {examQuestion.question.category || 'Uncategorized'}
                      </span>
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          color: 'rgb(245, 158, 11)'
                        }}
                      >
                        {examQuestion.question.difficulty || 'Unspecified'}
                      </span>
                      {!exam.isPublished && (
                        <button
                          onClick={() => handleRemoveQuestion(examQuestion.id)}
                          className="text-xs"
                          style={{ color: 'rgb(var(--color-error))' }}
                          disabled={isLoadingAction}
                        >
                          {isLoadingAction ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Options */}
                  {examQuestion.question.options?.length > 0 && (
                    <div className="mt-2 ml-4">
                      <p 
                        className="text-sm mb-1"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        Options:
                      </p>
                      <ul className="list-disc pl-5">
                        {examQuestion.question.options.map((option, optIndex) => (
                          <li
                            key={optIndex}
                            style={{
                              color: option === examQuestion.question.correctAnswer 
                                ? 'rgb(var(--color-success))' 
                                : 'rgb(var(--color-text-secondary))',
                              fontWeight: option === examQuestion.question.correctAnswer 
                                ? '600' 
                                : 'normal'
                            }}
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                No questions added yet
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate(`/exam/${examId}/edit`)}
            disabled={exam.isPublished || isLoadingAction}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: exam.isPublished || isLoadingAction
                ? 'rgb(var(--color-border))'
                : 'rgb(var(--color-primary))',
              color: exam.isPublished || isLoadingAction
                ? 'rgb(var(--color-text-secondary))'
                : 'white'
            }}
          >
            Edit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewExamPage;

/*
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [courseQuestions, setCourseQuestions] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [questionAnalytics, setQuestionAnalytics] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [randomQuestionCount, setRandomQuestionCount] = useState(5);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const token = localStorage.getItem('token');

  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/singleexam/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExam(response.data.exam);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load exam';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [examId, token]);

  const fetchEligibleStudents = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/exam/${examId}/eligible-students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEligibleStudents(response.data.students);
    } catch (err) {
      toast.error('Failed to fetch eligible students');
      console.error('Failed to fetch eligible students:', err);
    }
  }, [examId, token]);

  const fetchCourseQuestions = useCallback(async (courseId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/course/${courseId}/questions?page=1&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourseQuestions(response.data.questions);
    } catch (err) {
      toast.error('Failed to fetch course questions');
      console.error('Failed to fetch course questions:', err);
    }
  }, [token]);

  const fetchStudentResults = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/exam/${examId}/results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentResults(response.data.results);
    } catch (err) {
      toast.error('Failed to fetch student results');
      console.error('Failed to fetch student results:', err);
    }
  }, [examId, token]);

  const fetchQuestionAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/exam/${examId}/question-analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestionAnalytics(response.data.analytics);
    } catch (err) {
      toast.error('Failed to fetch question analytics');
      console.error('Failed to fetch question analytics:', err);
    }
  }, [examId, token]);

  const fetchAttendances = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/exam/${examId}/attendances`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendances(response.data.attendances);
    } catch (err) {
      toast.error('Failed to fetch attendances');
      console.error('Failed to fetch attendances:', err);
    }
  }, [examId, token]);

  const addQuestionToExam = useCallback(async (questionId) => {
    if (!window.confirm('Add this question to the exam?')) return;
    setIsLoadingAction(true);
    try {
      await axios.post(
        `http://localhost:5000/exam/${examId}/questions`,
        { questionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question added successfully');
      fetchExam();
      fetchQuestionAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    } finally {
      setIsLoadingAction(false);
    }
  }, [examId, token, fetchExam, fetchQuestionAnalytics]);

  const addRandomQuestions = useCallback(async () => {
    if (!window.confirm(`Add ${randomQuestionCount} random questions to the exam?`)) return;
    setIsLoadingAction(true);
    try {
      await axios.post(
        `http://localhost:5000/exam/${examId}/questions/random`,
        { count: randomQuestionCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${randomQuestionCount} questions added randomly`);
      fetchExam();
      fetchQuestionAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add random questions');
    } finally {
      setIsLoadingAction(false);
    }
  }, [examId, token, randomQuestionCount, fetchExam, fetchQuestionAnalytics]);

  const removeQuestionFromExam = useCallback(async (examQuestionId) => {
    if (!window.confirm('Remove this question from the exam?')) return;
    setIsLoadingAction(true);
    try {
      await axios.delete(
        `http://localhost:5000/exam/${examId}/questions/${examQuestionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question removed successfully');
      fetchExam();
      fetchQuestionAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove question');
    } finally {
      setIsLoadingAction(false);
    }
  }, [examId, token, fetchExam, fetchQuestionAnalytics]);

  const addStudentToExam = useCallback(async (studentId, studentName) => {
    if (!window.confirm(`Add ${studentName} to this exam?`)) return;
    setIsLoadingAction(true);
    try {
      await axios.post(
        `http://localhost:5000/exam/${examId}/students`,
        { studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Student added to exam');
      fetchExam();
      fetchEligibleStudents();
      fetchAttendances();
      fetchStudentResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    } finally {
      setIsLoadingAction(false);
    }
  }, [examId, token, fetchExam, fetchEligibleStudents, fetchAttendances, fetchStudentResults]);

  const removeStudentFromExam = useCallback(async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this exam?`)) return;
    setIsLoadingAction(true);
    try {
      await axios.delete(
        `http://localhost:5000/exam/${examId}/students/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Student removed from exam');
      fetchExam();
      fetchEligibleStudents();
      fetchAttendances();
      fetchStudentResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove student');
    } finally {
      setIsLoadingAction(false);
    }
  }, [examId, token, fetchExam, fetchEligibleStudents, fetchAttendances, fetchStudentResults]);

  useEffect(() => {
    if (!token) {
      toast.error('Please log in to view this page');
      navigate('/login');
      return;
    }
    fetchExam();
  }, [fetchExam, token, navigate]);

  useEffect(() => {
    if (exam?.courseId) {
      fetchEligibleStudents();
      fetchCourseQuestions(exam.courseId);
      fetchStudentResults();
      fetchQuestionAnalytics();
      fetchAttendances();
    }
  }, [exam?.courseId, fetchEligibleStudents, fetchCourseQuestions, fetchStudentResults, fetchQuestionAnalytics, fetchAttendances]);

  if (loading) return <div className="p-4">Loading exam details...</div>;
  if (error && !exam) return <div className="p-4 text-red-500">{error}</div>;
  if (!exam) return <div className="p-4">Exam not found</div>;

  const totalPoints = exam.examQuestions?.reduce((sum, q) => sum + q.points, 0) || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Exams
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Exam Information</h2>
            <p className="mb-2"><span className="font-medium">Course:</span> {exam.course?.title || 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Date:</span> {new Date(exam.date).toLocaleDateString()}</p>
            <p className="mb-2"><span className="font-medium">Duration:</span> {exam.duration} minutes</p>
            <p className="mb-2"><span className="font-medium">Status:</span> {exam.isPublished ? 'Published' : 'Draft'}</p>
            <p className="mb-2"><span className="font-medium">State:</span> {exam.state || 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Total Points:</span> {totalPoints}</p>
            <p className="mb-2">
              <span className="font-medium">Password:</span>{' '}
              {exam.password ? (
                <>
                  <span>{showPassword ? exam.password : '••••••••'}</span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </>
              ) : (
                'None'
              )}
            </p>
            <p className="mb-2"><span className="font-medium">Published At:</span> {exam.publishedAt ? new Date(exam.publishedAt).toLocaleString() : 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Activated At:</span> {exam.activatedAt ? new Date(exam.activatedAt).toLocaleString() : 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Completed At:</span> {exam.completedAt ? new Date(exam.completedAt).toLocaleString() : 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Start Time:</span> {exam.startTime ? new Date(exam.startTime).toLocaleString() : 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">End Time:</span> {exam.endTime ? new Date(exam.endTime).toLocaleString() : 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Max Attempts:</span> {exam.maxAttempts || 1}</p>
            <p className="mb-2"><span className="font-medium">Passing Score:</span> {exam.passingScore || '60.0'}%</p>
            <p className="mb-2"><span className="font-medium">Created:</span> {new Date(exam.createdAt).toLocaleString()}</p>
            <p className="mb-2"><span className="font-medium">Last Updated:</span> {new Date(exam.updatedAt).toLocaleString()}</p>
            <p className="mb-2"><span className="font-medium">Examiner:</span> {exam.examiner?.firstName} {exam.examiner?.lastName || 'N/A'} ({exam.examiner?.email || 'N/A'})</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Instructions</h2>
            <p className="whitespace-pre-line">{exam.instructions || 'No instructions provided'}</p>
            <h2 className="text-lg font-semibold mt-4 mb-2">Proctoring Settings</h2>
            <p className="whitespace-pre-line">{exam.proctoringSettings ? JSON.stringify(exam.proctoringSettings, null, 2) : 'No proctoring settings configured'}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">
              Eligible Students ({eligibleStudents.length})
            </h2>
            <button
              onClick={() => setShowManageStudents(!showManageStudents)}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isLoadingAction}
            >
              {showManageStudents ? 'Hide' : 'Manage Students'}
            </button>
          </div>

          {showManageStudents && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              {eligibleStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligibleStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded">
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-600">{student.matricNo}</p>
                        <p className="text-xs text-gray-500">{student.department} • Level {student.level}</p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {exam.students?.some((s) => s.id === student.id) ? (
                          <button
                            onClick={() => removeStudentFromExam(student.id, `${student.firstName} ${student.lastName}`)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            disabled={isLoadingAction}
                          >
                            {isLoadingAction ? 'Removing...' : 'Remove'}
                          </button>
                        ) : (
                          <button
                            onClick={() => addStudentToExam(student.id, `${student.firstName} ${student.lastName}`)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            disabled={isLoadingAction}
                          >
                            {isLoadingAction ? 'Adding...' : 'Add to Exam'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No eligible students found</p>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Student Results ({studentResults.length})</h2>
            <button
              onClick={fetchStudentResults}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isLoadingAction}
            >
              Refresh Results
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            {studentResults.length > 0 ? (
              <div className="space-y-2">
                {studentResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between bg-white p-3 rounded">
                    <div>
                      <p className="font-medium">{result.student.firstName} {result.student.lastName}</p>
                      <p className="text-sm text-gray-600">{result.student.matricNo}</p>
                      <p className="text-xs text-gray-500">Time Spent: {result.timeSpent ? `${result.timeSpent} seconds` : 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Score: {result.score}/{totalPoints} ({result.percentage}%)
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          result.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No results available</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Exam Sessions ({exam.examSessions?.length || 0})</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            {exam.examSessions?.length > 0 ? (
              <div className="space-y-2">
                {exam.examSessions.map((session) => (
                  <div key={session.id} className="bg-white p-3 rounded">
                    <p className="font-medium">Session ID: {session.id}</p>
                    <p className="text-sm text-gray-600">
                      Student: {session.student.firstName} {session.student.lastName} ({session.student.matricNo})
                    </p>
                    <p className="text-sm text-gray-600">
                      Started: {new Date(session.startedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ended: {session.endedAt ? new Date(session.endedAt).toLocaleString() : 'Ongoing'}
                    </p>
                    <p className="text-sm text-gray-600">IP Address: {session.ipAddress || 'N/A'}</p>
                    <p className="text-sm text-gray-600">User Agent: {session.userAgent || 'N/A'}</p>
                    <p className="text-sm text-gray-600">
                      Violations: {session.violations ? JSON.stringify(session.violations, null, 2) : 'None'}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No exam sessions recorded</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Attendance ({attendances.length})</h2>
            <button
              onClick={fetchAttendances}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isLoadingAction}
            >
              Refresh Attendance
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            {attendances.length > 0 ? (
              <div className="space-y-2">
                {attendances.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between bg-white p-3 rounded">
                    <div>
                      <p className="font-medium">{attendance.student.firstName} {attendance.student.lastName}</p>
                      <p className="text-sm text-gray-600">{attendance.student.matricNo}</p>
                      <p className="text-xs text-gray-500">
                        Timestamp: {new Date(attendance.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        attendance.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : attendance.status === 'absent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {attendance.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No attendance records</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Question Analytics ({questionAnalytics.length})</h2>
            <button
              onClick={fetchQuestionAnalytics}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isLoadingAction}
            >
              Refresh Analytics
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            {questionAnalytics.length > 0 ? (
              <div className="space-y-2">
                {questionAnalytics.map((analytic) => (
                  <div key={analytic.id} className="bg-white p-3 rounded">
                    <p className="font-medium line-clamp-2">{analytic.question.questionText}</p>
                    <p className="text-sm text-gray-600">
                      Total Attempts: {analytic.totalAttempts}
                    </p>
                    <p className="text-sm text-gray-600">
                      Correct Attempts: {analytic.correctAttempts} ({((analytic.correctAttempts / analytic.totalAttempts) * 100 || 0).toFixed(1)}%)
                    </p>
                    <p className="text-sm text-gray-600">
                      Average Time: {analytic.averageTime ? `${analytic.averageTime.toFixed(1)} seconds` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Difficulty Rating: {analytic.difficultyRating ? analytic.difficultyRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No analytics available</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Questions ({exam.examQuestions?.length || 0})</h2>
            {!exam.isPublished && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddQuestions(!showAddQuestions)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  disabled={isLoadingAction}
                >
                  {showAddQuestions ? 'Hide' : 'Add Questions'}
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={randomQuestionCount}
                    onChange={(e) => setRandomQuestionCount(e.target.value)}
                    className="w-20 p-1 border rounded"
                    disabled={isLoadingAction}
                  />
                  <button
                    onClick={addRandomQuestions}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? 'Adding...' : 'Add Random'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {showAddQuestions && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Available Course Questions</h3>
              {courseQuestions.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {courseQuestions.map((question) => (
                    <div key={question.id} className="flex items-start justify-between bg-white p-3 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{question.questionText}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {question.questionType}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {question.points} pts
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {question.category || 'Uncategorized'}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            {question.difficulty || 'Unspecified'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => addQuestionToExam(question.id)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        disabled={isLoadingAction}
                      >
                        {isLoadingAction ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No questions available</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {exam.examQuestions?.length > 0 ? (
              exam.examQuestions.map((examQuestion, index) => (
                <div key={examQuestion.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">Question {index + 1}: {examQuestion.question.questionText}</p>
                    <div className="flex gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {examQuestion.question.questionType}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {examQuestion.points} pts
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {examQuestion.question.category || 'Uncategorized'}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {examQuestion.question.difficulty || 'Unspecified'}
                      </span>
                      {!exam.isPublished && (
                        <button
                          onClick={() => removeQuestionFromExam(examQuestion.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          disabled={isLoadingAction}
                        >
                          {isLoadingAction ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>




                  {examQuestion.question.options?.length > 0 && (
                    <div className="mt-2 ml-4">
                      <p className="text-sm text-gray-600 mb-1">Options:</p>
                      <ul className="list-disc pl-5">
                        {examQuestion.question.options.map((option, optIndex) => (
                          <li
                            key={optIndex}
                            className={
                              option === examQuestion.question.correctAnswer ? 'text-green-600 font-medium' : ''
                            }
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}






                </div>
              ))
            ) : (
              <p className="text-gray-500">No questions added yet</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate(`/exam/${examId}/edit`)}
            disabled={exam.isPublished || isLoadingAction}
            className={`px-4 py-2 rounded ${
              exam.isPublished || isLoadingAction
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Edit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewExamPage;
*/