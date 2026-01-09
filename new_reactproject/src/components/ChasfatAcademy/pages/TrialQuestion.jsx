import { useSelector, useDispatch } from "react-redux"
import { submitAnswer, nextQuestion } from "../../store/trial_quizSlice"
import { motion } from "framer-motion"

function TrialQuizQuestion() {
    const dispatch = useDispatch();
    const { questions, currentQuestion, answers } = useSelector(state => state.trial_quiz);
    const question = questions[currentQuestion];
    const currentAnswer = answers[question.id];

    const handleAnswer = (answer) => {
        dispatch(submitAnswer(answer));
        if (currentQuestion < questions.length - 1) {
            setTimeout(() => {
                dispatch(nextQuestion());
            }, 500); // Small delay for feedback
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto p-4 md:p-6"
        >
            {/* Question Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                            <span className="text-primary font-bold">
                                {currentQuestion + 1}
                            </span>
                        </div>
                        <span className="text-text-secondary text-sm">
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="hidden md:block w-32">
                        <div className="text-xs text-text-secondary mb-1 text-right">
                            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                            <motion.div 
                                className="bg-primary h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ 
                                    width: `${((currentQuestion + 1) / questions.length) * 100}%` 
                                }}
                                transition={{ duration: 0.5 }}
                            ></motion.div>
                        </div>
                    </div>
                </div>
                
                {/* Question Text */}
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight">
                    {question.questionText}
                </h3>
                
                {/* Question Type & Difficulty */}
                {question.type && (
                    <div className="flex items-center mt-4 space-x-3">
                        <span className="text-xs bg-surface-elevated text-text-secondary px-3 py-1 rounded-full border border-border">
                            {question.type}
                        </span>
                        {question.difficulty && (
                            <span className={`
                                text-xs px-3 py-1 rounded-full
                                ${question.difficulty === 'Easy' ? 'bg-success/10 text-success' : ''}
                                ${question.difficulty === 'Medium' ? 'bg-warning/10 text-warning' : ''}
                                ${question.difficulty === 'Hard' ? 'bg-error/10 text-error' : ''}
                            `}>
                                {question.difficulty}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
                {question.answers.map((answer, index) => {
                    const isSelected = currentAnswer?.id === answer.id;
                    const answerLetter = String.fromCharCode(65 + index); // A, B, C, D
                    
                    return (
                        <motion.button
                            key={answer.id}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAnswer(answer)}
                            className={`
                                w-full text-left p-5 rounded-xl border 
                                transition-all duration-200
                                flex items-center
                                ${isSelected 
                                    ? 'bg-primary/10 border-primary shadow-md' 
                                    : 'border-border hover:bg-surface-elevated hover:shadow-sm'
                                }
                            `}
                        >
                            {/* Answer Letter Indicator */}
                            <div className={`
                                flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-bold
                                ${isSelected 
                                    ? 'bg-primary text-white' 
                                    : 'bg-surface-elevated text-text-secondary'
                                }
                            `}>
                                {answerLetter}
                            </div>
                            
                            {/* Answer Text */}
                            <div className="flex-1">
                                <span className={`
                                    text-lg font-medium
                                    ${isSelected ? 'text-text-primary' : 'text-text-primary'}
                                `}>
                                    {answer.answerText}
                                </span>
                            </div>
                            
                            {/* Selection Indicator */}
                            {isSelected && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-4 flex-shrink-0"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <svg 
                                            className="w-3 h-3 text-white" 
                                            fill="currentColor" 
                                            viewBox="0 0 20 20"
                                        >
                                            <path 
                                                fillRule="evenodd" 
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                                clipRule="evenodd" 
                                            />
                                        </svg>
                                    </div>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Navigation & Feedback */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
                {/* Selection Feedback */}
                {currentAnswer ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center text-success"
                    >
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium">Answer selected ✓</span>
                    </motion.div>
                ) : (
                    <div className="text-text-secondary text-sm">
                        Select an answer to continue
                    </div>
                )}
                
                {/* Next Question Status */}
                <div className="text-right">
                    <div className="text-text-secondary text-sm mb-1">
                        {currentQuestion === questions.length - 1 ? 'Final question' : `${questions.length - currentQuestion - 1} more to go`}
                    </div>
                    {currentAnswer && currentQuestion < questions.length - 1 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-primary text-sm font-medium"
                        >
                            Next question loading...
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Question Hint (Optional) */}
            {question.hint && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 bg-surface-elevated border border-border rounded-xl"
                >
                    <div className="flex items-center text-info mb-2">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Hint</span>
                    </div>
                    <p className="text-text-secondary text-sm">{question.hint}</p>
                </motion.div>
            )}
        </motion.div>
    );
}

export default TrialQuizQuestion;

/*
import { useSelector,useDispatch } from "react-redux"
import { submitAnswer,nextQuestion } from "../../store/trial_quizSlice"


function TrialQuizQuestion() {

    const dispatch=useDispatch();
    const { questions,currentQuestion} = useSelector(state=>state.trial_quiz);
    const question=questions[currentQuestion];

    const handleAnswer=(answer)=>{
        dispatch(submitAnswer(answer));
        dispatch(nextQuestion());
    }

  return (
    <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
            <span className="text-sm text-gray-500">
                Question {currentQuestion +1} of { questions.length}
            </span>
            <h3 className="text-xl font-semibold mt-2"> {question.questionText} </h3>
        </div>

        <div className="space-y-4">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => handleAnswer(answer)}
            className="w-full text-left p-4 border rounded hover:bg-gray-50"
          >
            {answer.answerText}
          </button>
        ))}
          
        </div>
      
    </div>
  )
}

export default TrialQuizQuestion


*/