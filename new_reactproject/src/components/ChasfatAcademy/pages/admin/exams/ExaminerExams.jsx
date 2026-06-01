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

