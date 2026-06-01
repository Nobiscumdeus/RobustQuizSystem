import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const TrialQuizResults = () => {
  const navigate = useNavigate();
  const { questions, score } = useSelector(state => state.trial_quiz);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const token = localStorage.getItem('token');

  // Determine performance level and color
  const getPerformance = () => {
    if (percentage >= 90) return { level: "Excellent", color: "success", emoji: "🏆" };
    if (percentage >= 75) return { level: "Good", color: "success", emoji: "🎯" };
    if (percentage >= 60) return { level: "Average", color: "warning", emoji: "👍" };
    return { level: "Needs Improvement", color: "error", emoji: "📚" };
  };

  const performance = getPerformance();

  useEffect(() => {
    if (percentage >= 80) {
      setShowConfetti(true);
      // Auto-hide confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [percentage]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-12 px-4"
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 1 }}
              animate={{ 
                y: window.innerHeight,
                rotate: Math.random() * 360,
                opacity: 0 
              }}
              transition={{ 
                duration: 2 + Math.random(),
                ease: "easeOut"
              }}
            >
              {["🎉", "✨", "🌟", "🎊"][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">
            Quiz Results
          </h1>
          <p className="text-text-secondary text-xl">
            Here&apos;s how you performed in the demo quiz
          </p>
        </div>

        {/* Main Results Card */}
        <div className="bg-surface border border-border rounded-2xl shadow-xl p-8 mb-8">
          {/* Performance Badge */}
          <div className={`inline-flex items-center px-6 py-2 rounded-full bg-${performance.color}/10 text-${performance.color} mb-8 mx-auto block w-fit`}>
            <span className="mr-2 text-xl">{performance.emoji}</span>
            <span className="font-bold">{performance.level} Performance</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center mb-12">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-64 h-64 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="var(--color-border)" 
                    strokeWidth="8"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={`rgb(var(--color-${performance.color}))`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (percentage / 100) * 283 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-5xl font-bold text-text-primary"
                  >
                    {percentage}%
                  </motion.span>
                  <span className="text-text-secondary mt-2">Overall Score</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                {[
                  { label: "Total Questions", value: totalQuestions, color: "primary" },
                  { label: "Correct Answers", value: score, color: "success" },
                  { label: "Incorrect Answers", value: totalQuestions - score, color: "error" },
                  { label: "Time Taken", value: "10:30", color: "info" }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 * index }}
                    className="flex justify-between items-center p-4 bg-surface-elevated border border-border rounded-xl hover:bg-background transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full bg-${stat.color} mr-3`}></div>
                      <span className="text-text-primary font-medium">{stat.label}</span>
                    </div>
                    <span className="text-text-primary font-bold text-lg">{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
              <span className="mr-3">📊</span> Detailed Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface-elevated border border-border rounded-xl p-6">
                <h4 className="font-bold text-text-primary mb-4">Strengths</h4>
                <ul className="space-y-2">
                  {questions.slice(0, 2).map((q, i) => (
                    <li key={i} className="text-text-primary flex items-center">
                      <span className="w-2 h-2 bg-success rounded-full mr-3"></span>
                      Question {i + 1}: {q.topic || "General Knowledge"}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-elevated border border-border rounded-xl p-6">
                <h4 className="font-bold text-text-primary mb-4">Areas to Improve</h4>
                <ul className="space-y-2">
                  {questions.slice(2, 4).map((q, i) => (
                    <li key={i} className="text-text-primary flex items-center">
                      <span className="w-2 h-2 bg-warning rounded-full mr-3"></span>
                      Question {i + 3}: {q.topic || "Advanced Concepts"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-border">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all shadow-lg"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </span>
            </motion.button>

            {token && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/manage')}
                className="px-8 py-3 bg-surface-elevated hover:bg-background border border-border text-text-primary font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all shadow"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Dashboard
                </span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/quizzes')}
              className="px-8 py-3 bg-info hover:bg-info/80 text-white font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-info/30 transition-all shadow-lg"
            >
              <span className="flex items-center justify-center">
                Explore More Quizzes
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </motion.button>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="text-center">
          <p className="text-text-secondary text-lg">
            {percentage >= 80 
              ? "🎉 Excellent work! You're mastering the material!"
              : percentage >= 60
              ? "👍 Good effort! Keep practicing to improve!"
              : "📚 Keep studying! Every attempt helps you learn more!"
            }
          </p>
          <p className="text-text-tertiary text-sm mt-2">
            Results are saved in your learning history
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TrialQuizResults;



