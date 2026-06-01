import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useAuth";
import { useInstructorCourses, useDeleteCourse } from "@/hooks/useCourse";

const ExaminerCourses = () => {
  const { darkMode } = useTheme();
  const { user} = useCurrentUser();
  
  // ✅ Use our custom hooks
  const { 
    courses, 
    isLoading: coursesLoading, 
    error: fetchError,
    refetch 
  } = useInstructorCourses(user?.id);
  
  const { 
    deleteCourse: handleDeleteCourse, 
    isLoading: deleteLoading 
  } = useDeleteCourse();

  const onDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This will also delete all associated exams.")) {
      const result = await handleDeleteCourse(courseId);
      if (result.success) {
        toast.success('Course deleted successfully!');
        refetch(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to delete course");
      }
    }
  };

  const exportStudentList = (courseId) => {
    console.log("Export student list for course:", courseId);
    // You'll implement this based on your backend
  };

  if (coursesLoading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading courses...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 mb-4">
            {fetchError}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                    <div className="font-medium dark:text-white">{course.title}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                    {course.code || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-white">
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
                  <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                    {course.enrolledStudents > 0
                      ? `${course.enrolledStudents} enrolled`
                      : "No students yet"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-white">
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
                        } text-sm dark:text-white`}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(course.id)}
                        disabled={deleteLoading}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white text-sm disabled:opacity-50`}
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
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
                <td colSpan="7" className="px-6 py-8 text-center dark:text-white">
                  <div className="text-gray-500 dark:text-gray-400">
                    No courses found. Create your first course to get started.
                  </div>
                  <Link 
                    to="/courses/create" 
                    className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Create Course
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

export default ExaminerCourses;
