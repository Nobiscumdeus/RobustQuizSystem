import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correctly use named import
import ScrollDownIcon from "../../utility/ChasfatAcademy/ScrollDownIcon";

const ExamCreation = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [duration, setDuration] = useState(0);
  const [examinerId, setExaminerId] = useState("");
  const [courseId, setCourseId] = useState(""); // Initialize as empty string for required field
  const [courses, setCourses] = useState([]); // Ensure it's an array by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Decode JWT to get examinerId (userId)
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken); // Decode the JWT to get examinerId
        setExaminerId(decodedToken.userId);
      } catch (err) {
        console.error("Error decoding the token:", err);
        setError("Failed to decode the token");
      }
    }
  }, []);

  // Fetch courses once examinerId is available
  useEffect(() => {
    const fetchCourses = async () => {
      if (examinerId) {
        try {
          const response = await axios.get(
            `http://localhost:5000/courses/${examinerId}`
          );
          setCourses(response.data.courses || []); // Ensure courses is an array even if it's empty
        } catch (err) {
          setError("Failed to fetch courses");
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
      if (!courseId) {
        setError("Please select a valid course.");
        return; // Prevent submission if no course is selected
      }

      // Convert courseId to an integer before submitting
      const formattedCourseId = parseInt(courseId, 10);

      // Check if the courseId is a valid integer
      if (isNaN(formattedCourseId)) {
        setError("Invalid course selection.");
        return;
      }

      // Convert the date string from the input into an ISO 8601 string
      const formattedDate = new Date(date).toISOString();

      const response = await axios.post("http://localhost:5000/exams", {
        title,
        date: formattedDate, // Pass the ISO string of the date
        password,
        duration,
        examinerId,
        courseId: formattedCourseId, // Ensure courseId is passed as a number
      });

      if (response.status === 200 || response.status ===201) {
        setSuccessMessage("Exam created successfully!");
        setTitle("");
        setDate("");
        setPassword("");
        setDuration(0); // Reset to 0 after success
        setCourseId(""); // Reset to empty after success
      } else {
        // Log the error if response is not success
        setError(`Failed to create exam. Server returned status: ${response.status}`);
        console.error("Error response:", response);
      }
    } catch (err) {
      // Log the full error object if an error occurs
      setError("Failed to create exam");
      console.error("Submission error:", err);
      if (err.response) {
        console.error("Error Response:", err.response.data);
        setError(err.response.data.message || "An error occurred while creating the exam.");
      } else {
        setError("No response from server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 max-w-3xl mx-auto p-8 rounded-lg shadow-lg">
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
            onChange={(e) => setDuration(Number(e.target.value) || 0)} // Ensure it's a number
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
