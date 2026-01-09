import { useGetUserProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useUploadAvatarMutation, useGetUserStatsQuery } from '@api/profileApi';
import { useState } from 'react';

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
    isLoading: statsLoading, 
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
      return { success: true, data: result };
    } catch (err) {
      setError(err.data?.message || 'Failed to update profile');
      return { success: false, error: err.data?.message || 'Failed to update profile' };
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (passwordData) => {
    setError(null);
    try {
      const result = await changePasswordMutation(passwordData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      setError(err.data?.message || 'Failed to change password');
      return { success: false, error: err.data?.message || 'Failed to change password' };
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
      return { success: true, data: result };
    } catch (err) {
      setError(err.data?.message || 'Failed to upload avatar');
      return { success: false, error: err.data?.message || 'Failed to upload avatar' };
    }
  };

  // Combine stats with profile data
  const userData = profileData ? {
    ...profileData,
    stats: statsData || {},
  } : null;

  return {
    // Data
    userData,
    stats: statsData,
    
    // Loading states
    isLoading: profileLoading || statsLoading,
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