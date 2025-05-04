import { useSelector, useDispatch } from "react-redux"
import { setCurrentQuestion } from "../../../features/ChasfatAcademy/trial_quiz/trial_quizSlice";

function TrialQuestionNavigation() {
    const dispatch = useDispatch();
    const { currentQuestion, questions, answers } = useSelector(state => state.trial_quiz);

    // Helper function to check if question is answered
    const isQuestionAnswered = (questionId) => {
        return Boolean(answers[questionId]);
    };

    return (
        <div className="bg-white shadow-md p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                    const isAnswered = isQuestionAnswered(question.id);
                    return (
                        <button
                            key={question.id}
                            onClick={() => dispatch(setCurrentQuestion(index))}
                            className={`
                                p-3 rounded-lg font-medium
                                ${currentQuestion === index ? 'ring-2 ring-blue-500' : ''}
                                ${isAnswered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                            `}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default TrialQuestionNavigation