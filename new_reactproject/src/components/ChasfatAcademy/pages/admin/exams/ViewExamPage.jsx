// ViewExamPage.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

//import { jwtDecode } from 'jwt-decode';

const ViewExamPage = () => {
 // const { examId } = useParams();
  const { examId} = useParams(); // Add examinerId

  const navigate = useNavigate();
  

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');




  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
      //  const decodedToken = jwtDecode(token);
        const response = await axios.get(
        
        //  `http://localhost:5000/exams/${decodedToken.userId}/${examId}`,
         // `http://localhost:5000/exams/${decodedToken.userId}/${id}`,
         `http://localhost:5000/singleexam/${examId}`,
          
          
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExam(response.data.exam);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, token]);

  if (loading) return <div className="p-4">Loading exam details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!exam) return <div className="p-4">Exam not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Exams
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Exam Information</h2>
            <p className="mb-2"><span className="font-medium">Course:</span> {exam.course?.title || 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Date:</span> {new Date(exam.date).toLocaleDateString()}</p>
            <p className="mb-2"><span className="font-medium">Duration:</span> {exam.duration} minutes</p>
            <p className="mb-2"><span className="font-medium">Status:</span> {exam.isPublished ? 'Published' : 'Draft'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="whitespace-pre-line">{exam.description || 'No description provided'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Questions ({exam._count?.questions || 0})</h2>
          <div className="space-y-4">
            {exam.questions?.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <p className="font-medium">Question {index + 1}: {question.text}</p>
                {question.options?.length > 0 && (
                  <div className="mt-2 ml-4">
                    <p className="text-sm text-gray-600 mb-1">Options:</p>
                    <ul className="list-disc pl-5">
                      {question.options.map(option => (
                        <li key={option.id} className={option.isCorrect ? 'text-green-600' : ''}>
                          {option.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate(`/exam/${examId}/edit`)}
            disabled={exam.isPublished}
            className={`px-4 py-2 rounded ${exam.isPublished 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Edit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewExamPage;