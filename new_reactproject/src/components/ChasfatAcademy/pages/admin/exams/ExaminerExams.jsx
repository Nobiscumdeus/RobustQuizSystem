import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
//import { useCurrentUser } from "@/hooks/useAuth";
import { useExaminerExams, useDeleteExam } from "@/hooks/useExam";

const ExaminerExams = () => {
  const { darkMode } = useTheme();
  //const { isAuthenticated } = useCurrentUser();
  
  // Use our custom hooks
  const { 
    exams, 
    isLoading, 
    error: fetchError,
    refetch 
  } = useExaminerExams();
  
  const { 
    deleteExam: handleDeleteExam, 
    isLoading: deleteLoading 
  } = useDeleteExam();

  // Action handlers
  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      const result = await handleDeleteExam(examId);
      if (result.success) {
        refetch(); // Refresh the list
      } else {
        // You could show a toast error here if needed
        console.error(result.error);
      }
    }
  };

  const showProctoringControls = (examId) => {
    console.log("Show proctoring for exam:", examId);
  };

  const exportResults = (examId) => {
    console.log("Export results for exam:", examId);
  };

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
          Loading exams...
        </span>
      </div>
    );
  }

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
                Exam Title
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Course
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Date
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
                Participants
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
            {exams.length > 0 ? (
              exams.map((exam) => (
                <tr
                  key={exam.id}
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
                      {exam.title}
                    </div>
                    {exam.description && (
                      <div 
                        className="text-xs"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        {exam.description.substring(0, 50)}
                        {exam.description.length > 50 ? "..." : ""}
                      </div>
                    )}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    {exam.course?.title || "nil"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div style={{ color: 'rgb(var(--color-text-primary))' }}>
                      {new Date(exam.date).toLocaleDateString()}
                    </div>
                    {exam.startTime && exam.endTime && (
                      <div 
                        className="text-xs"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        {new Date(exam.startTime).toLocaleTimeString()} -{" "}
                        {new Date(exam.endTime).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: exam.status === "scheduled"
                          ? 'rgba(245, 158, 11, 0.2)'
                          : exam.status === "in-progress"
                          ? 'rgba(52, 211, 153, 0.2)'
                          : 'rgba(59, 130, 246, 0.2)',
                        color: exam.status === "scheduled"
                          ? 'rgb(245, 158, 11)'
                          : exam.status === "in-progress"
                          ? 'rgb(52, 211, 153)'
                          : 'rgb(59, 130, 246)'
                      }}
                    >
                      {exam.status === "scheduled"
                        ? "Scheduled"
                        : exam.status === "in-progress"
                        ? "In Progress"
                        : "Completed"}
                    </span>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    {exam.enrolled > 0
                      ? exam.status === "in-progress"
                        ? `${exam.active || 0}/${exam.enrolled} (${Math.round(
                            ((exam.active || 0) / exam.enrolled) * 100
                          )}% active)`
                        : exam.status === "completed"
                        ? `${exam.submitted || 0}/${
                            exam.enrolled
                          } (${Math.round(
                            ((exam.submitted || 0) / exam.enrolled) * 100
                          )}% submitted)`
                        : `${exam.enrolled} enrolled`
                      : "No participants yet"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        to={`/exam/${exam.id}`}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: 'rgb(var(--color-primary))',
                          color: 'white'
                        }}
                      >
                        View
                      </Link>
                      <Link
                        to={`/exam/${exam.id}/edit`}
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
                        onClick={() => handleDelete(exam.id)}
                        disabled={deleteLoading}
                        className="px-3 py-1 rounded-md text-sm disabled:opacity-50"
                        style={{
                          backgroundColor: 'rgb(var(--color-error))',
                          color: 'white'
                        }}
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                      </button>
                      {exam.status === "in-progress" && (
                        <button
                          onClick={() => showProctoringControls(exam.id)}
                          className="px-3 py-1 rounded-md text-sm"
                          style={{
                            backgroundColor: 'rgb(var(--color-success))',
                            color: 'white'
                          }}
                        >
                          Proctor
                        </button>
                      )}
                      {exam.status === "completed" && (
                        <button
                          onClick={() => exportResults(exam.id)}
                          className="px-3 py-1 rounded-md text-sm"
                          style={{
                            backgroundColor: 'rgb(168, 85, 247)',
                            color: 'white'
                          }}
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
                <td 
                  colSpan="6" 
                  className="px-6 py-12 text-center"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                  <div className="mb-2">No exams found</div>
                  <Link 
                    to="/exam/create" 
                    className="inline-block px-4 py-2 rounded mt-2"
                    style={{
                      backgroundColor: 'rgb(var(--color-primary))',
                      color: 'white'
                    }}
                  >
                    Create Your First Exam
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

export default ExaminerExams;
/*
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
//import { useSelector } from "react-redux";
import { useTheme } from "@/hooks/useTheme";

const ExaminerExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const { darkMode } = useTheme()

  



  // Fetch exams by examiner
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const decodedToken = jwtDecode(token);
        const examinerId = decodedToken.userId;

        const response = await axios.get(
          `http://localhost:5000/exams/${examinerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Calculate status for each exam
        const examsWithStatus = response.data.exams.map((exam) => {
          const now = new Date();
          const startTime = new Date(exam.startTime || exam.date);
          const endTime = new Date(
            exam.endTime ||
              new Date(startTime.getTime() + exam.duration * 60000)
          );

          let status = "scheduled";
          if (now > startTime && now < endTime) status = "in-progress";
          if (now > endTime) status = "completed";

          return { ...exam, status };
        });

        setExams(examsWithStatus);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [token]);

  // Action handlers
  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await axios.delete(`http://localhost:5000/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(exams.filter((exam) => exam.id !== examId));
      } catch (err) {
        setError("Failed to delete exam");
      }
    }
  };

  const showProctoringControls = (examId) => {
    // Implement proctoring controls
    console.log("Show proctoring for exam:", examId);
  };

  const exportResults = (examId) => {
    // Implement export functionality
    console.log("Export results for exam:", examId);
  };

  if (loading) return <div className="text-center py-8">Loading exams...</div>;
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
                Exam Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Participants
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
            {exams.length > 0 ? (
              exams.map((exam) => (
                <tr
                  key={exam.id}
                  className={
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{exam.title}</div>
                    {exam.description && (
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {exam.description.substring(0, 50)}
                        {exam.description.length > 50 ? "..." : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {exam.course?.title || "nil"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(exam.date).toLocaleDateString()}
                    {exam.startTime && exam.endTime && (
                      <div className="text-xs text-gray-500">
                        {new Date(exam.startTime).toLocaleTimeString()} -{" "}
                        {new Date(exam.endTime).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        exam.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : exam.status === "in-progress"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {exam.status === "scheduled"
                        ? "Scheduled"
                        : exam.status === "in-progress"
                        ? "In Progress"
                        : "Completed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {exam.enrolled > 0
                      ? exam.status === "in-progress"
                        ? `${exam.active || 0}/${exam.enrolled} (${Math.round(
                            ((exam.active || 0) / exam.enrolled) * 100
                          )}% active)`
                        : exam.status === "completed"
                        ? `${exam.submitted || 0}/${
                            exam.enrolled
                          } (${Math.round(
                            ((exam.submitted || 0) / exam.enrolled) * 100
                          )}% submitted)`
                        : `${exam.enrolled} enrolled`
                      : "No participants yet"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        to={`/exam/${exam.id}`}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white text-sm`}
                      >
                        View
                      </Link>
                      <Link
                        to={`/exam/${exam.id}/edit`}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-700"
                            : "bg-gray-200 hover:bg-gray-300"
                        } text-sm`}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className={`px-3 py-1 rounded-md ${
                          darkMode
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white text-sm`}
                      >
                        Delete
                      </button>
                      {exam.status === "in-progress" && (
                        <button
                          onClick={() => showProctoringControls(exam.id)}
                          className={`px-3 py-1 rounded-md ${
                            darkMode
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white text-sm`}
                        >
                          Proctor
                        </button>
                      )}
                      {exam.status === "completed" && (
                        <button
                          onClick={() => exportResults(exam.id)}
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
                <td colSpan="6" className="px-6 py-4 text-center">
                  No exams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExaminerExams;
*/
