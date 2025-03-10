import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const TrialQuizResults = () => {
  const navigate = useNavigate();
  const { questions,  score } = useSelector(state => state.trial_quiz);
  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const token=localStorage.getItem('token');
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Quiz Results</h1>
          
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 rounded-full border-8 border-blue-500 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl font-bold text-blue-500">{percentage}%</span>
                <p className="text-gray-500">Score</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
              <span>Total Questions</span>
              <span className="font-semibold">{totalQuestions}</span>
            </div>
            <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
              <span>Correct Answers</span>
              <span className="font-semibold">{score}</span>
            </div>
            <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
              <span>Incorrect Answers</span>
              <span className="font-semibold">{totalQuestions - score}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>

            {token && (
                 <button
                 onClick={() => navigate('/manage')}
                 className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
               >
                 Back to Dashboard
               </button>

            )}
         
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialQuizResults;