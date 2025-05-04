import { useSelector, useDispatch } from 'react-redux';
import {submitAnswer, nextQuestion, prevQuestion} from "../../../features/ChasfatAcademy/trial_quiz/trial_quizSlice";


const EnhancedQuizQuestion = () => {
  const dispatch = useDispatch();
  const { questions, currentQuestion, answers } = useSelector(state => state.trial_quiz);
  const question = questions[currentQuestion];

  // Get answer for current question using question.id
  const currentQuestionAnswer = answers[question.id];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          {question.questionText}
        </h3>
      </div>

      <div className="space-y-3">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => dispatch(submitAnswer(answer))}
            className={`
              w-full text-left p-4 rounded-lg border
              transition-all duration-200
              ${currentQuestionAnswer?.id === answer.id 
                ? 'bg-blue-50 border-blue-500' 
                : 'hover:bg-gray-50 border-gray-200'}
            `}
          >
            {answer.answerText}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => dispatch(prevQuestion())}
          disabled={currentQuestion === 0}
          className="px-4 py-2 text-blue-600 disabled:text-gray-400"
        >
          Previous
        </button>
        <button
          onClick={() => dispatch(nextQuestion())}
          disabled={currentQuestion === questions.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EnhancedQuizQuestion;