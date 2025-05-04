import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

const ExaminerExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const darkMode = useSelector((state) => state.darkMode.darkMode);

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
