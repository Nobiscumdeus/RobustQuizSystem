import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ScrollDownIcon from '../../../utility/ScrollDownIcon';

// Updated imports
import { useCurrentUser } from '@hooks/useAuth';
import { 
  useCreateQuestion, 
//  useCoursesAndExams, 
  useExaminerCourses,
  useQuestionsByCourse,
 // useQuestionManagement 
} from '@hooks/useQuestion'; // Adjust path as needed


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
  const [errors, setErrors] = useState({});
  const [points, setPoints] = useState(1.0);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const { isAuthenticated, isLoading: authLoading, user } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  /*
  const { 
    courses, 
  //  exams, 
    isLoading: coursesLoading, 
    error: coursesError,
    refetch: refetchCourses 
  } = useCoursesAndExams(user?.id);
   */

  const { 
  courses, 
//  exams,  // Remove exams if not needed
  isLoading: coursesLoading, 
  error: coursesError,
  refetch: refetchCourses 
} = useExaminerCourses(user?.id);  
  
    const { 
    questions, 
    isLoading: questionsLoading,
    refetch: refetchQuestions 
  } = useQuestionsByCourse(courseId);

   const { createQuestion, isLoading: creatingQuestion } = useCreateQuestion();

 // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", {
        state: { 
          from: location.pathname, 
          message: 'Session expired, please login to continue' 
        },
        replace: true,
      });
    }
  }, [authLoading, isAuthenticated, navigate, location]);

    useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /*
  // RTK Query hooks
  const { 
    data: coursesAndExamsData, 
    isLoading: coursesLoading, 
    error: coursesError,
    refetch: refetchCourses
  } = useGetCoursesAndExamsQuery(user?.id, {
    skip: !user?.id
  });
  */
 /*
  const { 
    data: questionsData, 
    isLoading: questionsLoading,
    refetch: refetchQuestions 
  } = useGetCourseQuestionsQuery(courseId, {
    skip: !courseId
  });
   const [createQuestion, { isLoading: creatingQuestion }] = useCreateQuestionMutation();

  */
 
   /*
  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", {
        state: { 
          from: location.pathname, 
          message: 'Session expired, please login to continue' 
        },
        replace: true,
      });
    }
  }, [authLoading, isAuthenticated, navigate, location]);
  */

  /*
  // Reset preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

   // Extract courses and exams
  const courses = coursesAndExamsData?.courses || [];
  //const exams = coursesAndExamsData?.exams || [];
  const questions = questionsData?.questions || [];


  */

 
  // Handle course change
  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setCourseId(newCourseId);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setImage(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle adding option
  const addOption = () => {
    setOptions([...options, '']);
  };

  // Handle removing option
  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    // If removed option was the correct answer, reset correct answer
    if (options[index] === correctAnswer) {
      setCorrectAnswer('');
    }
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  /*
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!questionText.trim()) newErrors.questionText = 'Question text is required.';
    if (!courseId) newErrors.courseId = 'Course is required.';
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
      formData.append('courseId', courseId);
      formData.append('difficulty', difficulty);
      formData.append('category', category);
      formData.append('order', order.toString());
      formData.append('points', points.toString());
      
      if (image) {
        formData.append('image', image);
      }

      // Use RTK Query mutation
      const result = await createQuestion(formData).unwrap();
      
      if (result.success || result.id) {
        toast.success('Question created successfully!');
        
        // Reset form
        setQuestionText('');
        setOptions(['', '']);
        setCorrectAnswer('');
        setImage(null);
        setOrder(1);
        setPoints(1.0);
        setErrors({});
        
        // Clear preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
        
        // Refetch questions for the current course
        refetchQuestions();
      } else {
        toast.error(result.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error(error.data?.message || error.error || 'Failed to create question');
    }
  };
  */
   // ✅ In your handleSubmit function, use the hook:
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!questionText.trim()) newErrors.questionText = 'Question text is required.';
    if (!courseId) newErrors.courseId = 'Course is required.';
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
      formData.append('courseId', courseId);
      formData.append('difficulty', difficulty);
      formData.append('category', category);
      formData.append('order', order.toString());
      formData.append('points', points.toString());
      
      if (image) {
        formData.append('image', image);
      }

      // ✅ Use the custom hook
      const result = await createQuestion(formData);
      
      if (result.success) {
        toast.success('Question created successfully!');
        
        // Reset form
        setQuestionText('');
        setOptions(['', '']);
        setCorrectAnswer('');
        setImage(null);
        setOrder(1);
        setPoints(1.0);
        setErrors({});
        
        // Clear preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
        
        // Refetch questions for the current course
        refetchQuestions();
      } else {
        toast.error(result.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Get course name helper
  const getCourseName = (courseId) => {
    const course = courses.find(c => 
      c.id === parseInt(courseId) || c.id === courseId
    );
    return course ? `${course.code} - ${course.title}` : 'Unknown Course';
  };

  // Loading states
  const isLoading = authLoading || coursesLoading;
  const isQuestionsLoading = questionsLoading && courseId;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg mt-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading courses and exams...</p>
        </div>
      </div>
    );
  }

  if (!authLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-surface-elevated dark:bg-gray-800 shadow-lg rounded-xl mt-4 border border-border dark:border-gray-700">
      <Link 
        to="/admin_panel" 
        className="text-primary dark:text-primary hover:underline mb-6 inline-block flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>
      
      <h1 className="text-2xl font-bold mb-6 text-center text-text-primary dark:text-gray-100">
        Create New Question
      </h1>

      {/* Error Messages */}
      {coursesError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Failed to load courses and exams. 
            <button 
              onClick={() => refetchCourses()} 
              className="ml-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            No courses found. Please create courses first.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Question Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
            Question Text *
          </label>
          <textarea
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              if (errors.questionText) setErrors({...errors, questionText: ''});
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
              ${errors.questionText 
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                : 'border-border dark:border-gray-600 bg-white dark:bg-gray-700'
              }
              text-text-primary dark:text-gray-100
              focus:ring-primary dark:focus:ring-primary`}
            placeholder="Enter the question text..."
            rows="3"
          />
          {errors.questionText && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.questionText}
            </p>
          )}
        </div>

        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
            Course *
          </label>
          <select
            value={courseId}
            onChange={handleCourseChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
              ${errors.courseId 
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                : 'border-border dark:border-gray-600 bg-white dark:bg-gray-700'
              }
              text-text-primary dark:text-gray-100
              focus:ring-primary dark:focus:ring-primary`}
            disabled={courses.length === 0}
          >
            <option value="" className="text-gray-400">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id} className="text-text-primary dark:text-gray-100">
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.courseId}
            </p>
          )}
        </div>

        {/* Question Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
            Question Type *
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full px-4 py-3 border border-border dark:border-gray-600 rounded-lg 
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

        {/* Options for Multiple Choice */}
        {questionType === 'MULTIPLE_CHOICE' && (
          <div className="mb-6">
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
                    className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
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
              <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.options}
              </p>
            )}
          </div>
        )}

        {/* Correct Answer for non-MCQ */}
        {questionType !== 'MULTIPLE_CHOICE' && (
          <div className="mb-6">
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
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
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.correctAnswer}
              </p>
            )}
          </div>
        )}

        {/* Additional Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Category
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
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
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 border border-border dark:border-gray-600 rounded-lg 
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
        </div>

        {/* Points and Order Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Points */}
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
                ${errors.points 
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                  : 'border-border dark:border-gray-600 bg-white dark:bg-gray-700'
                }
                text-text-primary dark:text-gray-100
                focus:ring-primary dark:focus:ring-primary`}
              placeholder="e.g., 1.0, 2.5"
            />
            {errors.points && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.points}</p>
            )}
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
              Question Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-4 py-3 border border-border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-text-primary dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-gray-400">
            Upload Image (Optional)
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-border dark:border-gray-600 rounded-lg 
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
                  Image Preview:
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={creatingQuestion || courses.length === 0}
          className="w-full py-3.5 rounded-lg font-medium
                   bg-primary dark:bg-primary
                   text-white
                   hover:bg-primary-hover dark:hover:bg-primary-hover
                   focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                   dark:focus:ring-offset-gray-800
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center justify-center gap-2"
        >
          {creatingQuestion ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Question...
            </>
          ) : (
            'Create Question'
          )}
        </button>
      </form>

      {/* Display Course Questions */}
      {courseId && (
        <div className="mt-10 pt-8 border-t border-border dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
              Questions for {getCourseName(courseId)}
              <span className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-full 
                             bg-primary/10 dark:bg-primary/20 
                             text-primary dark:text-primary">
                {questions.length}
              </span>
            </h2>
            
            <button
              onClick={() => refetchQuestions()}
              disabled={isQuestionsLoading}
              className="text-sm px-3 py-1.5 rounded-md 
                       bg-gray-100 dark:bg-gray-700 
                       text-text-secondary dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-gray-600
                       transition-colors duration-200 flex items-center gap-1"
            >
              {isQuestionsLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
          
          {isQuestionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No questions created yet for this course.</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Create your first question using the form above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div 
                  key={question.id || index} 
                  className="p-5 border border-border dark:border-gray-700 rounded-xl 
                           bg-white dark:bg-gray-800/50 
                           hover:bg-gray-50 dark:hover:bg-gray-800/70
                           transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
                      {index + 1}. {question.questionText}
                    </h3>
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full
                        ${question.difficulty === 'easy' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : question.difficulty === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                        {question.difficulty}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full
                            bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {question.category}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full
                            bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        {question.points} pts
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary dark:text-gray-400 mb-4">
                    <div className="space-y-1">
                      <p><strong>Type:</strong> {question.questionType}</p>
                      <p><strong>Order:</strong> {question.order}</p>
                      <p><strong>Created:</strong> {new Date(question.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong>Used in exams:</strong> {question.examQuestions?.length || 0}</p>
                      <p><strong>ID:</strong> <span className="font-mono text-xs">{question.id}</span></p>
                    </div>
                  </div>

                  {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">Options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, i) => (
                          <div 
                            key={i} 
                            className={`p-3 rounded-lg border text-sm transition-all duration-200
                              ${option === question.correctAnswer 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300' 
                                : 'bg-gray-50 dark:bg-gray-800 border-border dark:border-gray-700 text-text-primary dark:text-gray-300'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{String.fromCharCode(65 + i)}.</span>
                                <span>{option}</span>
                              </div>
                              {option === question.correctAnswer && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.questionType !== 'MULTIPLE_CHOICE' && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">
                        Correct Answer:
                      </p>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-green-800 dark:text-green-300 font-medium">
                          {question.correctAnswer}
                        </p>
                      </div>
                    </div>
                  )}

                  {question.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                        Attached Image:
                      </p>
                      <img
                        src={`http://localhost:5000${question.imageUrl}`}
                        alt="Question"
                        className="max-w-full h-auto max-h-48 rounded-lg border border-border dark:border-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found';
                        }}
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

