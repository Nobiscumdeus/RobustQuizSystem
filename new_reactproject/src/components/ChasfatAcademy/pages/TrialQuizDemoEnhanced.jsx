import { useState } from "react";
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
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const openCalculator = () => {
    setIsCalculatorOpen(true);
  };

  const closeCalculator = () => {
    setIsCalculatorOpen(false);
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
      className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8"
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

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 transition-all shadow-lg"
              onClick={handleSubmit}
            >
              Submit Exam
            </motion.button>

            {/* Calculator Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-warning hover:bg-warning/80 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 transition-all shadow-lg"
              onClick={openCalculator}
            >
              Use Calculator
            </motion.button>

            {/* Help/Notes Section */}
            <div className="bg-surface border border-border rounded-xl p-4 mt-4">
              <h3 className="text-text-primary font-bold text-lg mb-2 flex items-center">
                <span className="mr-2">💡</span> Exam Tips
              </h3>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• Review all questions before submitting</li>
                <li>• Flag questions you&apos;re unsure about</li>
                <li>• Use the calculator for calculations</li>
                <li>• Manage your time effectively</li>
              </ul>
            </div>

            {/* Timer/Progress (Optional) */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary text-sm">Time Remaining</span>
                <span className="text-text-primary font-bold">45:23</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: '65%' }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-text-secondary text-sm">Questions</span>
                <span className="text-text-primary font-bold">12/50</span>
              </div>
            </div>
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

