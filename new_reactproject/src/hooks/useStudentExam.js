import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { 
  useStudentLoginMutation, 
  useValidateExamAccessMutation,
  useStartExamSessionMutation,
  useSaveAnswerMutation,
  useSaveAnswerBatchMutation,
  useSubmitExamMutation,
  useSendHeartbeatMutation,
  useLogViolationMutation
} from '@api/examinationApi';
import { 
 // setAuthData, 
  logout, 
  setExamQuestions,
  setExamSession,
  updateAnswer,
  clearExamData 
} from '@features/ChasfatAcademy/auth/studentAuthSlice';

export const useStudentExam = () => {
  const dispatch = useDispatch();
  
  // Direct mutations (no localStorage, no wrapper try-catch)
  const [studentLogin, { isLoading: isLoggingIn }] = useStudentLoginMutation();
  const [validateExamAccess, { isLoading: isValidatingAccess }] = useValidateExamAccessMutation();
  const [startExamSession, { isLoading: isStartingSession }] = useStartExamSessionMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [saveAnswerBatch] = useSaveAnswerBatchMutation();
  const [submitExam, { isLoading: isSubmitting }] = useSubmitExamMutation();
  const [sendHeartbeat] = useSendHeartbeatMutation();
  const [logViolation] = useLogViolationMutation();

  // Login - Just returns the promise, browser handles cookies
  const handleStudentLogin = useCallback((matricNo) => 
    studentLogin({ matricNo: matricNo.trim() }).unwrap(),
    [studentLogin]
  );

  // Validate exam - Just returns the promise
  const handleValidateExamAccess = useCallback((examId, password) => 
    validateExamAccess({ examId, password }).unwrap(),
    [validateExamAccess]
  );

  // Start session + update Redux
  const handleStartExamSession = useCallback(async (sessionId) => {
    const result = await startExamSession({ sessionId }).unwrap();
    dispatch(setExamQuestions(result.questions || []));
    dispatch(setExamSession(result.examSession));
    return result;
  }, [startExamSession, dispatch]);

  // Save answer + update Redux
  const handleSaveAnswer = useCallback(async (sessionId, questionId, answer) => {
    const result = await saveAnswer({ sessionId, questionId, answer }).unwrap();
    dispatch(updateAnswer({ questionNumber: questionId, answer }));
    return result;
  }, [saveAnswer, dispatch]);

  // Other mutations - just return the promise
  const handleSaveAnswerBatch = useCallback((sessionId, answers) => 
    saveAnswerBatch({ sessionId, answers }).unwrap(),
    [saveAnswerBatch]
  );

  const handleSubmitExam = useCallback(async (sessionId) => {
    const result = await submitExam(sessionId).unwrap();
    dispatch(clearExamData());
    return result;
  }, [submitExam, dispatch]);

  const handleSendHeartbeat = useCallback((sessionId) => 
    sendHeartbeat({ sessionId, clientTime: new Date().toISOString() }).unwrap(),
    [sendHeartbeat]
  );

  const handleLogViolation = useCallback((sessionId, violationType, details) => 
    logViolation({ sessionId, violationType, details }).unwrap(),
    [logViolation]
  );

  // Logout - just clears Redux (backend clears cookies)
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    handleStudentLogin,
    handleValidateExamAccess,
    handleStartExamSession,
    handleSaveAnswer,
    handleSaveAnswerBatch,
    handleSubmitExam,
    handleSendHeartbeat,
    handleLogViolation,
    handleLogout,
    isLoggingIn,
    isValidatingAccess,
    isStartingSession,
    isSubmitting
  };
};