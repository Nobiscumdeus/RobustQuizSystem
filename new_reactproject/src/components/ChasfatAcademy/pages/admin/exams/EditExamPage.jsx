import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  useExamForEdit,
  useExaminerCourses,
  useUpdateExam,
  usePublishExam,
} from '@hooks/useExam';

const EditExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();

  // Use our custom hooks
  const { 
    exam: fetchedExam, 
    isLoading: examLoading, 
    error: examError, 
    refetch: refetchExam 
  } = useExamForEdit(examId);

  const { 
    courses, 
    isLoading: coursesLoading, 
    error: coursesError 
  } = useExaminerCourses();

  const { 
    updateExam, 
    isLoading: updateLoading 
  } = useUpdateExam();

  const { 
    publishExam: publishExamMutation, 
    isLoading: publishLoading 
  } = usePublishExam();

  // Format date for datetime-local input
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch (err) {
      console.error("Date formatting error:", err);
      return '';
    }
  };

  // Helper to safely format date
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error("Date formatting error:", err);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration: 60,
    courseId: '',
    instructions: '',
    startTime: '',
    endTime: '',
    maxAttempts: 1,
    passingScore: 60.0,
    isPublished: false,
    password: '',
    state: 'DRAFT',
    proctoringSettings: {}
  });

  const [proctoringSettingsJson, setProctoringSettingsJson] = useState('{}');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isLoading = examLoading || coursesLoading || updateLoading || publishLoading;

  // Initialize form with fetched data
  useEffect(() => {
    if (fetchedExam) {
      // Check if exam is published
      if (fetchedExam.isPublished) {
        setError('Published exams cannot be edited');
        navigate(`/exams/${examId}`);
        return;
      }

      const examData = fetchedExam;
      const proctoringSettings = examData.proctoringSettings || {};
      
      setFormData({
        title: examData.title || '',
        description: examData.description || '',
        date: formatDateForInput(examData.date),
        duration: examData.duration || 60,
        courseId: examData.courseId || '',
        instructions: examData.instructions || '',
        startTime: formatDateTimeForInput(examData.startTime),
        endTime: formatDateTimeForInput(examData.endTime),
        maxAttempts: examData.maxAttempts || 1,
        passingScore: examData.passingScore || 60.0,
        isPublished: examData.isPublished || false,
        password: examData.password || '',
        state: examData.state || 'DRAFT',
        proctoringSettings: proctoringSettings
      });
      
      setProctoringSettingsJson(JSON.stringify(proctoringSettings, null, 2));
    }
  }, [fetchedExam, examId, navigate]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value);
    } else if (type === 'checkbox') {
      processedValue = checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear messages when user makes changes
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleProctoringSettingsChange = (e) => {
    const value = e.target.value;
    setProctoringSettingsJson(value);
    
    try {
      const parsedSettings = JSON.parse(value);
      setFormData(prev => ({ 
        ...prev, 
        proctoringSettings: parsedSettings 
      }));
    } catch (err) {
      // Don't update if JSON is invalid
      console.error("Invalid JSON for proctoring settings");
      toast.error("Invalid JSON for proctoring settings")
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        duration: parseInt(formData.duration),
        maxAttempts: parseInt(formData.maxAttempts),
        passingScore: parseFloat(formData.passingScore),
        date: formData.date ? new Date(formData.date).toISOString() : null,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };
      
      const result = await updateExam({ examId, ...submitData });
      
      if (result.success) {
        setSuccess("Exam updated successfully!");
        refetchExam(); // Refresh exam data
      } else {
        setError(result.error);
        toast.error(result.error)
      }
    } catch (err) {
      setError('Failed to update exam');
      toast.error("Failed to update exam");
    }
  };

  const handlePublishExam = async () => {
    if (!window.confirm("Are you sure you want to publish this exam? Published exams cannot be edited.")) {
      return;
    }
    
    try {
      const result = await publishExamMutation(examId);
      
      if (result.success) {
        setSuccess("Exam published successfully!");
        setTimeout(() => navigate(`/exam/${examId}`), 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to publish exam');
    }
  };

  // Loading and error states
  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <div 
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))'
          }}
        >
          Please log in to edit exams
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'white'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (examLoading && !fetchedExam) {
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

  if (examError && !fetchedExam) {
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

  if (!fetchedExam) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-bold"
          style={{ color: 'rgb(var(--color-text-primary))' }}
        >
          Edit Exam: {fetchedExam.title}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: 'rgb(var(--color-surface-elevated))',
              color: 'rgb(var(--color-text-primary))',
              border: '1px solid rgb(var(--color-border))'
            }}
          >
            Cancel
          </button>
          {!formData.isPublished && (
            <button
              onClick={handlePublishExam}
              disabled={publishLoading}
              className="px-4 py-2 rounded disabled:opacity-50"
              style={{
                backgroundColor: 'rgb(var(--color-success))',
                color: 'white'
              }}
            >
              {publishLoading ? 'Publishing...' : 'Publish Exam'}
            </button>
          )}
        </div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="rounded-lg shadow p-6"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          color: 'rgb(var(--color-text-primary))'
        }}
      >
        {/* Success Message */}
        {success && (
          <div 
            className="mb-4 p-3 rounded border"
            style={{
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              color: 'rgb(var(--color-success))',
              borderColor: 'rgba(52, 211, 153, 0.2)'
            }}
          >
            {success}
          </div>
        )}
        
        {/* Error Messages */}
        {error && (
          <div 
            className="mb-4 p-3 rounded border"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'rgb(var(--color-error))',
              borderColor: 'rgba(239, 68, 68, 0.2)'
            }}
          >
            {error}
          </div>
        )}

        {coursesError && (
          <div 
            className="mb-4 p-3 rounded border"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'rgb(var(--color-warning))',
              borderColor: 'rgba(245, 158, 11, 0.2)'
            }}
          >
            Failed to load courses: {coursesError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Title<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Course<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <select
              name="courseId"
              value={formData.courseId || ''}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Date<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Duration (minutes)<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Exam Password<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
              placeholder="Password for students to access exam"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Exam State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              <option value="DRAFT">Draft</option>
              <option value="READY">Ready</option>
              <option value="PUBLISHED">Published</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Description and Instructions */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              placeholder="Exam description for students"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              placeholder="Special instructions for students taking this exam"
            />
          </div>
        </div>

        {/* Time Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
            <p 
              className="text-sm mt-1"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              When students can begin the exam
            </p>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
            <p 
              className="text-sm mt-1"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              When the exam access closes
            </p>
          </div>
        </div>

        {/* Exam Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Max Attempts
            </label>
            <input
              type="number"
              name="maxAttempts"
              value={formData.maxAttempts}
              onChange={handleChange}
              min="1"
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
            <p 
              className="text-sm mt-1"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              How many times a student can take this exam
            </p>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Passing Score (%)
            </label>
            <input
              type="number"
              name="passingScore"
              value={formData.passingScore}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
            <p 
              className="text-sm mt-1"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              Minimum percentage required to pass
            </p>
          </div>
        </div>

        {/* Proctoring Settings */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Proctoring Settings (JSON)
          </label>
          <textarea
            value={proctoringSettingsJson}
            onChange={handleProctoringSettingsChange}
            rows="6"
            className="w-full p-2 rounded font-mono text-sm"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            placeholder='{"requireWebcam": true, "screenMonitoring": true, "fullScreenRequired": true}'
          />
          <p 
            className="text-sm mt-1"
            style={{ color: 'rgb(var(--color-text-secondary))' }}
          >
            JSON configuration for proctoring settings. Must be valid JSON.
          </p>
        </div>

        {/* Publish Status */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="h-4 w-4 rounded"
            style={{
              color: 'rgb(var(--color-primary))',
              backgroundColor: 'rgb(var(--color-background))',
              borderColor: 'rgb(var(--color-border))'
            }}
          />
          <label 
            htmlFor="isPublished" 
            className="ml-2 block text-sm"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Publish Exam (students can see and access it)
          </label>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(`/exam/${examId}`)}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: 'rgb(var(--color-surface-elevated))',
              color: 'rgb(var(--color-text-primary))',
              border: '1px solid rgb(var(--color-border))'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded disabled:opacity-50"
            style={{
              backgroundColor: 'rgb(var(--color-primary))',
              color: 'white'
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExamPage;
