import { useState } from "react";
import { toast } from "react-toastify";
import { useRegisterStudents } from "@hooks/useStudent";

const RegisterStudentsForm = () => {
  const [students, setStudents] = useState([{ matricNo: "", firstName: "", lastName: "" }]);
  const [examId, setExamId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState(null);
  const { registerStudents, isLoading: isRegistering } = useRegisterStudents();

  const handleStudentChange = (index, event) => {
    const values = [...students];
    values[index][event.target.name] = event.target.value;
    setStudents(values);
  };

  const addStudent = () => {
    setStudents([...students, { matricNo: "", firstName: "", lastName: "" }]);
  };

  const removeStudent = (index) => {
    const updatedStudents = [...students];
    updatedStudents.splice(index, 1);
    setStudents(updatedStudents);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!examId || !courseId || students.some(student => !student.matricNo || !student.firstName || !student.lastName)) {
      setError("Please make sure all fields are filled out.");
      return;
    }

    setError(null);

    const requestPayload = {
      students,
      courseId,
      examId: parseInt(examId, 10),
    };

    try {
      const result = await registerStudents(requestPayload);
      
      if (result.success) {
        toast.success(result.data?.message || "Students registered successfully!");
        setStudents([{ matricNo: "", firstName: "", lastName: "" }]);
        setExamId("");
        setCourseId("");
      } else {
        setError(result.error);
        toast.warning(result.error || "Please ensure to set up course(s) and exam(s) before registering students");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = "An unexpected error occurred while registering students";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg bg-surface-elevated dark:bg-gray-800 border border-border dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-text-primary dark:text-gray-100 mb-6">
        Register Students for Exam
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam and Course Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="examId" className="block text-sm font-medium text-text-secondary dark:text-gray-300">
              Exam ID
            </label>
            <input
              type="text"
              id="examId"
              name="examId"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              placeholder="Enter Exam ID"
              className="w-full p-3 border border-border dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="courseId" className="block text-sm font-medium text-text-secondary dark:text-gray-300">
              Course ID
            </label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Enter Course ID"
              className="w-full p-3 border border-border dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* Students Input */}
        <div className="space-y-4">
          {students.map((student, index) => (
            <div 
              key={index} 
              className="border border-border dark:border-gray-700 p-4 rounded-lg 
                       bg-gray-50 dark:bg-gray-800/50 
                       hover:bg-gray-100 dark:hover:bg-gray-800/70
                       transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-border dark:border-gray-700">
                <h3 className="text-lg font-medium text-text-primary dark:text-gray-200">
                  Student {index + 1}
                </h3>
                {students.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStudent(index)}
                    className="px-3 py-1 text-sm rounded-md 
                             bg-red-100 dark:bg-red-900/30 
                             text-red-600 dark:text-red-400
                             hover:bg-red-200 dark:hover:bg-red-900/50
                             transition-colors duration-200"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor={`matricNo-${index}`} className="block text-sm font-medium text-text-secondary dark:text-gray-400">
                    Matric No
                  </label>
                  <input
                    type="text"
                    id={`matricNo-${index}`}
                    name="matricNo"
                    value={student.matricNo}
                    onChange={(e) => handleStudentChange(index, e)}
                    placeholder="Enter student's matric number"
                    className="w-full p-3 border border-border dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 
                             text-text-primary dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                             transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={`firstName-${index}`} className="block text-sm font-medium text-text-secondary dark:text-gray-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    id={`firstName-${index}`}
                    name="firstName"
                    value={student.firstName}
                    onChange={(e) => handleStudentChange(index, e)}
                    placeholder="Enter student's first name"
                    className="w-full p-3 border border-border dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 
                             text-text-primary dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                             transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={`lastName-${index}`} className="block text-sm font-medium text-text-secondary dark:text-gray-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id={`lastName-${index}`}
                    name="lastName"
                    value={student.lastName}
                    onChange={(e) => handleStudentChange(index, e)}
                    placeholder="Enter student's last name"
                    className="w-full p-3 border border-border dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 
                             text-text-primary dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                             transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add more students button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={addStudent}
            className="px-4 py-2 rounded-md border-2 border-dashed 
                     border-primary/30 dark:border-primary/50
                     text-primary dark:text-primary
                     hover:border-primary dark:hover:border-primary
                     hover:bg-primary/5 dark:hover:bg-primary/10
                     transition-all duration-200"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add another student
            </span>
          </button>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3 rounded-md font-medium
                     bg-primary dark:bg-primary
                     text-white
                     hover:bg-primary-hover dark:hover:bg-primary-hover
                     focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                     dark:focus:ring-offset-gray-800
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          >
            {isRegistering ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Register Students"
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterStudentsForm;
/*
import { useState} from "react";
//import axios from "axios";
import { toast } from "react-toastify";
import { useRegisterStudents } from "@hooks/useStudent";



const RegisterStudentsForm = () => {
  const [students, setStudents] = useState([{ matricNo: "", firstName: "", lastName: "" }]);
  const [examId, setExamId] = useState("");  // Exam ID for which students are being registered
  const [courseId, setCourseId] = useState(""); // Course ID for the students
 // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    const { registerStudents, isLoading: isRegistering } = useRegisterStudents();




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

    // Validate the form data before submitting
    if (!examId || !courseId || students.some(student => !student.matricNo || !student.firstName || !student.lastName)) {
      setError("Please make sure all fields are filled out.");
      return;
    }

    setError(null);

    // Create the payload for the request
    const requestPayload = {
      students,
      courseId,
      examId: parseInt(examId, 10),  // Ensure that examId is sent as an integer
    };

    console.log("Request Payload: ", requestPayload);

    try {
      // Use the custom hook
      const result = await registerStudents(requestPayload);
      
      if (result.success) {
        toast.success(result.data?.message || "Students registered successfully!");
        
        // Clear form fields after successful submission
        setStudents([{ matricNo: "", firstName: "", lastName: "" }]);
        setExamId("");
        setCourseId("");
      } else {
        setError(result.error);
        toast.warning(result.error || "Please ensure to set up course(s) and exam(s) before registering students");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = "An unexpected error occurred while registering students";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mt-10 mx-auto p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register Students for Exam</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
  
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

        <div className="flex justify-start">
          <button
            type="button"
            onClick={addStudent}
            className="text-blue-600 font-medium"
          >
            + Add another student
          </button>
        </div>

   
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isRegistering ? "Registering..." : "Register Students"}
        </button>

       
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </div>
  );
};

export default RegisterStudentsForm;

*/