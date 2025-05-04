import { useDispatch } from "react-redux"
import { startQuiz } from "../../store/trial_quizSlice"

function TrialQuizStart() {

    const dispatch=useDispatch();

    const handleStartDemo=()=>{
        dispatch(startQuiz({id:'demo',title:'Demo Quiz'}));
    }
  return (
    <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4"> Wecome to Quiz Master</h2>
        <p className="mb-4">Take a quick demo quiz to understand how the platform works</p>
        <button onClick={handleStartDemo} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">

            Start Demo Quiz            

        </button>
      
    </div>
  )
}

export default TrialQuizStart
