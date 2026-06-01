import { useDispatch } from "react-redux"
import { startQuiz } from "../../store/trial_quizSlice"
import { motion } from "framer-motion"

function TrialQuizStart() {
    const dispatch = useDispatch();

    const handleStartDemo = () => {
        dispatch(startQuiz({id: 'demo', title: 'Demo Quiz'}));
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12"
        >
            <div className="max-w-4xl w-full">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-4xl mb-6"
                    >
                        🚀
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-4">
                        Welcome to <span className="text-primary">QuizMaster</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Experience the future of learning with our interactive quiz platform
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-surface border border-border rounded-2xl shadow-xl p-8 md:p-12 mb-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div>
                            <h2 className="text-3xl font-bold text-text-primary mb-4">
                                Ready to Test Your Knowledge?
                            </h2>
                            <p className="text-text-secondary text-lg mb-6 leading-relaxed">
                                Take a quick demo quiz to explore all the amazing features of QuizMaster. 
                                Experience our intuitive interface, real-time feedback, and comprehensive 
                                analytics that make learning effective and enjoyable.
                            </p>
                            
                            {/* Features List */}
                            <ul className="space-y-3 mb-8">
                                {[
                                    "Interactive question interface",
                                    "Real-time progress tracking",
                                    "Instant feedback and explanations",
                                    "Time management tools",
                                    "Detailed performance analytics"
                                ].map((feature, index) => (
                                    <motion.li 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="flex items-center text-text-primary"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-3 flex-shrink-0">
                                            <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Content */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="bg-surface-elevated border border-border rounded-xl p-6 mb-6 w-full">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl mx-auto mb-4">
                                        📊
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary mb-2">
                                        Demo Quiz Preview
                                    </h3>
                                    <p className="text-text-secondary text-sm">
                                        Quick 10-minute trial
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    {[
                                        { label: "Questions", value: "10" },
                                        { label: "Duration", value: "10 mins" },
                                        { label: "Type", value: "Multiple Choice" },
                                        { label: "Difficulty", value: "Mixed" }
                                    ].map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-border/50">
                                            <span className="text-text-secondary">{item.label}</span>
                                            <span className="font-semibold text-text-primary">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Start Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartDemo}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all shadow-lg text-lg"
                            >
                                <span className="flex items-center justify-center">
                                    Start Demo Quiz
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: "🎯",
                            title: "No Registration Required",
                            description: "Start immediately with our demo quiz"
                        },
                        {
                            icon: "🔄",
                            title: "Try Multiple Times",
                            description: "Practice until you're confident"
                        },
                        {
                            icon: "📈",
                            title: "Track Progress",
                            description: "See your improvement over time"
                        }
                    ].map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                            className="bg-surface border border-border rounded-xl p-6 text-center"
                        >
                            <div className="text-3xl mb-3">{item.icon}</div>
                            <h4 className="font-bold text-text-primary mb-2">{item.title}</h4>
                            <p className="text-text-secondary text-sm">{item.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Note */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-12 pt-8 border-t border-border"
                >
                    <p className="text-text-secondary text-sm">
                        Need help? Check out our{" "}
                        <a href="#" className="text-primary hover:text-primary-hover font-medium">
                            tutorial guide
                        </a>{" "}
                        or{" "}
                        <a href="#" className="text-primary hover:text-primary-hover font-medium">
                            contact support
                        </a>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default TrialQuizStart

