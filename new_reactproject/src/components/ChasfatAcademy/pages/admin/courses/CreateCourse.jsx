
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';
import { useCreateCourseMutation } from '@api/courseApi';
import { useTheme } from '@/hooks/useTheme';

const CreateCourse = () => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  
  // Use hooks for auth and theme
  const { user, isLoading: authLoading } = useCurrentUser();
  const { darkMode } = useTheme();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Please login to create a course');
      return;
    }

    try {
      await createCourse({
        title,
        code,
        description,
        examinerId: user.id, // Get examinerId from current user
      }).unwrap();

      toast.success('Course created successfully');
      
      // Reset form
      setTitle('');
      setCode('');
      setDescription('');
    } catch (err) {
      console.error('Error creating course:', err);
      toast.error(err?.data?.message || 'Failed to create course');
    }
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className={`max-w-3xl mx-auto p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Create a New Course
          </h2>
          <Link 
            to="/admin_panel" 
            className={`px-4 py-2 rounded-md ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors`}
          >
            Back to Courses
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label 
              htmlFor="title" 
              className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Course Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course Title"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
              required
            />
          </div>

          <div className="mb-6">
            <label 
              htmlFor="code" 
              className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Course Code (Optional)
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Course Code"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
            />
          </div>

          <div className="mb-6">
            <label 
              htmlFor="description" 
              className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Course Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course Description"
              rows="4"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? 'Creating Course...' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;

/*
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';  // Using jwt-decode correctly for decoding JWT
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';



const CreateCourse = () => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [examinerId, setExaminerId] = useState(''); // examinerId will be set from the logged-in user's data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');




  // Get examinerId from the JWT token when the component mounts
  useEffect(() => {
    const userToken = localStorage.getItem('token'); // Get token from localStorage
    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken); // Decode the JWT to extract user info
        setExaminerId(decodedToken.userId); // Extract userId from decoded token
      } catch (err) {
        console.error('Error decoding the token:', err);
        setError('Failed to decode the token');
      }
    }
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      const userToken = localStorage.getItem('token');

      //Check if token exists 
      if(!userToken){
        throw new Error('Authentication token not found');
      }

     

      const response = await axios.post('http://localhost:5000/courses', {
        title,
        code,
        description,
        examinerId, // Send examinerId with the request
      },
   {
    headers:{
       'Authorization': `Bearer ${userToken}`
    }
   }
      
    );



      // Handle success: notify the user and reset the form
    toast.success('Course created successfully ')
      console.log(response.data); // Log the created course response for debugging
      setTitle('');
      setCode('');
      setDescription('');
    } catch (err) {
      toast.error('Failed to create course'); // Show error message if the request fails
      console.error(err); // Log error details for debugging
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Create a New Course</h2>
      <Link to="/admin_panel" className="text-blue-600 hover:underline mb-6 inline-block">Back to Courses</Link>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="mb-3 block text-sm font-medium text-gray-700">Course Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course Title"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="code" className="mb-3 block text-sm font-medium text-gray-700">Course Code (Optional)</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Course Code"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="mb-3block text-sm font-medium text-gray-700">Course Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Course Description"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit" 
          className="w-full py-3 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          disabled={loading}>
          {loading ? 'Creating Course...' : 'Create Course'}
        </button>
      </form>

      {error && <div className="mt-4 text-red-600 text-center">{error}</div>} 
    </div>
  );
};

export default CreateCourse;

*/
