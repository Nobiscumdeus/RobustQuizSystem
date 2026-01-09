import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  useCourseWithDetails, 
  useAvailableStudents,
  useAddStudentsToCourse,
  useRemoveStudentFromCourse 
} from "@/hooks/useCourse";

const ViewCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { 
    course, 
    stats, 
    isLoading: courseLoading, 
    error: fetchError,
    refetch: refetchCourse 
  } = useCourseWithDetails(courseId);

  const { 
    students: availableStudents, 
    isLoading: studentsLoading,
    refetch: refetchAvailableStudents 
  } = useAvailableStudents(courseId);
  
  const { 
    addStudents, 
    isLoading: addingStudents 
  } = useAddStudentsToCourse();
  
  const { 
    removeStudent, 
    isLoading: removingStudent 
  } = useRemoveStudentFromCourse();

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isLoadingAction = addingStudents || removingStudent;
  const isLoading = courseLoading || studentsLoading;

  // Handle adding students to course
  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    try {
      const result = await addStudents({ 
        courseId, 
        studentIds: selectedStudents 
      });

      if (result.success) {
        // Refresh data
        refetchCourse();
        refetchAvailableStudents();
        
        setSelectedStudents([]);
        setIsAddingStudents(false);
        setSuccessMessage("Students added successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to add students");
    }
  };

  // Handle removing a student from course
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this course?`)) return;

    try {
      const result = await removeStudent({ courseId, studentId });

      if (result.success) {
        // Refresh data
        refetchCourse();
        refetchAvailableStudents();
        
        setSuccessMessage("Student removed successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to remove student");
    }
  };

  // Clear error or success message
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-text-secondary">Loading course details...</span>
      </div>
    );
  }
  
  if (fetchError && !course) {
    return (
      <div className="p-4 text-error text-center">
        <p className="mb-4">{fetchError}</p>
        <button
          onClick={() => navigate("/admin_panel")}
          className="px-4 py-2 bg-surface-elevated rounded hover:bg-opacity-80 text-text-primary"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-text-primary">Course not found</p>
        <button
          onClick={() => navigate("/admin_panel")}
          className="px-4 py-2 bg-surface-elevated rounded hover:bg-opacity-80 text-text-primary"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Success/Error Messages */}
      {(error || successMessage) && (
        <div
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: error 
              ? 'rgb(254 226 226 / var(--tw-bg-opacity))' 
              : 'rgb(220 252 231 / var(--tw-bg-opacity))',
            color: error 
              ? 'rgb(185 28 28 / var(--tw-text-opacity))' 
              : 'rgb(21 128 61 / var(--tw-text-opacity))'
          }}
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
        <h1 className="text-2xl font-bold text-text-primary">{course.title}</h1>
        <button
          onClick={() => navigate("/admin_panel")}
          className="px-4 py-2 bg-surface-elevated rounded hover:bg-opacity-80 text-text-primary"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Courses
        </button>
      </div>

      <div 
        className="rounded-lg shadow p-6"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          color: 'rgb(var(--color-text-primary))'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-text-primary">Course Information</h2>
            <p className="mb-2 text-text-secondary">
              <span className="font-medium text-text-primary">Code:</span> {course.code || "N/A"}
            </p>
            <p className="mb-2 text-text-secondary">
              <span className="font-medium text-text-primary">Day created: </span>
              {new Date(course.createdAt).toLocaleString() || "N/A"}
            </p>
            <p className="mb-2 text-text-secondary">
              <span className="font-medium text-text-primary">Credit Hours:</span>{" "}
              {course.creditHours}
            </p>
            <p className="mb-2 text-text-secondary">
              <span className="font-medium text-text-primary">Semester:</span> {course.semester}{" "}
              {course.year}
            </p>
            <p className="mb-2 text-text-secondary">
              <span className="font-medium text-text-primary">Status:</span>{" "}
              {course.isPublished ? "Published" : "Draft"}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-text-primary">Description</h2>
            <p className="whitespace-pre-line text-text-secondary">
              {course.description || "No description provided"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-text-primary">Instructor</h2>
          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              color: 'rgb(var(--color-text-secondary))'
            }}
          >
            <p className="font-medium text-text-primary">{course.examiner?.firstName || "N/A"}</p>
            <p className="text-text-secondary">{course.examiner?.email || ""}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'rgb(var(--color-text-primary))'
            }}
          >
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Total Students</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {stats?.totalStudents || 0}
            </p>
            <p className="text-sm text-text-secondary">
              {stats?.activeStudents || 0} active
            </p>
          </div>

          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'rgb(var(--color-text-primary))'
            }}
          >
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-1">Total Exams</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">
              {stats?.totalExams || 0}
            </p>
            <p className="text-sm text-text-secondary">
              {stats?.activeExams || 0} published
            </p>
          </div>

          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              color: 'rgb(var(--color-text-primary))'
            }}
          >
            <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Questions</h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {stats?.totalQuestions || 0}
            </p>
            <p className="text-sm text-text-secondary">
              {course?.metadata?.totalPoints || 0} pts
            </p>
          </div>

          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'rgb(var(--color-text-primary))'
            }}
          >
            <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Recent Activity</h3>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">
              {stats?.recentlyEnrolledStudents || 0}
            </p>
            <p className="text-sm text-text-secondary">new students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-text-primary">
                Students ({course._count?.courseStudents || 0})
              </h2>
              <button
                onClick={() => setIsAddingStudents(true)}
                className="px-3 py-1 rounded text-sm disabled:opacity-50"
                style={{
                  backgroundColor: 'rgb(var(--color-primary))',
                  color: 'white'
                }}
                disabled={isLoadingAction}
              >
                Add Students
              </button>
            </div>
            {isAddingStudents && (
              <div 
                className="mb-4 p-4 rounded-lg"
                style={{
                  backgroundColor: 'rgb(var(--color-background))'
                }}
              >
                <h3 className="font-medium mb-2 text-text-primary">Select Students to Add</h3>
                {availableStudents.length > 0 ? (
                  <>
                    <select
                      multiple
                      className="w-full p-2 border rounded mb-3 max-h-40 text-text-primary"
                      style={{
                        backgroundColor: 'rgb(var(--color-surface-elevated))',
                        borderColor: 'rgb(var(--color-border))'
                      }}
                      value={selectedStudents}
                      onChange={(e) =>
                        setSelectedStudents(
                          Array.from(e.target.selectedOptions, (option) => option.value)
                        )
                      }
                      disabled={isLoadingAction}
                    >
                      {availableStudents.map((student) => (
                        <option 
                          key={student.id} 
                          value={student.id}
                          className="text-text-primary"
                          style={{
                            backgroundColor: 'rgb(var(--color-surface-elevated))'
                          }}
                        >
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
                        className="px-3 py-1 rounded text-sm"
                        style={{
                          backgroundColor: 'rgb(var(--color-surface-elevated))',
                          color: 'rgb(var(--color-text-primary))'
                        }}
                        disabled={isLoadingAction}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddStudents}
                        disabled={selectedStudents.length === 0 || isLoadingAction}
                        className="px-3 py-1 rounded text-sm"
                        style={{
                          backgroundColor: selectedStudents.length === 0 || isLoadingAction
                            ? 'rgb(var(--color-border))'
                            : 'rgb(var(--color-success))',
                          color: selectedStudents.length === 0 || isLoadingAction
                            ? 'rgb(var(--color-text-secondary))'
                            : 'white'
                        }}
                      >
                        {isLoadingAction ? "Adding..." : "Add Selected"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-text-secondary">No available students to add</p>
                )}
              </div>
            )}
            <div 
              className="rounded-lg p-4 max-h-60 overflow-y-auto"
              style={{
                backgroundColor: 'rgb(var(--color-background))'
              }}
            >
              {course.courseStudents?.length > 0 ? (
                <ul className="space-y-2">
                  {course.courseStudents.map((cs) => (
                    <li
                      key={cs.student.id}
                      className="border-b pb-2 last:border-b-0 flex justify-between items-start"
                      style={{
                        borderColor: 'rgb(var(--color-border))'
                      }}
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {cs.student.firstName} {cs.student.lastName}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {cs.student.matricNo}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {cs.student.department} • Level {cs.student.level}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: cs.student.isActive
                              ? 'rgba(52, 211, 153, 0.2)'
                              : 'rgba(75, 85, 99, 0.2)',
                            color: cs.student.isActive
                              ? 'rgb(52, 211, 153)'
                              : 'rgb(156, 163, 175)'
                          }}
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
                          className="text-sm disabled:opacity-50"
                          style={{
                            color: 'rgb(var(--color-error))'
                          }}
                          disabled={isLoadingAction}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-secondary">No students enrolled yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-text-primary">
              Exams ({course._count?.exams || 0})
            </h2>
            <div 
              className="rounded-lg p-4 max-h-60 overflow-y-auto"
              style={{
                backgroundColor: 'rgb(var(--color-background))'
              }}
            >
              {course.exams?.length > 0 ? (
                <ul className="space-y-2">
                  {course.exams.map((exam) => (
                    <li 
                      key={exam.id} 
                      className="border-b pb-2 last:border-b-0"
                      style={{
                        borderColor: 'rgb(var(--color-border))'
                      }}
                    >
                      <p className="font-medium text-text-primary">{exam.title}</p>
                      <p className="text-sm text-text-secondary">
                        {new Date(exam.date).toLocaleDateString()} •
                        <span
                          className="ml-1 px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: exam.state === "ACTIVE"
                              ? 'rgba(52, 211, 153, 0.2)'
                              : exam.state === "COMPLETED"
                              ? 'rgba(75, 85, 99, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                            color: exam.state === "ACTIVE"
                              ? 'rgb(52, 211, 153)'
                              : exam.state === "COMPLETED"
                              ? 'rgb(156, 163, 175)'
                              : 'rgb(245, 158, 11)'
                          }}
                        >
                          {exam.state}
                        </span>
                      </p>
                      <p className="text-xs text-text-secondary">
                        {exam._count?.students || 0} students •{" "}
                        {exam._count?.examQuestions || 0} questions
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-secondary">No exams created yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Questions Bank ({stats?.totalQuestions || 0})
          </h2>

          <div 
            className="rounded-lg shadow-sm border p-6"
            style={{
              backgroundColor: 'rgb(var(--color-surface-elevated))',
              borderColor: 'rgb(var(--color-border))'
            }}
          >
            {course.questions?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div 
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">
                      By Type
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats?.questionsByType || {}).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm font-medium text-text-primary">{type}</span>
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: 'rgb(59, 130, 246)'
                              }}
                            >
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div 
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                      By Difficulty
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats?.questionsByDifficulty || {}).map(
                        ([diff, count]) => (
                          <div
                            key={diff}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm font-medium text-text-primary">{diff}</span>
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: 'rgb(16, 185, 129)'
                              }}
                            >
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div 
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.1)'
                    }}
                  >
                    <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-3">
                      By Category
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats?.questionsByCategory || {}).map(
                        ([cat, count]) => (
                          <div
                            key={cat}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm font-medium text-text-primary">{cat}</span>
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                color: 'rgb(168, 85, 247)'
                              }}
                            >
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <h3 className="font-semibold mb-4 text-text-primary">Recent Questions</h3>
                  <div className="max-h-64 overflow-y-auto">
                    <ul className="space-y-4">
                      {course.questions.slice(0, 8).map((question) => (
                        <li
                          key={question.id}
                          className="border-b pb-4 last:border-b-0"
                          style={{ borderColor: 'rgb(var(--color-border))' }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium line-clamp-2 flex-1 mr-4" style={{ color: 'rgb(var(--color-text-primary))' }}>
                              {question.questionText}
                            </p>
                            <span 
                              className="px-2 py-1 rounded text-xs whitespace-nowrap"
                              style={{
                                backgroundColor: 'rgba(75, 85, 99, 0.2)',
                                color: 'rgb(var(--color-text-secondary))'
                              }}
                            >
                              {question.points} pts
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: 'rgb(59, 130, 246)'
                              }}
                            >
                              {question.questionType}
                            </span>
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: 'rgb(16, 185, 129)'
                              }}
                            >
                              {question.difficulty || "UNSPECIFIED"}
                            </span>
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                color: 'rgb(168, 85, 247)'
                              }}
                            >
                              {question.category || "UNCATEGORIZED"}
                            </span>
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                color: 'rgb(245, 158, 11)'
                              }}
                            >
                              Used in {question._count?.examQuestions || 0} exams
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {course.questions.length > 8 && (
                      <div 
                        className="mt-4 p-3 rounded-lg text-center"
                        style={{
                          backgroundColor: 'rgb(var(--color-background))'
                        }}
                      >
                        <p className="text-sm text-text-secondary">
                          Showing 8 of {course.questions.length} questions
                        </p>
                        <button 
                          className="text-sm font-medium mt-1"
                          style={{
                            color: 'rgb(var(--color-primary))'
                          }}
                        >
                          View All Questions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgb(var(--color-background))'
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
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
                <p className="text-text-secondary">No questions created yet</p>
                <p className="text-sm text-text-secondary mt-1">
                  Questions will appear here once you add them to this course
                </p>
              </div>
            )}
          </div>
        </div>
        <p className="mb-2 text-text-secondary">
          <span className="font-medium text-text-primary">Last Updated:</span>{" "}
          {new Date(course.updatedAt).toLocaleString()}
        </p>
        <p className="mb-2 text-text-secondary">
          <span className="font-medium text-text-primary">Has Active Exams:</span>{" "}
          <span
            style={{
              color: course.metadata?.hasActiveExams
                ? 'rgb(var(--color-success))'
                : 'rgb(var(--color-text-secondary))'
            }}
          >
            {course.metadata?.hasActiveExams ? "Yes" : "No"}
          </span>
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate(`/courses/${courseId}/edit`)}
            disabled={course.isPublished || isLoadingAction}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: course.isPublished || isLoadingAction
                ? 'rgb(var(--color-border))'
                : 'rgb(var(--color-primary))',
              color: course.isPublished || isLoadingAction
                ? 'rgb(var(--color-text-secondary))'
                : 'white'
            }}
          >
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCoursePage;