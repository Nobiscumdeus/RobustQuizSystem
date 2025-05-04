import { useState } from "react";
//import { useSelector, useDispatch } from 'react-redux';
import TrialExamHeader from "./TrialExamHeader";
import TrialQuestionNavigation from "./TrialQuestionNavigation";
import EnhancedQuizQuestion from "./TrialQuizQuestionEnhanced";
import TrialQuizResult from "./TrialQuizResult";

import ScrollDownIcon from "../utility/ScrollDownIcon";

import { motion } from "framer-motion";

import CalculatorModal from "../utility/CalculatorModal";

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { delay: 0.5, duration: 0.5 },
  },
  exit: {
    x: "-100vw",
    transition: { ease: "easeInOut" },
  },
};

const TrialQuizDemo = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // const { questions, answers, score } = useSelector(state => state.trial_quiz);

  //Calculator
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false); // State to control modal visibility

  const openCalculator = () => {
    setIsCalculatorOpen(true); // Open the calculator modal
  };

  const closeCalculator = () => {
    setIsCalculatorOpen(false); // Close the calculator modal
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return <TrialQuizResult />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <TrialExamHeader />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Content: Quiz Questions */}
          <div className="col-span-1 md:col-span-3">
            <EnhancedQuizQuestion />
          </div>

          {/* Sidebar: Question Navigation and Submit */}
          <div className="col-span-1 space-y-6">
            <TrialQuestionNavigation />

            <button
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              onClick={handleSubmit}
            >
              Submit Exam
            </button>

            {/* Calculator functionality */}
            <button
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              onClick={openCalculator} // Open the calculator
            >
              Use Calculator
            </button>
          </div>
        </div>
      </div>

       {/* Calculator Modal */}
      <CalculatorModal isOpen={isCalculatorOpen} onClose={closeCalculator} />

      <ScrollDownIcon />
    </motion.div>
  );
};

export default TrialQuizDemo;
