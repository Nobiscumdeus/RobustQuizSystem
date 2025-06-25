


import  { useState, useEffect } from 'react';
import axios from 'axios';
import ScrollDownIcon from '../utility/ScrollDownIcon';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { isAuthenticated } from '../utility/auth';
import { useNavigate } from 'react-router-dom';


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

  
  
      //Authentication check
       const navigate = useNavigate();
       useEffect(() => {
         if (!isAuthenticated()) {
           navigate("/login", {
             state: { from: "/admin_panel" },
             replace: true,
           });
         }
       }, [navigate]);


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
      const token =localStorage.getItem('token');

      
      
      const response = await axios.post('http://localhost:5000/students', formData,{
        headers:{
          Authorization:`Bearer ${token}`,
         
        }
      });
      
      
    
      console.log(response)
     // setSuccess('Student registered successfully!');
      toast.success('Student registered successfully!');
      setFormData({
        matricNo: '',
        firstName: '',
        lastName: '',
        examinerId: '',
      });
    } catch (error) {
      //setError(error.response?.data?.error || 'Something went wrong');
     // toast.error(` ${error.response?.data?.error} || Something went wrong, please try again`)
     toast.error(`Something went wrong, please try again `)
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
              placeholder="e.g., 12345678"
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>



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
               placeholder="Enter first name"
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

      



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
               placeholder="Enter last name"
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>




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
              placeholder="Enter examiner ID"
                min="1"
              required
              className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>



          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </div>




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



