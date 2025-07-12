import { useState} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ScrollDownIcon from '../utility/ChasfatAcademy/ScrollDownIcon';


const CreateQuestion = ({ examId }) => {
  const [question, setQuestion] = useState({
    examId: examId,
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    options: [],
    correctAnswer: '',
    imageUrl: ''
  });

  
  
  const handleChange = (event) => {
    setQuestion({ ...question, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/api/questions', question);
      alert('Question created successfully');
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Create Question</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="questionText">
          Question Text
        </label>
        <input
          type="text"
          name="questionText"
          value={question.questionText}
          onChange={handleChange}
          placeholder="Question Text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="questionType">
          Question Type
        </label>
        <select
          name="questionType"
          value={question.questionType}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="IMAGE_UPLOAD">Image Upload</option>
          <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="correctAnswer">
          Correct Answer
        </label>
        <input
          type="text"
          name="correctAnswer"
          value={question.correctAnswer}
          onChange={handleChange}
          placeholder="Correct Answer"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Create Question
      </button>
      <ScrollDownIcon />
    </form>
   
  );
};

CreateQuestion.propTypes = {
  examId: PropTypes.number.isRequired
};

export default CreateQuestion;