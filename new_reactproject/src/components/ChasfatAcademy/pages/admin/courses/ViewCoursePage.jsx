import { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';


const ViewCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');



  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/singlecourse/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(response.data.course);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, token]);

  if (loading) return <div className="p-4">Loading course details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
            <p className="mb-2"><span className="font-medium">Code:</span> {course.code || 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Day created: </span>{new Date(course.createdAt).toLocaleString() || 'NA'}</p>
            <p className="mb-2"><span className="font-medium">Credit Hours:</span> {course.creditHours}</p>
            <p className="mb-2"><span className="font-medium">Semester:</span> {course.semester} {course.year}</p>
            <p className="mb-2"><span className="font-medium">Status:</span> {course.isPublished ? 'Published' : 'Draft'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="whitespace-pre-line">{course.description || 'No description provided'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Instructor</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium">{course.examiner?.firstName || 'N/A'}</p>
            <p className="text-gray-600">{course.examiner?.email || ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Students ({course._count?.students || 0})</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {course.students?.length > 0 ? (
                <ul className="space-y-2">
                  {course.students.map(student => (
                    <li key={student.id} className="border-b pb-2 last:border-b-0">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No students enrolled yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Exams ({course._count?.exams || 0})</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {course.exams?.length > 0 ? (
                <ul className="space-y-2">
                  {course.exams.map(exam => (
                    <li key={exam.id} className="border-b pb-2 last:border-b-0">
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exam.date).toLocaleDateString()} • {exam.isPublished ? 'Published' : 'Draft'}
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

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate(`/courses/${courseId}/edit`)}
            disabled={course.isPublished}
            className={`px-4 py-2 rounded ${course.isPublished 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCoursePage;