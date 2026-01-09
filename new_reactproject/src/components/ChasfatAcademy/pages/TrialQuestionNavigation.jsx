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
        <div className="bg-surface border border-border shadow-md p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Question Navigation</h3>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-success mr-1"></div>
                        <span className="text-xs text-text-secondary">Answered</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-surface-elevated border border-border mr-1"></div>
                        <span className="text-xs text-text-secondary">Unanswered</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
                {questions.map((question, index) => {
                    const isAnswered = isQuestionAnswered(question.id);
                    const isCurrent = currentQuestion === index;
                    
                    return (
                        <button
                            key={question.id}
                            onClick={() => dispatch(setCurrentQuestion(index))}
                            className={`
                                relative p-3 rounded-lg font-bold transition-all duration-200
                                ${isCurrent 
                                    ? 'ring-2 ring-primary shadow-lg transform scale-105' 
                                    : 'hover:scale-105 hover:shadow-md'
                                }
                                ${isAnswered 
                                    ? 'bg-success text-white hover:bg-success/80' 
                                    : 'bg-surface-elevated text-text-primary border border-border hover:bg-background'
                                }
                            `}
                            aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ', unanswered'}`}
                        >
                            {index + 1}
                            {/* Current question indicator */}
                            {isCurrent && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                    <div className="text-text-primary">
                        <span className="font-bold">Total:</span> {questions.length} questions
                    </div>
                    <div className="text-success">
                        <span className="font-bold">Answered:</span> {Object.keys(answers).length}
                    </div>
                    <div className="text-text-secondary">
                        <span className="font-bold">Remaining:</span> {questions.length - Object.keys(answers).length}
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>Progress</span>
                        <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                        <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ 
                                width: `${(Object.keys(answers).length / questions.length) * 100}%` 
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrialQuestionNavigation;


/*
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

*/