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
