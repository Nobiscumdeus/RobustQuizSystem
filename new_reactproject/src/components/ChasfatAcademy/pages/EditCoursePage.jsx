import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated } from '../utility/auth';

const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
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


    // Authentication check
    useEffect(() => {
      if (!isAuthenticated()) {
        navigate("/login", {
          state: { from: "/admin_panel" },
          replace: true,
        });
      }
    }, [navigate]);

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
          {/* Course Title */}
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
          
          {/* Course Code */}
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
          
          {/* Credit Hours */}
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
          
          {/* Semester */}
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
          
          {/* Examiner (display only) */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Examiner</label>
            <input
              type="text"
              value={course.examinerId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Active Course</label>
          </div>
        </div>
        
        {/* Description */}
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
        
        {/* Form Actions */}
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