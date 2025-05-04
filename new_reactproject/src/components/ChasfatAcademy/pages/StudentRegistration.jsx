import  { useState } from 'react';
import axios from 'axios';
import ScrollDownIcon from '../utility/ScrollDownIcon';
import { AnimatePresence } from 'framer-motion';
const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    matricNo: '',
    firstName: '',
    lastName: '',
    examinerId: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous error or success messages
    setError(null);
    setSuccess(null);

    // Simple validation for Matriculation Number (4-10 digits)
    if (!/^\d{4,10}$/.test(formData.matricNo)) {
      setError('Matriculation Number should be between 4 and 10 digits.');
      return;
    }

    try {
      setLoading(true); // Show loading state
      const response = await axios.post('http://localhost:5000/api/students', formData);
      console.log(response)
      setSuccess('Student registered successfully!');
      setFormData({
        matricNo: '',
        firstName: '',
        lastName: '',
        examinerId: '',
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <AnimatePresence>
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg mb-4">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Register a New Student
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Matriculation Number */}
          <div>
            <label
              htmlFor="matricNo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Matriculation Number
            </label>
            <input
              type="text"
              name="matricNo"
              id="matricNo"
              value={formData.matricNo}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Examiner ID */}
          <div>
            <label
              htmlFor="examinerId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Examiner ID
            </label>
            <input
              type="number"
              name="examinerId"
              id="examinerId"
              value={formData.examinerId}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
        </form>
      </div>
      <ScrollDownIcon />
    </div>
    </AnimatePresence>
  );
};

export default StudentRegistration;
