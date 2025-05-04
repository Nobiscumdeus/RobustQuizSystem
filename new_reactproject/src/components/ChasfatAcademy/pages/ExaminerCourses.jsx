import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

const ExaminerCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  // Fetch courses by instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const decodedToken = jwtDecode(token);
        const instructorId = decodedToken.userId;

        const response = await axios.get(
          `http://localhost:5000/courses/${instructorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Calculate status for each course (active/archived based on current date)
        const coursesWithStatus = response.data.courses.map((course) => {
          const now = new Date();
        //  const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();
          
          // Assuming courses have a semester/year structure
          let status = "active";
          if (course.semester === "Fall" && currentMonth > 11) status = "archived";
          if (course.semester === "Spring" && currentMonth > 5) status = "archived";
          if (course.semester === "Summer" && currentMonth > 8) status = "archived";
          
          return { ...course, status };
        });

        setCourses(coursesWithStatus);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  // Action handlers
  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This will also delete all associated exams.")) {
      try {
        await axios.delete(`http://localhost:5000/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(courses.filter((course) => course.id !== courseId));
      } catch (err) {
        setError("Failed to delete course");
      }
    }
  };

  const exportStudentList = (courseId) => {
    // Implement export functionality
    console.log("Export student list for course:", courseId);
  };

  if (loading) return <div className="text-center py-8">Loading courses...</div>;
  if (error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-4`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Course Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Exams
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
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr
                  key={course.id}
                  className={
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{course.title}</div>
                    {course.description && (
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {course.description.substring(0, 50)}
                        {course.description.length > 50 ? "..." : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.code || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.semester} {course.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        course.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.status === "active" ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.enrolledStudents > 0
                      ? `${course.enrolledStudents} enrolled`
                      : "No students yet"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.examCount > 0
                      ? `${course.examCount} exams`
                      : "No exams yet"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        to={`/courses/${course.id}`}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white text-sm`}
                      >
                        View
                      </Link>
                      <Link
                        to={`/courses/${course.id}/edit`}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-700"
                            : "bg-gray-200 hover:bg-gray-300"
                        } text-sm`}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white text-sm`}
                      >
                        Delete
                      </button>
                      {course.enrolledStudents > 0 && (
                        <button
                          onClick={() => exportStudentList(course.id)}
                          className={`px-3 py-1 rounded-md ${
                            darkMode
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "bg-purple-500 hover:bg-purple-600"
                          } text-white text-sm`}
                        >
                          Export
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExaminerCourses;