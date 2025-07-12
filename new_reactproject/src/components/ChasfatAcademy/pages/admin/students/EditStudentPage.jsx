// EditStudentPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';



const EditStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    firstName: '',
    lastName: '',
    matricNo: '',
    email: '',
    phone: '',
    department: '',
    level: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');



  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/student/${studentId}/edit`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data?.student) {
          setStudent({
            firstName: response.data.student.firstName || '',
            lastName: response.data.student.lastName || '',
            matricNo: response.data.student.matricNo || '',
            email: response.data.student.email || '',
            phone: response.data.student.phone || '',
            department: response.data.student.department || '',
            level: response.data.student.level || '',
            isActive: response.data.student.isActive !== false
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student data');
        console.error('Load Error:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare payload
      const payload = {
        firstName: student.firstName,
        lastName: student.lastName,
        matricNo: student.matricNo,
        email: student.email || null,
        phone: student.phone || null,
        department: student.department || null,
        level: student.level || null,
        isActive: student.isActive
      };
  
      console.log('Sending payload:', payload);
  
      const response = await axios.put(
        `http://localhost:5000/student/${studentId}`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Update successful:', response.data);
      navigate(`/student/${studentId}`);
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

  if (loading) return <div className="text-center p-4">Loading student data...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Student</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* First Name */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
            <input
              type="text"
              name="firstName"
              value={student.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Last Name */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
            <input
              type="text"
              name="lastName"
              value={student.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Matric Number */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number*</label>
            <input
              type="text"
              name="matricNo"
              value={student.matricNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Email */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={student.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Phone */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={student.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Department */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={student.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Level */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <input
              type="text"
              name="level"
              value={student.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Active Status */}
          <div className="form-group flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={student.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Active Student</label>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/student/${studentId}`)}
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

export default EditStudentPage;