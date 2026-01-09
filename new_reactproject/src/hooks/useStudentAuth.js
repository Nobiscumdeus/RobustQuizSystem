import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { 
  useStudentLoginMutation, 
  useValidateExamAccessMutation 
} from '@api/examinationApi';
import { 
  setAuthData, 
  logout 
} from '@features/ChasfatAcademy/auth/studentAuthSlice';

export const useStudentAuth = () => {
  const dispatch = useDispatch();
  
  // RTK Query mutations
  const [studentLogin, { isLoading: isLoggingIn, error: loginError }] = useStudentLoginMutation();
  const [validateExamAccess, { isLoading: isValidatingAccess }] = useValidateExamAccessMutation();

  // Login handler
  const handleStudentLogin = useCallback((matricNo) => 
    studentLogin({ matricNo: matricNo.trim() }).unwrap().then(result => {
      dispatch(setAuthData(result));
      return result;
    }),
    [studentLogin, dispatch]
  );

  // Validate exam access
  const handleValidateExamAccess = useCallback((examId, password) => 
    validateExamAccess({ examId, password: password.trim() }).unwrap(),
    [validateExamAccess]
  );

  // Logout
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    // Actions
    handleStudentLogin,
    handleValidateExamAccess,
    handleLogout,
    
    // States
    isLoggingIn,
    isValidatingAccess,
    loginError
  };
};