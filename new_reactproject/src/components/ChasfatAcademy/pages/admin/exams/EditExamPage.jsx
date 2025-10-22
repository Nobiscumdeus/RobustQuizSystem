import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

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
    isPublished: false,
    password: '',
    state: 'DRAFT',
    proctoringSettings: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courses, setCourses] = useState([]);
  const [proctoringSettingsJson, setProctoringSettingsJson] = useState('{}');
  const token = localStorage.getItem('token');

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

  /*

  const formatDateForAPI = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString(); // Full ISO-8601 format
  } catch (err) {
    console.error("Date conversion error:", err);
    return null;
  }
};

*/

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {

           const decodedToken = jwtDecode(token);
        const examinerId = decodedToken.userId;

        const response = await axios.get(
          `http://localhost:5000/courses/${examinerId}`,
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
        
        // Parse proctoring settings if they exist
        const proctoringSettings = examData.proctoringSettings || {};
        
        // Properly format and populate all form fields
        setFormData({
          title: examData.title || '',
          description: examData.description || '',
          date: formatDateForInput(examData.date),
         // date:formatDateForAPI(examData.date),
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
        
        // Set proctoring settings as JSON string for editing
        setProctoringSettingsJson(JSON.stringify(proctoringSettings, null, 2));
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
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Handle different input types
    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value);
    } else if (type === 'checkbox') {
      processedValue = checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear any success/error messages when user makes changes
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Ensure numeric fields are properly formatted
        duration: parseInt(formData.duration),
        maxAttempts: parseInt(formData.maxAttempts),
        passingScore: parseFloat(formData.passingScore),
        // Parse date fields
        date: formData.date ? new Date(formData.date).toISOString() : null,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };
      
      const response = await axios.put(
        `http://localhost:5000/exam/${examId}`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state with the returned data
      const updatedExam = response.data.exam;
      setExam(updatedExam);
      
      // Update form data with the returned values
      const proctoringSettings = updatedExam.proctoringSettings || {};
      
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
        isPublished: updatedExam.isPublished || false,
        password: updatedExam.password || '',
        state: updatedExam.state || 'DRAFT',
        proctoringSettings: proctoringSettings
      });
      
      setProctoringSettingsJson(JSON.stringify(proctoringSettings, null, 2));
      
      // Show success message
      setSuccess("Exam updated successfully!");
      
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || 'Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  /*
  const handlePublishExam = async () => {
    if (!window.confirm("Are you sure you want to publish this exam? Published exams cannot be edited.")) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/exam/${examId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response);
      
      setSuccess("Exam published successfully!");
      setTimeout(() => navigate(`/exam/${examId}`), 1500);
    } catch (err) {
      console.error("Publish error:", err);
      setError(err.response?.data?.message || 'Failed to publish exam');
      setLoading(false);
    }
  };
  */
 const handlePublishExam = async () => {
  if (!window.confirm("Are you sure you want to publish this exam? Published exams cannot be edited.")) {
    return;
  }
  
  try {
    setLoading(true);
    
    // Use the existing update endpoint with published status
    /*
    const publishData = {
      ...formData,
      isPublished: true,
      state: 'PUBLISHED',
      publishedAt: new Date().toISOString()
    };
    */
    const publishData = {
      ...formData,
      // Convert date fields to ISO strings
      date: formData.date ? new Date(formData.date).toISOString() : null,
      startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
      endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      // Parse numeric fields
      duration: parseInt(formData.duration),
      maxAttempts: parseInt(formData.maxAttempts),
      passingScore: parseFloat(formData.passingScore),
      // Set publishing fields
      isPublished: true,
      state: 'PUBLISHED',
      publishedAt: new Date().toISOString()
    };

    
    const response = await axios.put(
      `http://localhost:5000/exam/${examId}`,
      publishData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(response)
    
    setSuccess("Exam published successfully!");
    setFormData(prev => ({ ...prev, isPublished: true, state: 'PUBLISHED' }));
    
    setTimeout(() => navigate(`/exam/${examId}`), 1500);
  } catch (err) {
    console.error("Publish error:", err);
    setError(err.response?.data?.message || 'Failed to publish exam');
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
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          {!formData.isPublished && (
            <button
              onClick={handlePublishExam}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Publish Exam
            </button>
          )}
        </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Course*</label>
            <select
              name="courseId"
              value={formData.courseId || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Password*</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              placeholder="Password for students to access exam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border rounded"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded"
              placeholder="Exam description for students"
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

        {/* Proctoring Settings */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Proctoring Settings (JSON)</label>
          <textarea
            value={proctoringSettingsJson}
            onChange={handleProctoringSettingsChange}
            rows="6"
            className="w-full p-2 border rounded font-mono text-sm"
            placeholder='{"requireWebcam": true, "screenMonitoring": true, "fullScreenRequired": true}'
          />
          <p className="text-sm text-gray-500 mt-1">
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
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
            Publish Exam (students can see and access it)
          </label>
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

export default EditExamPage;