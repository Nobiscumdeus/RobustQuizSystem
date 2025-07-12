import { useState} from 'react';
import axios from 'axios';
import ScrollDownIcon from '../../../utility/ScrollDownIcon';

const CreateQuestionForm = () => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [image, setImage] = useState(null);
  const [examId, setExamId] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [category,setCategory]=useState('SCIENCE');
  const [errors, setErrors] = useState({});
  const [questions, setQuestions] = useState([]); // To store created questions

  // Handle adding a new option
  const addOption = () => {
    setOptions([...options, '']);
  };


    
  
  // Handle removing an option
  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Handle changing an option
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = {};
    if (!questionText) newErrors.questionText = 'Question text is required.';
    if (!examId) newErrors.examId = 'Exam ID is required.';
    if (questionType === 'MULTIPLE_CHOICE' && options.some(option => !option)) {
      newErrors.options = 'All options must be filled.';
    }
    if (!correctAnswer) newErrors.correctAnswer = 'Correct answer is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('questionText', questionText);
    formData.append('questionType', questionType);
    formData.append('options', JSON.stringify(options));
    formData.append('correctAnswer', correctAnswer);
    formData.append('image', image);
    formData.append('examId', examId);
    formData.append('difficulty', difficulty);
    formData.append('category',category);
    

    try {
      const response = await axios.post('http://localhost:5000/questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Add the new question to the list of questions
      setQuestions([...questions, response.data]);

      // Clear the form
      setQuestionText('');
      setQuestionType('MULTIPLE_CHOICE');
      setOptions(['', '']);
      setCorrectAnswer('');
      setImage(null);
      setExamId('');
      setDifficulty('easy');
      setCategory('SCIENCE');
      setErrors({});

      alert('Question created successfully!');
    } catch (error) {
      console.error('Error creating question:', error.response?.data || error.message);
      alert('Failed to create question.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">Create New Question</h1>

      <form onSubmit={handleSubmit}>
        {/* Question Text */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Question Text:</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the question"
          />
          {errors.questionText && <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>}
        </div>

        {/* Question Type */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Question Type:</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True/False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
            <option value="IMAGE_UPLOAD">Image Upload</option>
            <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
          </select>
        </div>

        {/* Options (Conditional Rendering) */}
        {questionType === 'MULTIPLE_CHOICE' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Options:</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Option
            </button>
          </div>
        )}

        {/* Correct Answer */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Correct Answer:</label>
          {questionType === 'MULTIPLE_CHOICE' ? (
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select the correct answer</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the correct answer"
            />
          )}
          {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer}</p>}
        </div>


        {/* Category */}
        <div className='mb-4'>
          <label className='block text-gray-700 font-semibold mb-2'> Select Category: </label>
          <select value={category} 
          onChange={(e)=>setCategory(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
          <option value="SCIENCE">Science</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="ARTS_HUMANITIES">Arts & Humanities</option>
            <option value="SOCIAL_SCIENCES">Social Sciences</option>
            <option value="BUSINESS_MANAGEMENT">Business & Management</option>
            <option value="GEOGRAPHY">Geography</option>
            <option value="LAW">Law</option>
            <option value="MEDICAL_HEALTH_SCIENCES">Medical & Health Sciences</option>
            <option value="EDUCATION">Education</option>
            <option value="AGRICULTURE">Agriculture</option>
            <option value="ENVIRONMENTAL_SCIENCES">Environmental Sciences</option>
            <option value="COMPUTER_SCIENCE_IT">Computer Science & IT</option>
            <option value="ARCHITECTURE">Architecture</option>
            <option value="PHILOSOPHY">Philosophy</option>
            <option value="LANGUAGES_LINGUISTICS">Languages & Linguistics</option>
            <option value="ECONOMICS">Economics</option>
            <option value="MATHEMATICS">Mathematics</option>
            <option value="PHYSICS">Physics</option>
            <option value="CHEMISTRY">Chemistry</option>
            <option value="BIOLOGY">Biology</option>
            <option value="MUSIC">Music</option>

          </select>

        </div>






        {/* Difficulty */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Difficulty Level:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Exam ID */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Exam ID:</label>
          <input
            type="text"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the Exam ID"
          />
          {errors.examId && <p className="text-red-500 text-sm mt-1">{errors.examId}</p>}
        </div>

        {/* Image Upload (Optional) */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Upload Image (optional):</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="mb-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Question
          </button>
        </div>
      </form>

      {/* Display Created Questions */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Created Questions</h2>
        {questions.map((question, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold">{question.questionText}</h3>
            <p className="text-gray-600">Type: {question.questionType}</p>
            {question.questionType === 'MULTIPLE_CHOICE' && (
              <div className="mt-2">
                <p className="text-gray-600">Options:</p>
                <ul className="list-disc list-inside">
                  {question.options.map((option, i) => (
                    <li key={i} className="text-gray-600">{option}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-gray-600">Correct Answer: {question.correctAnswer}</p>
            <p className="text-gray-600">Difficulty: {question.difficulty}</p>
            <p className="text-gray-600">Exam ID: {question.examId}</p>
            {question.image && (
              <img
                src={URL.createObjectURL(question.image)}
                alt="Question Image"
                className="mt-2 max-w-full h-auto"
              />
            )}
          </div>
        ))}
      </div>
      <ScrollDownIcon />
    </div>
  );
};

export default CreateQuestionForm;