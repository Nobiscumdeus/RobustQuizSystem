
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "@/hooks/useTheme";
//import { useCurrentUser } from "@/hooks/useAuth";
import { useExaminerStudents, useDeleteStudent } from "@hooks/useStudent";

const ExaminerStudents = () => {
  const { darkMode } = useTheme();
  //const { isAuthenticated } = useCurrentUser();
  
  // Use our custom hooks
  const { 
    students, 
    isLoading, 
    error: fetchError,
    refetch 
  } = useExaminerStudents();
  
  const { 
    deleteStudent: handleDeleteStudent, 
    isLoading: deleteLoading 
  } = useDeleteStudent();

  // Handle delete action
  const handleDelete = async (studentId, studentName) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${studentName}? This will also delete all associated records.`
      )
    ) {
      const result = await handleDeleteStudent(studentId);
      if (result.success) {
        toast.success("Student deleted successfully!");
        refetch(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to delete student");
      }
    }
  };

  const exportStudentData = (studentId) => {
    console.log("Export data for student:", studentId);
    toast.info("Export feature coming soon!");
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-md p-8 flex justify-center items-center h-64`}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgb(var(--color-primary))' }}
        ></div>
        <span 
          className="ml-3"
          style={{ color: darkMode ? 'rgb(var(--color-text-secondary))' : 'rgb(var(--color-text-primary))' }}
        >
          Loading students...
        </span>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div 
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-md p-8 text-center`}
      >
        <div 
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))'
          }}
        >
          {fetchError}
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'white'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-4`}
      style={{
        backgroundColor: darkMode 
          ? 'rgb(var(--color-background))' 
          : 'rgb(var(--color-surface-elevated))',
        color: darkMode 
          ? 'rgb(var(--color-text-primary))' 
          : 'rgb(var(--color-text-primary))'
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <Link
          to="/student/create"
          className="px-4 py-2 rounded-lg transition"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'white'
          }}
        >
          Add New Student
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <thead 
            style={{
              backgroundColor: darkMode 
                ? 'rgb(var(--color-surface-elevated))' 
                : 'rgb(var(--color-background))'
            }}
          >
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Student Name
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Matric No
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Department
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Level
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Courses
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
            {students.length > 0 ? (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:opacity-90"
                  style={{
                    backgroundColor: darkMode 
                      ? 'rgb(var(--color-background))' 
                      : 'rgb(var(--color-surface-elevated))'
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="font-medium"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      {student.fullName}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      {student.email || "No email"}
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    {student.matricNo}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    {student.department || "N/A"}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    {student.level || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: student.status === "active"
                          ? 'rgba(52, 211, 153, 0.2)'
                          : 'rgba(75, 85, 99, 0.2)',
                        color: student.status === "active"
                          ? 'rgb(52, 211, 153)'
                          : 'rgb(156, 163, 175)'
                      }}
                    >
                      {student.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    {student._count?.courseStudents || 0} enrolled
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        to={`/student/${student.id}`}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: 'rgb(var(--color-primary))',
                          color: 'white'
                        }}
                      >
                        View
                      </Link>
                      <Link
                        to={`/student/${student.id}/edit`}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: darkMode 
                            ? 'rgb(var(--color-surface-elevated))' 
                            : 'rgb(var(--color-background))',
                          color: 'rgb(var(--color-text-primary))',
                          border: `1px solid rgb(var(--color-border))`
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id, student.fullName)}
                        disabled={deleteLoading}
                        className="px-3 py-1 rounded-md text-sm disabled:opacity-50"
                        style={{
                          backgroundColor: 'rgb(var(--color-error))',
                          color: 'white'
                        }}
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        onClick={() => exportStudentData(student.id)}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: 'rgb(168, 85, 247)',
                          color: 'white'
                        }}
                      >
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan="7" 
                  className="px-6 py-12 text-center"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                  <div className="mb-2">No students found</div>
                  <Link 
                    to="/student/create" 
                    className="inline-block px-4 py-2 rounded mt-2"
                    style={{
                      backgroundColor: 'rgb(var(--color-primary))',
                      color: 'white'
                    }}
                  >
                    Add Your First Student
                  </Link>
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

/*
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
//import { useSelector } from "react-redux";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "react-toastify";

const ExaminerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const { darkMode } = useTheme();
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
          const lastActiveDate = student.lastActive
            ? new Date(student.lastActive)
            : null;
          const now = new Date();
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

          let status = "active";
          if (!student.isActive) status = "inactive";
          else if (lastActiveDate && lastActiveDate < thirtyDaysAgo)
            status = "inactive";

          return {
            ...student,
            status,
            fullName: `${student.firstName} ${student.lastName}`,
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
    if (
      window.confirm(
        "Are you sure you want to delete this student? This will also delete all associated records."
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Student deleted succesfully ");
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

  if (loading)
    return <div className="text-center py-8">Loading students...</div>;
  if (error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-4`}
    >
      <div className="flex justify-between items-center mb-4">
        <div></div>
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
                    {student._count?.courseStudents || 0} enrolled{" "}
                  
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

*/
