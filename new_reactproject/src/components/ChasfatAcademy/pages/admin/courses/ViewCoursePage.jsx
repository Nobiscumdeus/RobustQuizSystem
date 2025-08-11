import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ViewCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState(null);

  // Fetch course and available students
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:5000/singlecourse/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(courseResponse.data.course);
        setStats(courseResponse.data.stats);

        // Fetch available students (not enrolled in this course)
        const studentsResponse = await axios.get(
          `http://localhost:5000/students/not-in-course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableStudents(studentsResponse.data.students);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, token]);

  // Handle adding students to course
  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/courses/${courseId}/students`,
        { studentIds: selectedStudents },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh course data
      const courseResponse = await axios.get(
        `http://localhost:5000/singlecourse/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(courseResponse.data.course);
      setStats(courseResponse.data.stats);

      // Refresh available students
      const studentsResponse = await axios.get(
        `http://localhost:5000/students/not-in-course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableStudents(studentsResponse.data.students);

      setSelectedStudents([]);
      setIsAddingStudents(false);
      setSuccessMessage(response.data.message || "Students added successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add students");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Handle removing a student from course
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this course?`)) return;

    setIsLoadingAction(true);
    try {
      const response = await axios.delete(
        `http://localhost:5000/courses/${courseId}/students/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh course data
      const courseResponse = await axios.get(
        `http://localhost:5000/singlecourse/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(courseResponse.data.course);
      setStats(courseResponse.data.stats);

      // Refresh available students
      const studentsResponse = await axios.get(
        `http://localhost:5000/students/not-in-course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableStudents(studentsResponse.data.students);

      setSuccessMessage(response.data.message || "Student removed successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove student");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Clear error or success message
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) return <div className="p-4">Loading course details...</div>;
  if (error && !course) return <div className="p-4 text-red-500">{error}</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Success/Error Messages */}
      {(error || successMessage) && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{error || successMessage}</span>
            <button onClick={clearMessages} className="text-sm font-medium">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <button
          onClick={() => navigate("/admin_panel")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Courses
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Course Information</h2>
            <p className="mb-2">
              <span className="font-medium">Code:</span> {course.code || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-medium">Day created: </span>
              {new Date(course.createdAt).toLocaleString() || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-medium">Credit Hours:</span>{" "}
              {course.creditHours}
            </p>
            <p className="mb-2">
              <span className="font-medium">Semester:</span> {course.semester}{" "}
              {course.year}
            </p>
            <p className="mb-2">
              <span className="font-medium">Status:</span>{" "}
              {course.isPublished ? "Published" : "Draft"}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="whitespace-pre-line">
              {course.description || "No description provided"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Instructor</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium">{course.examiner?.firstName || "N/A"}</p>
            <p className="text-gray-600">{course.examiner?.email || ""}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800">Total Students</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats?.totalStudents || 0}
            </p>
            <p className="text-sm text-gray-600">
              {stats?.activeStudents || 0} active
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">Total Exams</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats?.totalExams || 0}
            </p>
            <p className="text-sm text-gray-600">
              {stats?.activeExams || 0} published
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800">Questions</h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats?.totalQuestions || 0}
            </p>
            <p className="text-sm text-gray-600">
              {course?.metadata?.totalPoints || 0} pts
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800">Recent Activity</h3>
            <p className="text-2xl font-bold text-orange-600">
              {stats?.recentlyEnrolledStudents || 0}
            </p>
            <p className="text-sm text-gray-600">new students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                Students ({course._count?.courseStudents || 0})
              </h2>
              <button
                onClick={() => setIsAddingStudents(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                disabled={isLoadingAction}
              >
                Add Students
              </button>
            </div>
            {isAddingStudents && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Select Students to Add</h3>
                {availableStudents.length > 0 ? (
                  <>
                    <select
                      multiple
                      className="w-full p-2 border rounded mb-3 max-h-40"
                      value={selectedStudents}
                      onChange={(e) =>
                        setSelectedStudents(
                          Array.from(e.target.selectedOptions, (option) => option.value)
                        )
                      }
                      disabled={isLoadingAction}
                    >
                      {availableStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.matricNo})
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setIsAddingStudents(false);
                          setSelectedStudents([]);
                        }}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        disabled={isLoadingAction}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddStudents}
                        disabled={selectedStudents.length === 0 || isLoadingAction}
                        className={`px-3 py-1 rounded text-sm ${
                          selectedStudents.length === 0 || isLoadingAction
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {isLoadingAction ? "Adding..." : "Add Selected"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No available students to add</p>
                )}
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {course.courseStudents?.length > 0 ? (
                <ul className="space-y-2">
                  {course.courseStudents.map((cs) => (
                    <li
                      key={cs.student.id}
                      className="border-b pb-2 last:border-b-0 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium">
                          {cs.student.firstName} {cs.student.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {cs.student.matricNo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cs.student.department} • Level {cs.student.level}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            cs.student.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cs.student.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveStudent(
                              cs.student.id,
                              `${cs.student.firstName} ${cs.student.lastName}`
                            )
                          }
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                          disabled={isLoadingAction}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No students enrolled yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">
              Exams ({course._count?.exams || 0})
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {course.exams?.length > 0 ? (
                <ul className="space-y-2">
                  {course.exams.map((exam) => (
                    <li key={exam.id} className="border-b pb-2 last:border-b-0">
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exam.date).toLocaleDateString()} •
                        <span
                          className={`ml-1 px-2 py-1 rounded text-xs ${
                            exam.state === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : exam.state === "COMPLETED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {exam.state}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {exam._count?.students || 0} students •{" "}
                        {exam._count?.examQuestions || 0} questions
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No exams created yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Questions Bank ({stats?.totalQuestions || 0})
          </h2>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            {course.questions?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3">
                      By Type
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats?.questionsByType || {}).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm font-medium">{type}</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-3">
                      By Difficulty
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats?.questionsByDifficulty || {}).map(
                        ([diff, count]) => (
                          <div
                            key={diff}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm font-medium">{diff}</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 mb-3">
                      By Category
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats?.questionsByCategory || {}).map(
                        ([cat, count]) => (
                          <div
                            key={cat}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm font-medium">{cat}</span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Recent Questions</h3>
                  <div className="max-h-64 overflow-y-auto">
                    <ul className="space-y-4">
                      {course.questions.slice(0, 8).map((question) => (
                        <li
                          key={question.id}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-gray-900 line-clamp-2 flex-1 mr-4">
                              {question.questionText}
                            </p>
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                              {question.points} pts
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {question.questionType}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {question.difficulty || "UNSPECIFIED"}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              {question.category || "UNCATEGORIZED"}
                            </span>
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                              Used in {question._count?.examQuestions || 0} exams
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {course.questions.length > 8 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">
                          Showing 8 of {course.questions.length} questions
                        </p>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1">
                          View All Questions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">No questions created yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Questions will appear here once you add them to this course
                </p>
              </div>
            )}
          </div>
        </div>
        <p className="mb-2">
          <span className="font-medium">Last Updated:</span>{" "}
          {new Date(course.updatedAt).toLocaleString()}
        </p>
        <p className="mb-2">
          <span className="font-medium">Has Active Exams:</span>{" "}
          <span
            className={
              course.metadata?.hasActiveExams
                ? "text-green-600"
                : "text-gray-600"
            }
          >
            {course.metadata?.hasActiveExams ? "Yes" : "No"}
          </span>
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate(`/courses/${courseId}/edit`)}
            disabled={course.isPublished || isLoadingAction}
            className={`px-4 py-2 rounded ${
              course.isPublished || isLoadingAction
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCoursePage;