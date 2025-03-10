import { useState, useEffect } from 'react';
import axios from 'axios';

const ListExams = () => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get('/api/exams');
        setExams(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="mt-5 max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">List of Exams</h2>
      <ul>
        {exams.map((exam) => (
          <li key={exam.id} className="mb-4">
            <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <h3 className="text-xl font-bold">{exam.title}</h3>
              <p>Date: {new Date(exam.date).toLocaleString()}</p>
              <p>Duration: {exam.duration} minutes</p>
              <p>Course ID: {exam.courseId}</p>
              <p>Examiner ID: {exam.examinerId}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListExams;