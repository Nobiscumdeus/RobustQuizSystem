import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateQuestion } from '@hooks/useQuestion';
//import { useCurrentUser } from '@/hooks/useAuth';

const QuestionForm = () => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('SCIENCE');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [points, setPoints] = useState(1.0);
  const [order, setOrder] = useState(1);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');

  //const { user } = useCurrentUser();
  const { createQuestion, isLoading } = useCreateQuestion();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    
    // Create preview URL
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    // If removed option was the correct answer, reset it
    if (options[index] === correctAnswer) {
      setCorrectAnswer('');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!questionText.trim()) newErrors.questionText = 'Question text is required.';
    if (questionType === 'MULTIPLE_CHOICE' && options.some(option => !option.trim())) {
      newErrors.options = 'All options must be filled.';
    }
    if (!correctAnswer.trim()) newErrors.correctAnswer = 'Correct answer is required.';
    if (!points || points < 0.5 || points > 10) {
      newErrors.points = 'Points must be between 0.5 and 10';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('questionText', questionText);
      formData.append('questionType', questionType);
      formData.append('options', JSON.stringify(options.filter(opt => opt.trim())));
      formData.append('correctAnswer', correctAnswer);
      formData.append('category', category);
      formData.append('difficulty', difficulty);
      formData.append('points', points.toString());
      formData.append('order', order.toString());
      
      if (tags.trim()) {
        formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())));
      }
      
      if (image) {
        formData.append('image', image);
      }

      // Use custom hook for API call
      const result = await createQuestion(formData);
      
      if (result.success) {
        toast.success('Question created successfully!');
        
        // Reset form
        setQuestionText('');
        setOptions(['', '']);
        setCorrectAnswer('');
        setImage(null);
        setCategory('SCIENCE');
        setTags('');
        setDifficulty('easy');
        setPoints(1.0);
        setOrder(1);
        setErrors({});
        
        // Clear preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
      } else {
        toast.error(result.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-surface-elevated dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-gray-100">
        Create New Question
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
            Question Text *
          </label>
          <textarea
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              if (errors.questionText) setErrors({...errors, questionText: ''});
            }}
            rows="3"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
              ${errors.questionText 
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                : 'border-border dark:border-gray-600 bg-white dark:bg-gray-700'
              }
              text-text-primary dark:text-gray-100
              focus:ring-primary dark:focus:ring-primary`}
            placeholder="Enter your question here..."
          />
          {errors.questionText && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.questionText}
            </p>
          )}
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
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

        {/* Multiple Choice Options */}
        {questionType === 'MULTIPLE_CHOICE' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-400">
                Options *
              </label>
              <button
                type="button"
                onClick={addOption}
                className="text-sm px-3 py-1.5 rounded-md 
                         bg-primary/10 dark:bg-primary/20 
                         text-primary dark:text-primary
                         hover:bg-primary/20 dark:hover:bg-primary/30
                         transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Option
              </button>
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
                      ${errors.options && !option.trim()
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                        : 'border-border dark:border-gray-600 bg-white dark:bg-gray-700'
                      }
                      text-text-primary dark:text-gray-100
                      focus:ring-primary dark:focus:ring-primary`}
                    placeholder={`Option ${index + 1}`}
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-sm text-text-secondary dark:text-gray-400">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={option}
                        checked={correctAnswer === option}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      Correct
                    </label>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-1.5 rounded-md 
                                 bg-red-100 dark:bg-red-900/30 
                                 text-red-600 dark:text-red-400
                                 hover:bg-red-200 dark:hover:bg-red-900/50
                                 transition-colors duration-200"
                        title="Remove option"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                {errors.options}
              </p>
            )}
          </div>
        )}

        {/* Correct Answer for non-MCQ */}
        {questionType !== 'MULTIPLE_CHOICE' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Correct Answer *
            </label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => {
                setCorrectAnswer(e.target.value);
                if (errors.correctAnswer) setErrors({...errors, correctAnswer: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
                ${errors.correctAnswer 
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                  : 'border-border dark:border-gray-600 bg-white dark:bg-gray-700'
                }
                text-text-primary dark:text-gray-100
                focus:ring-primary dark:focus:ring-primary`}
              placeholder={
                questionType === 'TRUE_FALSE' ? 'Enter "true" or "false"' :
                questionType === 'FILL_IN_THE_BLANK' ? 'Enter the missing word/phrase' :
                'Enter the correct answer'
              }
            />
            {errors.correctAnswer && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.correctAnswer}
              </p>
            )}
          </div>
        )}

        {/* Category, Difficulty, Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            >
              <option value="SCIENCE">Science</option>
              <option value="ENGINEERING">Engineering</option>
              <option value="COMPUTER_SCIENCE_IT">Computer Science</option>
              <option value="MATHEMATICS">Mathematics</option>
              <option value="BIOLOGY">Biology</option>
              <option value="PHYSICS">Physics</option>
              <option value="CHEMISTRY">Chemistry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Points (0.5 - 10) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="10"
              value={points}
              onChange={(e) => {
                setPoints(e.target.value);
                if (errors.points) setErrors({...errors, points: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
                ${errors.points 
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                  : 'border-border dark:border-gray-600 bg-white dark:bg-gray-700'
                }
                text-text-primary dark:text-gray-100
                focus:ring-primary dark:focus:ring-primary`}
              placeholder="e.g., 1.0"
            />
            {errors.points && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.points}
              </p>
            )}
          </div>
        </div>

        {/* Tags and Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
              placeholder="react, javascript, programming"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Question Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
            Upload Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-border dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 
                     text-text-primary dark:text-gray-100
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-medium
                     file:bg-primary/10 file:text-primary
                     hover:file:bg-primary/20
                     transition-all duration-200"
          />
          
          {previewUrl && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
                Preview:
              </p>
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48 rounded-lg border border-border dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl('');
                  }}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full 
                           bg-red-100 dark:bg-red-900/30 
                           text-red-600 dark:text-red-400
                           hover:bg-red-200 dark:hover:bg-red-900/50
                           transition-colors duration-200"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-lg font-medium
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
      </form>
    </div>
  );
};

export default QuestionForm;

/*

import { useState} from 'react'

const QuestionForm= () => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState('easy');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('examId', '1'); // Replace with actual exam ID
    formData.append('questionText', questionText);
    formData.append('questionType', questionType);
    formData.append('options', JSON.stringify(options));
    formData.append('correctAnswer', correctAnswer);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('difficulty', difficulty);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Question created:', data);
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Question Text</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Question Type</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="IMAGE_UPLOAD">Image Upload</option>
          <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
        </select>
      </div>
      {questionType === 'MULTIPLE_CHOICE' && (
        <div>
          <label>Options</label>
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              className="w-full p-2 border rounded mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => setOptions([...options, ''])}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Option
          </button>
        </div>
      )}
      <div>
        <label>Correct Answer</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Upload Image (optional)</label>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Create Question
      </button>
    </form>
  );
};

export default QuestionForm;

*/