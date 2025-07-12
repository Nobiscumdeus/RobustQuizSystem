import { useState} from "react";
import axios from "axios";
import { toast } from "react-toastify";



const RegisterStudentsForm = () => {
  const [students, setStudents] = useState([{ matricNo: "", firstName: "", lastName: "" }]);
  const [examId, setExamId] = useState("");  // Exam ID for which students are being registered
  const [courseId, setCourseId] = useState(""); // Course ID for the students
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);




  // Handle input change for students
  const handleStudentChange = (index, event) => {
    const values = [...students];
    values[index][event.target.name] = event.target.value;
    setStudents(values);
  };

  // Add more student input fields
  const addStudent = () => {
    setStudents([...students, { matricNo: "", firstName: "", lastName: "" }]);
  };

  // Remove a student input field
  const removeStudent = (index) => {
    const updatedStudents = [...students];
    updatedStudents.splice(index, 1); // Remove the student at the specified index
    setStudents(updatedStudents);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');  // Retrieve the token from localStorage

    console.log('JWT token sent: ', token);

    // Validate the form data before submitting
    if (!examId || !courseId || students.some(student => !student.matricNo || !student.firstName || !student.lastName)) {
      setError("Please make sure all fields are filled out.");
      return;
    }

    setLoading(true);
    setError(null);

    // Create the payload for the request
    const requestPayload = {
      students,
      courseId,
      examId: parseInt(examId, 10),  // Ensure that examId is sent as an integer
    };

    console.log("Request Payload: ", requestPayload);  // Log the data being sent

    try {
      // Make API call to register students
      const response = await axios.post(
        "http://localhost:5000/student-register", 
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Send token in authorization header
          }
        }
      );

      alert(response.data.message);  // Alert success message
      setLoading(false);
      console.log(response.data);

      // Clear form fields after successful submission
      setStudents([{ matricNo: "", firstName: "", lastName: "" }]); // Reset to one empty student
      setExamId(""); // Clear examId
      setCourseId(""); // Clear courseId
    } catch (error) {
      console.error(error);
      setError("An error occurred while registering students");
      toast.warning("Please ensure to set up course(s) and exam(s) before registering students ")
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mt-10 mx-auto p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register Students for Exam</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam and Course Selection */}
        <div className="space-y-2">
          <label htmlFor="examId" className="block text-sm font-medium text-gray-700">Exam ID</label>
          <input
            type="text"
            id="examId"
            name="examId"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            placeholder="Enter Exam ID"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course ID</label>
          <input
            type="text"
            id="courseId"
            name="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Enter Course ID"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Students Input */}
        {students.map((student, index) => (
          <div key={index} className="border p-4 rounded-lg bg-gray-50 space-y-4">
            <div className="space-y-2">
              <label htmlFor={`matricNo-${index}`} className="block text-sm font-medium text-gray-700">Matric No</label>
              <input
                type="text"
                id={`matricNo-${index}`}
                name="matricNo"
                value={student.matricNo}
                onChange={(e) => handleStudentChange(index, e)}
                placeholder="Enter student's matric number"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`firstName-${index}`} className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id={`firstName-${index}`}
                name="firstName"
                value={student.firstName}
                onChange={(e) => handleStudentChange(index, e)}
                placeholder="Enter student's first name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`lastName-${index}`} className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id={`lastName-${index}`}
                name="lastName"
                value={student.lastName}
                onChange={(e) => handleStudentChange(index, e)}
                placeholder="Enter student's last name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Student {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeStudent(index)}
                className="bg-red-200 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add more students */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={addStudent}
            className="text-blue-600 font-medium"
          >
            + Add another student
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? "Registering..." : "Register Students"}
        </button>

        {/* Error message */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </div>
  );
};

export default RegisterStudentsForm;