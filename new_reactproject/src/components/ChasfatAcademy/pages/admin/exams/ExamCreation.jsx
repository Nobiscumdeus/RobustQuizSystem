import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useCurrentUser } from "@/hooks/useAuth";
import { useExaminerCourses,  useCreateExam } from "@hooks/useExam";


const ExamCreation = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCurrentUser();

  // Use our custom hooks
  const { 
    courses, 
    isLoading: coursesLoading, 
    error: coursesError,
  //  refetch: refetchCourses 
  } = useExaminerCourses();

  const { 
    createExam, 
    isLoading: createLoading,
    error: createError 
  } = useCreateExam();

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [duration, setDuration] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(60.0);
  const [proctoringSettings, setProctoringSettings] = useState({
    webcam: false,
    screenRecording: false
  });

  const isLoading = coursesLoading || createLoading;

  // Show error if courses fail to load
  useEffect(() => {
    if (coursesError) {
      toast.error("Failed to load courses");
      toast.warning("Please ensure to register courses before setting up exams");
    }
  }, [coursesError]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to create exams");
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!courseId) {
      toast.warning("Please select a valid course.");
      return;
    }

    if (!startTime || !endTime) {
      toast.warning("Start time and end time are required");
      return;
    }

    try {
      // Prepare exam data
      const examData = {
        // Basic fields
        title: title.trim(),
        date: new Date(date).toISOString(),
        password,
        duration: Number(duration) || 60,
        examinerId: user?.id || 0,
        courseId: parseInt(courseId, 10),
        
        // Advanced fields
        description: description ? description.trim() : "",
        instructions: instructions ? instructions.trim() : "",
        isPublished: Boolean(isPublished),
        startTime: startTime ? new Date(startTime).toISOString() : null,
        endTime: endTime ? new Date(endTime).toISOString() : null,
        maxAttempts: Number(maxAttempts) || 1,
        passingScore: parseFloat(passingScore) || 60.0,
        proctoringSettings: {
          webcam: Boolean(proctoringSettings?.webcam),
          screenRecording: Boolean(proctoringSettings?.screenRecording)
        },
        state: isPublished ? 'PUBLISHED' : 'DRAFT'
      };

      // Use our hook to create exam
      const result = await createExam(examData);

      if (result.success) {
        toast.success("Exam created successfully!");
        
        // Reset form
        setTitle("");
        setDate("");
        setPassword("");
        setDuration(null);
        setCourseId("");
        setDescription("");
        setInstructions("");
        setIsPublished(false);
        setStartTime("");
        setEndTime("");
        setMaxAttempts(1);
        setPassingScore(60.0);
        setProctoringSettings({ webcam: false, screenRecording: false });

        // Navigate to the new exam or exams list
        if (result.data?.exam?.id) {
          setTimeout(() => navigate(`/exam/${result.data.exam.id}`), 1500);
        } else {
          setTimeout(() => navigate("/admin_panel"), 1500);
        }
      } else {
        toast.error(result.error || "Failed to create exam");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgb(var(--color-primary))' }}
        ></div>
        <span className="ml-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>
          Checking authentication...
        </span>
      </div>
    );
  }

  return (
    <div 
      className="mt-10 max-w-3xl mx-auto p-8 rounded-lg shadow-lg"
      style={{
        backgroundColor: 'rgb(var(--color-surface-elevated))',
        color: 'rgb(var(--color-text-primary))'
      }}
    >
      <Link 
        to="/admin_panel" 
        className="mb-6 inline-block"
        style={{ color: 'rgb(var(--color-primary))' }}
      >
        ← Back to Home
      </Link>
      
      <h2 
        className="text-2xl font-bold text-center mb-4"
        style={{ color: 'rgb(var(--color-text-primary))' }}
      >
        Create a New Exam
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Exam Title */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="mb-3 block text-sm font-medium"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Exam Title<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Exam Title"
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            required
          />
        </div>

        {/* Exam Date */}
        <div className="mb-4">
          <label
            htmlFor="date"
            className="mb-3 block text-sm font-medium"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Exam Date<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
          </label>
          <input
            type="datetime-local"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            required
          />
        </div>

        {/* Exam Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="mb-3 block text-sm font-medium"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Exam Password<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            required
            placeholder="Enter exam access password"
          />
        </div>

        {/* Exam Duration */}
        <div className="mb-4">
          <label
            htmlFor="duration"
            className="mb-3 block text-sm font-medium"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Exam Duration (minutes)<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
          </label>
          <input
            type="number"
            id="duration"
            value={duration || ''}
            onChange={(e) => {
              const value = e.target.value;
              setDuration(value === "" ? null : Number(value));
            }}
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            placeholder="Duration in minutes"
            required
            min="1"
          />
        </div>

        {/* Course Selection */}
        <div className="mb-4">
          <label
            htmlFor="courseId"
            className="mb-3 block text-sm font-medium"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Select Course<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
          </label>
          <select
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            required
            disabled={isLoading}
          >
            <option value="">Select Course</option>
            {courses.length > 0 ? (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.code})
                </option>
              ))
            ) : (
              <option value="" disabled>
                {isLoading ? "Loading courses..." : "No courses available"}
              </option>
            )}
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label 
            className="mb-3 block text-sm font-medium"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            rows="3"
            placeholder="Optional: Exam description for students"
          />
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <label 
            className="mb-3 block text-sm font-medium"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Special Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            rows="3"
            placeholder="Optional: Special instructions for students"
          />
        </div>

        {/* Exam Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Start Time<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 rounded-md"
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
              End Time<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>
        </div>

        {/* Exam Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Max Attempts
            </label>
            <input
              type="number"
              min="1"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              className="w-full p-3 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
            <p 
              className="text-xs mt-1"
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
              min="0"
              max="100"
              step="0.1"
              value={passingScore}
              onChange={(e) => setPassingScore(parseFloat(e.target.value))}
              className="w-full p-3 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
            <p 
              className="text-xs mt-1"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              Minimum percentage required to pass
            </p>
          </div>
        </div>

        {/* Publish Toggle */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
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
            Publish Exam Immediately
          </label>
        </div>

        {/* Proctoring Settings */}
        <div className="mb-4">
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Proctoring Settings
          </label>
          <div 
            className="p-4 rounded-md space-y-3"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))'
            }}
          >
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={proctoringSettings?.webcam || false}
                onChange={(e) =>
                  setProctoringSettings({
                    ...proctoringSettings,
                    webcam: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded"
                style={{
                  color: 'rgb(var(--color-primary))',
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))'
                }}
              />
              <span 
                className="ml-2 text-sm"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Require Webcam
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={proctoringSettings?.screenRecording || false}
                onChange={(e) =>
                  setProctoringSettings({
                    ...proctoringSettings,
                    screenRecording: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded"
                style={{
                  color: 'rgb(var(--color-primary))',
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))'
                }}
              />
              <span 
                className="ml-2 text-sm"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Record Screen
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 mt-4 rounded-md disabled:opacity-50"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'white'
          }}
          disabled={isLoading}
        >
          {isLoading ? "Creating Exam..." : "Create Exam"}
        </button>
      </form>

      {/* Display any create errors */}
      {createError && (
        <div 
          className="mt-4 p-3 rounded-md text-center"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))'
          }}
        >
          {createError}
        </div>
      )}
    </div>
  );
};

export default ExamCreation;

/*
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correctly use named import
import ScrollDownIcon from "../../../utility/ScrollDownIcon";
import {toast} from 'react-toastify'
import { Link } from "react-router-dom";


const ExamCreation = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [duration, setDuration] = useState(null);
  const [examinerId, setExaminerId] = useState("");
  const [courseId, setCourseId] = useState(""); // Initialize as empty string for required field
  const [courses, setCourses] = useState([]); // Ensure it's an array by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  //Updated advanced variables
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(60.0);
  const [proctoringSettings, setProctoringSettings] = useState({});

  

  // Decode JWT to get examinerId (userId)
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken); // Decode the JWT to get examinerId
        setExaminerId(decodedToken.userId);
      } catch (err) {
        console.error("Error decoding the token:", err);
       
        toast.error("Failed to decode the token")
      }
    }
  }, []);

  // Fetch courses once examinerId is available
  useEffect(() => {
   
    const fetchCourses = async () => {
      if (examinerId) {
        try {

          const userToken = localStorage.getItem('token'); // Get token from localStorage

               //Check if token exists 
      if(!userToken){
        throw new Error('Authentication token not found');
      }

     

          const response = await axios.get(
            `http://localhost:5000/courses/${examinerId}`,{
              headers:{
                  'Authorization': `Bearer ${userToken}`
              }
            }

          );
        
          setCourses(response.data.courses || []); // Ensure courses is an array even if it's empty
        } catch (err) {
         // setError("Failed to fetch courses");
          toast.error("Failed to fetch courses ");
          toast.warning("Please ensure to register courses before setting up exams")
        }
      }
    };
    fetchCourses();
  }, [examinerId]);

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");
  setSuccessMessage("");

  try {
    // Basic validation
    if (!courseId) {
      toast.warning("Please select a valid course.");
      setLoading(false);
      return;
    }

    if (!startTime || !endTime) {
      toast.warning("Start time and end time are required");
      setLoading(false);
      return;
    }

    // Convert courseId to an integer before submitting
    const formattedCourseId = parseInt(courseId, 10);
    if (isNaN(formattedCourseId)) {
      toast.warning("invalid course selection ");
     // setError("Invalid course selection.");
      setLoading(false);
      return;
    }

    // Ensure all data is properly formatted
    const examData = {
      // Basic fields
      title: title.trim(),
      date: new Date(date).toISOString(),
      password,
      duration: Number(duration) || null,
      examinerId: Number(examinerId) || 0,
      courseId: formattedCourseId,
      
      // Advanced fields - explicitly include all
      description: description ? description.trim() : "",
      instructions: instructions ? instructions.trim() : "",
      isPublished: Boolean(isPublished),
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: endTime ? new Date(endTime).toISOString() : null,
      maxAttempts: Number(maxAttempts) || 1,
      passingScore: parseFloat(passingScore) || 60.0,
      proctoringSettings: {
        webcam: Boolean(proctoringSettings?.webcam),
        screenRecording: Boolean(proctoringSettings?.screenRecording)
        // Include any other properties in proctoringSettings
      }
    };

    // Log exactly what we're sending to help debug
    console.log("Submitting exam data:", JSON.stringify(examData, null, 2));

    // Make sure to set proper Content-Type header
    const response = await axios.post(
      "http://localhost:5000/exams",
      examData,
      {
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.status === 200 || response.status === 201) {
      console.log("Success response:", response.data);
     // setSuccessMessage("Exam created successfully!");
      toast.success("Exam created successfully!")
      
      
      // Reset form fields
      setTitle("");
      setDate("");
      setPassword("");
      setDuration(null);
      setCourseId("");
      setDescription("");
      setInstructions("");
      setIsPublished(false);
      setStartTime("");
      setEndTime("");
      setMaxAttempts(1);
      setPassingScore(60.0);
      setProctoringSettings({});
    } else {
      console.error("Unexpected status:", response.status, response.data);
     // setError(`Failed to create exam. Server returned status: ${response.status}`);
     toast.error("Failed to create exam, please try again! ")
    }
  } catch (err) {
    console.error("Submission error:", err);
    
    if (err.response) {
      console.error("Error Response Data:", err.response.data);
      console.error("Error Response Status:", err.response.status);
      
      // Extract error message from response if available
      const errorMessage = err.response.data.error || 
                          err.response.data.message || 
                          "An error occurred while creating the exam.";
      
      // Show detailed error if available
      if (err.response.data.details && err.response.data.details.message) {
      //  setError(`${errorMessage}: ${err.response.data.details.message}`);
        toast.error(`${errorMessage}: ${err.response.data.details.message}`)
      } else {
     //   setError(errorMessage);
        toast.error(errorMessage)
      }
    } else if (err.request) {
      console.error("No response received:", err.request);
     // setError("No response received from server. Please check your connection.");
      toast.error("No response received from server. Please check your connection.")
    } else {
      console.error("Request setup error:", err.message);
      //setError(`Request failed: ${err.message}`);
      toast.error(`Request failed: ${err.message}`)
    }
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="mt-10 max-w-3xl mx-auto p-8 rounded-lg shadow-lg">
            <Link to="/admin_panel" className="text-blue-600 hover:underline mb-6 inline-block">Back to Home</Link>
            
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Create a New Exam
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="mb-3 block text-sm font-medium text-gray-700"
          >
            Exam Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Exam Title"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="date"
            className="mb-3 block text-sm font-medium text-gray-700"
          >
            Exam Date
          </label>
          <input
            type="datetime-local"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="mb-3 block text-sm font-medium text-gray-700"
          >
            Exam Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="duration"
            className="mb-3 block text-sm font-medium text-gray-700"
          >
            Exam Duration (in minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
          
            onChange={(e) => {
    const value = e.target.value;
    setDuration(value === "" ? null : Number(value)); // Convert to number or null
  }}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Duration in minutes"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="courseId"
            className="mb-3 block text-sm font-medium text-gray-700"
          >
            Select Course
          </label>
          <select
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)} // Allow courseId to be a string initially
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Course</option>
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No courses available
              </option>
            )}
          </select>
        </div>




  
        <div className="mb-4">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

  
        <div className="mb-4">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Special Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Attempts
            </label>
            <input
              type="number"
              min="1"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={passingScore}
              onChange={(e) => setPassingScore(parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>

    
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPublished"
            className="ml-2 block text-sm text-gray-700"
          >
            Publish Exam Immediately
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proctoring Settings
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={proctoringSettings?.webcam || false}
                onChange={(e) =>
                  setProctoringSettings({
                    ...proctoringSettings,
                    webcam: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Require Webcam</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={proctoringSettings?.screenRecording || false}
                onChange={(e) =>
                  setProctoringSettings({
                    ...proctoringSettings,
                    screenRecording: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Record Screen</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? "Creating Exam..." : "Create Exam"}
        </button>
      </form>

      {successMessage && (
        <div className="mt-4 text-green-600 text-center">{successMessage}</div>
      )}
      {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      <ScrollDownIcon />
    </div>
  );
};

export default ExamCreation;

*/
