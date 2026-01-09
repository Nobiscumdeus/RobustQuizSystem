import { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery, useRegisterMutation } from '@api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout as logoutAction } from '@features/ChasfatAcademy/auth/authSlice';
import { useState } from 'react';
import { useGetUserProfileQuery } from '@/api/dashboardApi';

// Hook for login functionality
export const useAuthLogin = () => {
  const [loginMutation, { isLoading, error: mutationError, data }] = useLoginMutation();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    setError(null); // Clear previous errors
    try {
      const result = await loginMutation(credentials).unwrap();
      dispatch(setCredentials({ user: result.user }));
      return result;
    } catch (err) {
      setError(err);
      throw err; // Re-throw so component can handle it too if needed
    }
  };

  return { login, isLoading, error: error || mutationError, data };
};

// Hook for logout functionality
export const useAuthLogout = () => {
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state even if API fails
      dispatch(logoutAction());
    }
  };

  return { logout };
};

// Hook to get current user
/*
export const useCurrentUser = () => {
  const { user, isAuthenticated, role } = useSelector(state => state.auth);
   console.log('useCurrentUser:', { isAuthenticated, user }); // ← ADD THIS
  const { data: profileData, refetch } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated, // Only fetch if authenticated
  });

  // Sync RTK Query data with Redux state
  useEffect(() => {
    if (profileData && isAuthenticated) {
      // Optionally update Redux state with fresh data
    }
  }, [profileData, isAuthenticated]);

  return { 
    user: user || profileData, 
    isAuthenticated, 
    role,
    refetch 
  };
};
*/
export const useCurrentUser = () => {
  const { user, isAuthenticated, role } = useSelector(state => state.auth);
  
  const { 
    data: profileData, 
    refetch, 
    isLoading, 
    error 
  } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  console.log('DEBUG useCurrentUser:', { 
    reduxUser: user, 
    isAuthenticated, 
    profileData,  // ← This should now have the user data
    isLoading, 
    error 
  });

  // Now profileData should contain the actual user object
  const currentUser = user || profileData;
  
  return { 
    user: currentUser, 
    isAuthenticated: isAuthenticated && !!currentUser,
    role: currentUser?.role || role,
    isLoading,
    error,
    refetch 
  };
};

export const useUserProfile = () =>{
    const { data, isLoading , error, refetch} = useGetUserProfileQuery();

    return {
        userData: data,
        isLoading,
        error,
        refetch
    }
}

// Hook for registration functionality
export const useRegister = () => {
  const [registerMutation, { isLoading, error: mutationError }] = useRegisterMutation();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const register = async (userData) => {
    setError(null); // Clear previous errors
    try {
      const result = await registerMutation(userData).unwrap();
      
      // Handle different response formats from your API
      const user = result.user || result.data || result;
      
      if (user) {
        dispatch(setCredentials({ user }));
        return { success: true, data: user };
      } else {
        throw new Error('No user data received');
      }
    } catch (err) {
      const errorMsg = err?.data?.message || err?.error || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return { 
    register, 
    isLoading, 
    error: error || mutationError?.data?.message || mutationError?.error 
  };
};
