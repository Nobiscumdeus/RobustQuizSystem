import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';
import { 
  useGetCourseForEditQuery, 
  useUpdateCourseViaEditMutation 
} from '@api/courseApi';

const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useCurrentUser();
  
  const { 
    data: apiResponse,
    isLoading: courseLoading,
    error: fetchError 
  } = useGetCourseForEditQuery(courseId, {
    skip: !courseId || !isAuthenticated,
  });
  
  const [updateCourse, { 
    isLoading: updateLoading 
  }] = useUpdateCourseViaEditMutation();
  
  const [course, setCourse] = useState({
    title: '',
    code: '',
    description: '',
    creditHours: 0,
    semester: '',
    isActive: true,
    examinerId: ''
  });
  
  const [error, setError] = useState(null);
  const [formChanged, setFormChanged] = useState(false);

  // Initialize form with fetched data
  useEffect(() => {
    if (apiResponse?.course) {
      setCourse({
        title: apiResponse.course.title || '',
        code: apiResponse.course.code || '',
        description: apiResponse.course.description || '',
        creditHours: apiResponse.course.creditHours || 0,
        semester: apiResponse.course.semester || '',
        isActive: apiResponse.course.isActive !== false,
        examinerId: apiResponse.course.examinerId || ''
      });
    }
  }, [apiResponse]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormChanged(true);
    setCourse(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formChanged) {
      setError('No changes detected.');
      return;
    }
    
    try {
      const payload = {
        title: course.title,
        code: course.code,
        description: course.description,
        creditHours: Number(course.creditHours),
        semester: course.semester,
        isActive: course.isActive,
        examinerId: course.examinerId
      };
  
      await updateCourse({
        id: courseId,
        ...payload
      }).unwrap();
      
      setFormChanged(false);
      navigate(`/courses/${courseId}`);
      
    } catch (err) {
      const errorMessage = err?.data?.message || 
                          err?.data?.validationErrors ||
                          'Update failed';
      setError(errorMessage);
    }
  };

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formChanged) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formChanged]);

  const handleCancel = () => {
    if (formChanged && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate(`/courses/${courseId}`);
  };

  if (courseLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgb(var(--color-primary))' }}
        ></div>
        <span className="ml-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>
          Loading course data...
        </span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4 text-center">
        <div 
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))'
          }}
        >
          {fetchError?.data?.message || 'Failed to load course'}
        </div>
        <button
          onClick={() => navigate('/admin_panel')}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-bold"
          style={{ color: 'rgb(var(--color-text-primary))' }}
        >
          Edit Course
        </h1>
        {formChanged && (
          <span 
            className="text-sm px-3 py-1 rounded"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'rgb(var(--color-warning))'
            }}
          >
            You have unsaved changes
          </span>
        )}
      </div>
      
      {error && (
        <div 
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          {error}
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Course Title */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Title <span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={course.title}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>
          
          {/* Course Code */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Code <span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="text"
              name="code"
              value={course.code}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>
          
          {/* Credit Hours */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Credit Hours
            </label>
            <input
              type="number"
              name="creditHours"
              value={course.creditHours}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              min="0"
              step="0.5"
            />
          </div>
          
          {/* Semester */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Semester
            </label>
            <input
              type="text"
              name="semester"
              value={course.semester}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              placeholder="e.g., Fall 2024"
            />
          </div>
          
          {/* Examiner (display only) */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Examiner
            </label>
            <input
              type="text"
              value={course.examinerId}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-secondary))'
              }}
              readOnly
            />
          </div>
          
          {/* Active Status */}
          <div className="form-group flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={course.isActive}
              onChange={handleChange}
              className="h-5 w-5 rounded"
              style={{
                color: 'rgb(var(--color-primary))',
                borderColor: 'rgb(var(--color-border))',
                backgroundColor: 'rgb(var(--color-background))'
              }}
            />
            <label 
              className="ml-2 block text-sm font-medium"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Active Course
            </label>
          </div>
        </div>
        
        {/* Description */}
        <div className="form-group mb-6">
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Description
          </label>
          <textarea
            name="description"
            value={course.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            placeholder="Enter course description..."
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: 'rgb(var(--color-surface-elevated))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            disabled={updateLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium"
            style={{
              backgroundColor: updateLoading || !formChanged
                ? 'rgb(var(--color-border))'
                : 'rgb(var(--color-primary))',
              color: updateLoading || !formChanged
                ? 'rgb(var(--color-text-secondary))'
                : 'white',
              opacity: updateLoading || !formChanged ? 0.7 : 1
            }}
            disabled={updateLoading || !formChanged}
          >
            {updateLoading ? (
              <span className="flex items-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;


/*
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditCoursePage = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState({
    title: '',
    code: '',
    description: '',
    creditHours: 0,
    semester: '',
    isActive: true,
    examinerId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const navigate =useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/course/${courseId}/edit`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data?.course) {
          setCourse({
            title: response.data.course.title || '',
            code: response.data.course.code || '',
            description: response.data.course.description || '',
            creditHours: response.data.course.creditHours || 0,
            semester: response.data.course.semester || '',
            isActive: response.data.course.isActive !== false,
            examinerId: response.data.course.examinerId || ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course data');
        console.error('Load Error:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare payload that exactly matches backend expectations
      const payload = {
        title: course.title,
        code: course.code,
        description: course.description,
        creditHours: Number(course.creditHours),
        semester: course.semester,
        isActive: course.isActive, // Map to backend's field name
       // department: '', // Add default value for required field
        examinerId: course.examinerId
      };
  
      console.log('Sending payload:', payload);
  
      const response = await axios.put(
        `http://localhost:5000/course/${courseId}`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Update successful:', response.data);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      const errorData = {
        message: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
        request: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      };
      
      console.error('Update failed:', errorData);
      
      // Display detailed error message to user
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.validationErrors ||
                          `Update failed (${err.response?.status})`;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading course data...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}


      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
            <input
              type="text"
              name="title"
              value={course.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
      
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Code*</label>
            <input
              type="text"
              name="code"
              value={course.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
       
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Hours</label>
            <input
              type="number"
              name="creditHours"
              value={course.creditHours}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
       

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="text"
              name="semester"
              value={course.semester}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Examiner</label>
            <input
              type="text"
              value={course.examinerId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              readOnly
            />
          </div>

        
     
          <div className="form-group flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={course.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Active Course</label>
          </div>
        </div>
        
      
        <div className="form-group mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={course.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>



    </div>
  );
};

export default EditCoursePage;

*/