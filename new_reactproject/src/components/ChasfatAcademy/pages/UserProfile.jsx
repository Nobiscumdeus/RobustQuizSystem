import { useEffect, useState } from "react";
import axios from "axios";
import ScrollDownIcon from "../utility/ScrollDownIcon";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token"); // Get token from local storage

      try {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        });
        setUserData(response.data); // Store fetched data in state
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

 
  const handleDelete = async (type, id) => {
    const token = localStorage.getItem("token");
  
    try {
      let response;
      if (type === "exam") {
        response = await axios.delete(`http://localhost:5000/profile/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Only update state if API deletion succeeds
        if (response.status === 200) {
          setUserData(prev => ({
            ...prev,
            exams: prev.exams.filter(exam => exam.id !== id)
          }));
          alert("Exam deleted successfully!");
        }
      } 
      else if (type === "course") {
        response = await axios.delete(`http://localhost:5000/profile/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setUserData(prev => ({
            ...prev,
            courses: prev.courses.filter(course => course.id !== id)
          }));
          //alert("Course deleted successfully!");
        }
      } 
      else if (type === "student") {
        response = await axios.delete(`http://localhost:5000/profile/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setUserData(prev => ({
            ...prev,
            students: prev.students.filter(student => student.id !== id)
          }));
          //alert("Student deleted successfully!");
        }
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      alert(`Failed to delete ${type}`);
    }
  };
  // Handle edit exam, course, or student
  const handleEdit = (type, id) => {
    // Here, you'd typically redirect to an edit page or open a modal for editing
    console.log(`Editing ${type} with ID: ${id}`);
    // You can implement the editing functionality here
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Students Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Students</h3>
        {userData.students && userData.students.length > 0 ? (
          <table className="min-w-full table-auto text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Matric No</th>
                <th className="px-4 py-2 border">First Name</th>
                <th className="px-4 py-2 border">Last Name</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.students.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="px-4 py-2">{student.matricNo}</td>
                  <td className="px-4 py-2">{student.firstName}</td>
                  <td className="px-4 py-2">{student.lastName}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit("student", student.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("student", student.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No students found...</p>
        )}
      </div>

      {/* Exams Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Exams</h3>
        {userData.exams && userData.exams.length > 0 ? (
          <table className="min-w-full table-auto text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Duration</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.exams.map((exam) => (
                <tr key={exam.id} className="border-t">
                  <td className="px-4 py-2">{exam.title}</td>
                  <td className="px-4 py-2">{new Date(exam.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{exam.duration} minutes</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit("exam", exam.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("exam", exam.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No exams found</p>
        )}
      </div>

      {/* Courses Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Courses</h3>
        {userData.courses && userData.courses.length > 0 ? (
          <table className="min-w-full table-auto text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Course Title</th>
                <th className="px-4 py-2 border">Course Code</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.courses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="px-4 py-2">{course.title}</td>
                  <td className="px-4 py-2">{course.code}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit("course", course.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("course", course.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No courses found</p>
        )}
      </div>
      <ScrollDownIcon />
    </div>

  );
};

export default UserProfile;
 