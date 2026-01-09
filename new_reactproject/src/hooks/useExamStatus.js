import { useCallback } from 'react';

export const useExamStatus = () => {
  const getExamStatus = useCallback((exam) => {
    const now = new Date();
    const startTime = exam.startTime ? new Date(exam.startTime) : null;
    const endTime = exam.endTime ? new Date(exam.endTime) : null;

    // Scheduled exam
    if (startTime && now < startTime) {
      const timeUntilStart = Math.ceil((startTime - now) / (1000 * 60));
      const hours = Math.floor(timeUntilStart / 60);
      const minutes = timeUntilStart % 60;
      
      return {
        status: 'scheduled',
        message: `Starts in ${hours}h ${minutes}m`,
        color: 'text-info',
        bg: 'bg-info/10',
        borderColor: 'border-info/20',
        canAccess: false
      };
    }

    // Ended exam
    if (endTime && now > endTime) {
      return {
        status: 'ended',
        message: 'Exam ended',
        color: 'text-error',
        bg: 'bg-error/10',
        borderColor: 'border-error/20',
        canAccess: false
      };
    }

    // Max attempts reached
    if (exam.attemptsTaken >= exam.maxAttempts) {
      return {
        status: 'completed',
        message: `Completed (${exam.attemptsTaken}/${exam.maxAttempts})`,
        color: 'text-text-secondary',
        bg: 'bg-surface-elevated',
        borderColor: 'border-border',
        canAccess: false
      };
    }

    // Available exam
    const remainingTime = endTime ? Math.floor((endTime - now) / (1000 * 60)) : null;
    const remainingHours = remainingTime ? Math.floor(remainingTime / 60) : 0;
    const remainingMinutes = remainingTime ? remainingTime % 60 : 0;
    
    return {
      status: 'available',
      message: remainingTime ? `${remainingHours}h ${remainingMinutes}m left` : 'Available',
      color: 'text-success',
      bg: 'bg-success/10',
      borderColor: 'border-success/20',
      canAccess: true
    };
  }, []);

  return { getExamStatus };
};