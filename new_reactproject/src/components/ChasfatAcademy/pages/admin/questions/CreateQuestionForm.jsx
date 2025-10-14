import { useState, useEffect } from 'react';
import axios from 'axios';
import ScrollDownIcon from '../../../utility/ScrollDownIcon';
import { jwtDecode } from 'jwt-decode';
import { isAuthenticated } from '../../../utility/auth';
import { useNavigate,useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const CreateQuestionForm = () => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [image, setImage] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [order, setOrder] = useState(1);
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState('SCIENCE');
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [errors, setErrors] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [points, setPoints] = useState(1.0);

  
    //Authentication check
    const navigate = useNavigate();
    const location=useLocation();
   useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", {
      //  state: { from: "/admin_panel" },
      state:{from:location.pathname,message:'Session expired, please login to continue'},
        replace: true,
      });
    }
  }, [navigate,location]);


  // Fetch courses and exams for the specific examiner
  useEffect(() => {
    const fetchCoursesAndExams = async () => {
      setLoading(true);
      try {
        const decodedToken = jwtDecode(token);
        const examinerId = decodedToken.userId;

        const response = await axios.get(`http://localhost:5000/courses-exams/examiner/${examinerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setCourses(response.data.courses || []);
        setExams(response.data.exams || []);
      } catch (error) {
        console.error('Error fetching courses and exams:', error);
        setErrors({ fetch: 'Failed to load courses and exams. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndExams();
  }, [token]);

  // ✅ NEW: Fetch existing questions for the selected course
  useEffect(() => {
    const fetchCourseQuestions = async () => {
      if (!courseId) {
        setQuestions([]);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/courses/${courseId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // ✅ Handle the correct response structure
      
        setQuestions(response.data.data.questions || [])
      } catch (error) {
        console.error('Error fetching course questions:', error);
        setQuestions([]);
      }
    };

    fetchCourseQuestions();
  }, [courseId, token]);

  // Reset exam selection when course changes
  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setCourseId(newCourseId);
  };

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

  /*
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = {};
    if (!questionText) newErrors.questionText = 'Question text is required.';
    if (!courseId) newErrors.courseId = 'Course is required.';
    if (!order || order < 1) newErrors.order = 'Order must be a positive number.';
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
    formData.append('courseId', courseId);
    formData.append('order', order);
    formData.append('difficulty', difficulty);
    formData.append('category', category);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/questions', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });

      // ✅ Handle the correct response structure
      const newQuestion = response.data.success ? response.data.data : response.data;
      
      // ✅ Add the new question to the list
      setQuestions(prev => [newQuestion, ...prev]);

      // Clear the form
      setQuestionText('');
      setQuestionType('MULTIPLE_CHOICE');
      setOptions(['', '']);
      setCorrectAnswer('');
      setImage(null);
      setOrder(order + 1);
      setDifficulty('easy');
      setCategory('SCIENCE');
      setErrors({});

      alert('Question created successfully!');
    } catch (error) {
      console.error('Error creating question:', error.response?.data || error.message);
      alert('Failed to create question.');
    } finally {
      setLoading(false);
    }
  };
  */
 const handleSubmit = async (e) => {
  e.preventDefault();


  // Validation (keep your existing validation)
  const newErrors = {};
  if (!questionText) newErrors.questionText = 'Question text is required.';
  if (!courseId) newErrors.courseId = 'Course is required.';
  if (questionType === 'MULTIPLE_CHOICE' && options.some(option => !option)) {
    newErrors.options = 'All options must be filled.';
  }
  if (!correctAnswer) newErrors.correctAnswer = 'Correct answer is required.';
  if (!points || points < 0.5 || points > 10) {
  newErrors.points = 'Points must be between 0.5 and 10';
}

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  const formData = new FormData();
  formData.append('questionText', questionText);
  formData.append('questionType', questionType);
  formData.append('options', JSON.stringify(options));
  formData.append('correctAnswer', correctAnswer);
  formData.append('courseId', courseId);
  formData.append('difficulty', difficulty);
  formData.append('category', category);
  formData.append('tags', JSON.stringify([])); // Add empty tags array
 // formData.append('points', '1.0'); // Add points
  formData.append('points', points.toString()); // Instead of hardcoded '1.0'

  // Only append image if it exists
  if (image) {
    formData.append('image', image);
  }

  try {
    setLoading(true);
    const response = await axios.post('http://localhost:5000/questions', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });

    const newQuestion = response.data.data; // Use 'data' key
    setQuestions(prev => [newQuestion, ...prev]);

    // Reset form
    setQuestionText('');
    setOptions(['', '']);
    setCorrectAnswer('');
    setImage(null);
    setErrors({});

    alert('Question created successfully!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    alert(`Failed to create question: ${error.response?.data?.error || error.message}`);
  } finally {
    setLoading(false);
  }
};

  // ✅ Get course name helper function
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : 'Unknown Course';
  };

  // Loading state
  if (loading && courses.length === 0 && exams.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-4">
        <div className="text-center">
          <p className="text-gray-600">Loading courses and exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-4">
      <Link to="/admin_panel" className="text-blue-600 hover:underline mb-6 inline-block">Back to Home</Link>
      
      <h1 className="text-2xl font-semibold mb-6 text-center">Create New Question</h1>

      {/* Display fetch error if any */}
      {errors.fetch && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.fetch}
        </div>
      )}

      {/* Show warning if no courses found */}
      {!loading && courses.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          No courses found. Please create courses first.
        </div>
      )}

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

        {/* Course Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Course:</label>
          <select
            value={courseId}
            onChange={handleCourseChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={courses.length === 0}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
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
        {/* Points Field */}
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">
    Points (Score Weight)
  </label>
  <input
    type="number"
    step="0.5"
    min="0.5"
    max="10"
    value={points}
    onChange={(e) => setPoints(e.target.value)}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    placeholder="Enter points (e.g., 1.0, 2.5)"
  />
  {errors.points && <p className="text-red-500 text-xs italic">{errors.points}</p>}
</div>

        {/* Order Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Question Order:</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value))}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter question order (1, 2, 3...)"
          />
          {errors.order && <p className="text-red-500 text-sm mt-1">{errors.order}</p>}
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
            disabled={loading || courses.length === 0}
            className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Question...' : 'Create Question'}
          </button>
        </div>
      </form>

      {/* ✅ FIXED: Display Course Questions */}
      {courseId && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Questions for {getCourseName(parseInt(courseId))} ({questions.length})
          </h2>
          
          {questions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No questions created yet for this course.</p>
              <p className="text-gray-500 text-sm mt-2">Create your first question using the form above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id || index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{question.questionText}</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {question.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Course:</strong> {question.course?.title || getCourseName(question.courseId)}</p>
                      <p><strong>Type:</strong> {question.questionType}</p>
                      <p><strong>Points:</strong> {question.points}</p>
                    </div>
                    <div>
                      <p><strong>Created:</strong> {new Date(question.createdAt).toLocaleDateString()}</p>
                      <p><strong>Used in:</strong> {question.examQuestions?.length || 0} exam(s)</p>
                    </div>
                  </div>

                  {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {question.options.map((option, i) => (
                          <div key={i} className={`p-2 rounded text-sm ${
                            option === question.correctAnswer 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-white border border-gray-200'
                          }`}>
                            {String.fromCharCode(65 + i)}. {option}
                            {option === question.correctAnswer && (
                              <span className="ml-2 text-green-600">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.questionType !== 'MULTIPLE_CHOICE' && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <strong>Correct Answer:</strong> 
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
                          {question.correctAnswer}
                        </span>
                      </p>
                    </div>
                  )}

                  {question.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={`http://localhost:5000${question.imageUrl}`}
                        alt="Question Image"
                        className="max-w-full h-auto max-h-48 rounded border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <ScrollDownIcon />
    </div>
  );
};

export default CreateQuestionForm;