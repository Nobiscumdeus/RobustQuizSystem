import { useGetUserProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useUploadAvatarMutation, useGetUserStatsQuery } from '@api/profileApi';
import { useMemo, useState } from 'react';

/**
 * Hook for managing user profile
 */
export const useProfile = () => {
  // Get profile data
  const { 
    data: profileData, 
    isLoading: profileLoading, 
    error: profileError, 
    refetch: refetchProfile 
  } = useGetUserProfileQuery();
  
  // Get user stats
  const { 
    data: statsData, 
    error: statsError 
  } = useGetUserStatsQuery(undefined, {
    skip: !profileData, // Only fetch stats if profile exists
  });
  
  // Profile mutations
  const [updateProfileMutation, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePasswordMutation, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [uploadAvatarMutation, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();

  const [error, setError] = useState(null);

  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const result = await updateProfileMutation(profileData).unwrap();
      // API returns { success, data, message }
      if (result && result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result?.message || 'Failed to update profile' };
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (passwordData) => {
    setError(null);
    try {
      const result = await changePasswordMutation(passwordData).unwrap();
      if (result && result.success) {
        return { success: true, message: result.message };
      }
      return { success: false, error: result?.message || 'Failed to change password' };
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Failed to change password';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Upload profile avatar
   */
  const uploadAvatar = async (file) => {
    setError(null);
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const result = await uploadAvatarMutation(formData).unwrap();
      if (result && result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result?.message || 'Failed to upload avatar' };
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Failed to upload avatar';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Combine stats with profile data
  const userData = useMemo(() => {
    if (!profileData) return null;

    return {
      ...profileData,
      stats: statsData || {},
    };
  }, [profileData, statsData]);

  return {
    // Data
    userData,
    stats: statsData,
    
    // Loading states
    isLoading: profileLoading && !profileData,
    isUpdatingProfile: updatingProfile,
    isChangingPassword: changingPassword,
    isUploadingAvatar: uploadingAvatar,
    
    // Errors
    error: error || profileError?.data?.message || statsError?.data?.message,
    profileError: profileError,
    statsError: statsError,
    
    // Functions
    updateProfile,
    changePassword,
    uploadAvatar,
    refetchProfile,
    
    // Helpers
    hasProfile: !!profileData,
  };
};

export default useProfile;