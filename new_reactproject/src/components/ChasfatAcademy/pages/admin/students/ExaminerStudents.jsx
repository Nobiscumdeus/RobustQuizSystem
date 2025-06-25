import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import {toast} from 'react-toastify'
import { isAuthenticated } from "../../../utility/auth";
import { useNavigate } from "react-router-dom";





const ExaminerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const darkMode = useSelector((state) => state.darkMode.darkMode);

    const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: "/admin_panel" },
        replace: true,
      });
    }
  }, [navigate]);


  // Fetch students by examiner
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const decodedToken = jwtDecode(token);
        const examinerId = decodedToken.userId;

        const response = await axios.get(
          `http://localhost:5000/students/${examinerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Add status based on last activity
        const studentsWithStatus = response.data.students.map((student) => {
          const lastActiveDate = student.lastActive ? new Date(student.lastActive) : null;
          const now = new Date();
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
          
          let status = "active";
          if (!student.isActive) status = "inactive";
          else if (lastActiveDate && lastActiveDate < thirtyDaysAgo) status = "inactive";
          
          return { 
            ...student,
            status,
            fullName: `${student.firstName} ${student.lastName}`
          };
        });

        setStudents(studentsWithStatus);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);

  // Action handlers
  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student? This will also delete all associated records.")) {
      try {
        await axios.delete(`http://localhost:5000/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Student deleted succesfully ')
        setStudents(students.filter((student) => student.id !== studentId));
      } catch (err) {
        setError("Failed to delete student");
      }
    }
  };

  const exportStudentData = (studentId) => {
    // Implement export functionality
    console.log("Export data for student:", studentId);
  };

  if (loading) return <div className="text-center py-8">Loading students...</div>;
  if (error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-4`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>

        </div>
         <Link
                    to="/student"
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white transition`}
                  >
                    Add New Student 
                  </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Matric No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Courses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              darkMode ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            {students.length > 0 ? (
              students.map((student) => (
                <tr
                  key={student.id}
                  className={
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{student.fullName}</div>
                    <div
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {student.email || "No email"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.matricNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.department || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.level || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        student.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {student.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student._count?.courses || 0} enrolled
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        to={`/student/${student.id}`}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white text-sm`}
                      >
                        View
                      </Link>
                      <Link
                        to={`/student/${student.id}/edit`}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-700"
                            : "bg-gray-200 hover:bg-gray-300"
                        } text-sm`}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white text-sm`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => exportStudentData(student.id)}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-purple-500 hover:bg-purple-600"
                        } text-white text-sm`}
                      >
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExaminerStudents;