import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';  // Using jwt-decode correctly for decoding JWT
import { toast } from 'react-toastify';
import { isAuthenticated } from '../../../utility/auth';
import { useNavigate, useLocation } from 'react-router-dom';


const CreateCourse = () => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [examinerId, setExaminerId] = useState(''); // examinerId will be set from the logged-in user's data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    const navigate = useNavigate();
    const location=useLocation();
    /*
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: "/admin_panel" },
        replace: true,
      });
    }
  }, [navigate]);
  */
  useEffect(() => {
     if (!isAuthenticated()) {
       navigate("/login", {
       //  state: { from: "/admin_panel" },
       state:{from:location.pathname,message:'Session expired, please login to continue'},
         replace: true,
       });
     }
   }, [navigate,location]);


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

      {error && <div className="mt-4 text-red-600 text-center">{error}</div>} {/* Show error message if exists */}
    </div>
  );
};

export default CreateCourse;
