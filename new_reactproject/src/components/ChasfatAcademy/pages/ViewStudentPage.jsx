// StudentDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated } from '../utility/auth';

const ViewStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: "/admin_panel" },
        replace: true,
      });
    }
  }, [navigate]);

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/student/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data?.student) {
          setStudent(response.data.student);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student data');
        console.error('Load Error:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, token]);

  if (loading) return <div className="text-center p-4">Loading student data...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (!student) return <div className="text-center p-4">Student not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Details</h1>
        <div className="space-x-2">
          <Link
            to={`/student/${studentId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={() => navigate('/admin_panel')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Student Header */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-xl font-semibold">{student.firstName} {student.lastName}</h2>
              <p className="text-gray-600">Matric No: {student.matricNo}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{student.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{student.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p>{student.department || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p>{student.level || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p>{student.lastActive ? new Date(student.lastActive).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            </div>

            {/* Examiner Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3">Examiner Information</h3>
              {student.examiner && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{student.examiner.firstName} {student.examiner.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{student.examiner.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Courses */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Enrolled Courses</h3>
            {student.courses && student.courses.length > 0 ? (
              <div className="bg-white rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {student.courses.map(course => (
                      <tr key={course.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{course.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{course.semester || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            to={`/course/${course.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No courses enrolled</p>
            )}
          </div>

          {/* Results */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Exam Results</h3>
            {student.results && student.results.length > 0 ? (
              <div className="bg-white rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {student.results.map(result => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{result.course?.code || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{result.score || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{result.grade || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result.date ? new Date(result.date).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No exam results available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentPage;