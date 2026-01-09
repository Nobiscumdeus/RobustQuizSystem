import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useCreateQuestion } from '@hooks/useQuestion';
import ScrollDownIcon from '../utility/ChasfatAcademy/ScrollDownIcon';

const CreateQuestion = ({ examId }) => {
  const [question, setQuestion] = useState({
    examId: examId,
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''], // Default 4 options for multiple choice
    correctAnswer: '',
    imageUrl: '',
    marks: 1,
    explanation: '',
  });

  const [optionInputs, setOptionInputs] = useState(['', '', '', '']);
  const { createQuestion, isLoading } = useCreateQuestion();

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'questionType') {
      // Reset options when question type changes
      const newOptions = value === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : [];
      setQuestion({ 
        ...question, 
        [name]: value,
        options: newOptions,
        correctAnswer: value !== 'MULTIPLE_CHOICE' ? '' : question.correctAnswer
      });
      setOptionInputs(value === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : []);
    } else {
      setQuestion({ ...question, [name]: value });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...optionInputs];
    newOptions[index] = value;
    setOptionInputs(newOptions);
    
    // Update question options
    const filteredOptions = newOptions.filter(opt => opt.trim() !== '');
    setQuestion({ ...question, options: filteredOptions });
  };

  const addOption = () => {
    setOptionInputs([...optionInputs, '']);
  };

  const removeOption = (index) => {
    const newOptions = [...optionInputs];
    newOptions.splice(index, 1);
    setOptionInputs(newOptions);
    
    const filteredOptions = newOptions.filter(opt => opt.trim() !== '');
    setQuestion({ 
      ...question, 
      options: filteredOptions,
      correctAnswer: question.correctAnswer === index.toString() ? '' : question.correctAnswer
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validation
    if (!question.questionText.trim()) {
      toast.error('Please enter question text');
      return;
    }
    
    if (question.questionType === 'MULTIPLE_CHOICE' && question.options.length < 2) {
      toast.error('Multiple choice questions require at least 2 options');
      return;
    }
    
    if (!question.correctAnswer.trim()) {
      toast.error('Please enter correct answer');
      return;
    }

    // Prepare final data
    const questionData = {
      ...question,
      examId: parseInt(examId, 10),
      marks: parseInt(question.marks, 10) || 1,
    };

    try {
      const result = await createQuestion(questionData);
      
      if (result.success) {
        toast.success('Question created successfully!');
        
        // Reset form
        setQuestion({
          examId: examId,
          questionText: '',
          questionType: 'MULTIPLE_CHOICE',
          options: ['', '', '', ''],
          correctAnswer: '',
          imageUrl: '',
          marks: 1,
          explanation: '',
        });
        setOptionInputs(['', '', '', '']);
      } else {
        toast.error(result.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 max-w-2xl mx-auto">
      <div className="bg-surface-elevated dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-border dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-gray-100">
          Create Question
        </h2>
        
        {/* Question Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400" htmlFor="questionText">
            Question Text *
          </label>
          <textarea
            name="questionText"
            value={question.questionText}
            onChange={handleChange}
            placeholder="Enter your question here..."
            rows="3"
            className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 
                     text-text-primary dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                     transition-all duration-200 resize-none"
            required
          />
        </div>

        {/* Question Type and Marks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400" htmlFor="questionType">
              Question Type *
            </label>
            <select
              name="questionType"
              value={question.questionType}
              onChange={handleChange}
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="IMAGE_UPLOAD">Image Upload</option>
              <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400" htmlFor="marks">
              Marks *
            </label>
            <input
              type="number"
              name="marks"
              value={question.marks}
              onChange={handleChange}
              min="1"
              max="100"
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Options for Multiple Choice */}
        {question.questionType === 'MULTIPLE_CHOICE' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-400">
                Options *
              </label>
              <button
                type="button"
                onClick={addOption}
                className="text-sm px-3 py-1 rounded-md 
                         bg-primary/10 dark:bg-primary/20 
                         text-primary dark:text-primary
                         hover:bg-primary/20 dark:hover:bg-primary/30
                         transition-colors duration-200"
              >
                + Add Option
              </button>
            </div>
            
            <div className="space-y-3">
              {optionInputs.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-3 border border-border dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 
                             text-text-primary dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                             transition-all duration-200"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={index.toString()}
                      checked={question.correctAnswer === index.toString()}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary dark:text-gray-400">Correct</span>
                    {optionInputs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-1.5 rounded-md 
                                 bg-red-100 dark:bg-red-900/30 
                                 text-red-600 dark:text-red-400
                                 hover:bg-red-200 dark:hover:bg-red-900/50
                                 transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-secondary/70 dark:text-gray-500 mt-2">
              At least 2 options required. Click the radio button to mark as correct answer.
            </p>
          </div>
        )}

        {/* Correct Answer for non-MCQ */}
        {question.questionType !== 'MULTIPLE_CHOICE' && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400" htmlFor="correctAnswer">
              Correct Answer *
            </label>
            <input
              type="text"
              name="correctAnswer"
              value={question.correctAnswer}
              onChange={handleChange}
              placeholder={
                question.questionType === 'TRUE_FALSE' ? 'Enter true or false' :
                question.questionType === 'FILL_IN_THE_BLANK' ? 'Enter the missing word/phrase' :
                'Enter the correct answer'
              }
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
              required
            />
          </div>
        )}

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400" htmlFor="imageUrl">
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={question.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400" htmlFor="explanation">
              Explanation (Optional)
            </label>
            <input
              type="text"
              name="explanation"
              value={question.explanation}
              onChange={handleChange}
              placeholder="Optional explanation for answer"
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg font-medium
                   bg-primary dark:bg-primary
                   text-white
                   hover:bg-primary-hover dark:hover:bg-primary-hover
                   focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                   dark:focus:ring-offset-gray-800
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Question...
            </span>
          ) : (
            'Create Question'
          )}
        </button>
      </div>
      <ScrollDownIcon />
    </form>
  );
};

CreateQuestion.propTypes = {
  examId: PropTypes.number.isRequired
};

export default CreateQuestion;
/*
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
*/