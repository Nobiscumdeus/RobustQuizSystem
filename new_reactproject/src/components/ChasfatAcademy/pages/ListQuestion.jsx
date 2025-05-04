import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const ListQuestions = ({ examId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/exams/${examId}/questions`);
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId]);

  if (loading) {
    return <div className="mt-5 max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">Loading...</div>;
  }

  if (error) {
    return <div className="mt-5 max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">{error}</div>;
  }

  return (
    <div className="mt-5 max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">List of Questions</h2>
      <ul>
        {questions.map((question) => (
          <li key={question.id} className="mb-4">
            <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <h3 className="text-xl font-bold">{question.questionText}</h3>
              <p>Type: {question.questionType}</p>
              <p>Correct Answer: {question.correctAnswer}</p>
              {question.imageUrl && <img src={question.imageUrl} alt="Question" className="w-full h-auto rounded-lg" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

ListQuestions.propTypes = {
  examId: PropTypes.number.isRequired
};

export default ListQuestions;