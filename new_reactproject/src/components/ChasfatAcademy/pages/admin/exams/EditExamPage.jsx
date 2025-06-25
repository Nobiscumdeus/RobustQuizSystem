import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated } from '../../../utility/auth';

const EditExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
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
    isPublished: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courses, setCourses] = useState([]);
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

  // Format date for datetime-local input
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
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
      if (isNaN(date.getTime())) return ''; // Invalid date
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error("Date formatting error:", err);
      return '';
    }
  };

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/course',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    fetchCourses();
  }, [token]);

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        // Changed from "exams" to "exam" to match your backend route
        const response = await axios.get(
          `http://localhost:5000/exam/${examId}/edit`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.exam.isPublished) {
          setError('Published exams cannot be edited');
          navigate(`/exams/${examId}`);
          return;
        }

        const examData = response.data.exam;
        setExam(examData);
        
        // Properly format and populate all form fields
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
          isPublished: examData.isPublished || false
        });
      } catch (err) {
        console.error("API error:", err);
        setError(err.response?.data?.message || 'Failed to load exam for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, token, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    // Handle different input types
    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value);
    } else if (type === 'checkbox') {
      processedValue = e.target.checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear any success/error messages when user makes changes
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Changed from "exams" to "exam" to match your backend route
      const response = await axios.put(
        `http://localhost:5000/exam/${examId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state with the returned data
      const updatedExam = response.data.exam;
      setExam(updatedExam);
      
      // Update form data with the returned values
      setFormData({
        title: updatedExam.title || '',
        description: updatedExam.description || '',
        date: formatDateForInput(updatedExam.date),
        duration: updatedExam.duration || 60,
        courseId: updatedExam.courseId || '',
        instructions: updatedExam.instructions || '',
        startTime: formatDateTimeForInput(updatedExam.startTime),
        endTime: formatDateTimeForInput(updatedExam.endTime),
        maxAttempts: updatedExam.maxAttempts || 1,
        passingScore: updatedExam.passingScore || 60.0,
        isPublished: updatedExam.isPublished || false
      });
      
      // Show success message
      setSuccess("Exam updated successfully!");
      
      // Optional: Navigate after a short delay to show the success message
      // setTimeout(() => navigate(`/exam/${examId}`), 1500);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || 'Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !exam) return <div className="p-4">Loading exam details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!exam) return <div className="p-4">Exam not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Exam: {exam.title}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-200 rounded">
            {success}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              name="courseId"
              value={formData.courseId || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)*</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Description and Instructions */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded"
              placeholder="Special instructions for students taking this exam"
            />
          </div>
        </div>

        {/* Time Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">When students can begin the exam</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">When the exam access closes</p>
          </div>
        </div>

        {/* Exam Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
            <input
              type="number"
              name="maxAttempts"
              value={formData.maxAttempts}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">How many times a student can take this exam</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
            <input
              type="number"
              name="passingScore"
              value={formData.passingScore}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">Minimum percentage required to pass</p>
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(`/exam/${examId}`)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExamPage