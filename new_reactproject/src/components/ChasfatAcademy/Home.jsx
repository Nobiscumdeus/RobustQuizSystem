import { Link } from "react-router-dom";

import Footer from "@components/ChasfatAcademy/shared/Footer";
import { motion } from "framer-motion";
import ScrollDownIcon from "@/components/ChasfatAcademy/utility/ScrollDownIcon";

const Home = () => {


  const courses = [
    {
      title: "Anatomy",
      description: "Study of structure in relation to function of the human body",
    },
    { 
      title: "Statistics", 
      description: "Master data analysis and statistical methods" 
    },
    { 
      title: "Pharmacology", 
      description: "Understanding drugs and their effects on the body" 
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: "This platform has improved my learning experience!",
      user: "Rachel Adebola",
    },
    { 
      id: 2, 
      text: "I love the interactive quizzes!", 
      user: "Bamidele Muyiwa" 
    },
    {
      id: 3,
      text: "Highly recommend for anyone looking to learn better!",
      user: "Theodore James",
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: '-100vw' }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Hero Section with Gradient */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-gradient-primary text-white text-center py-20 px-4 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            QuizMaster - Digital Examination Platform
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-xl mb-12 text-white/90"
          >
            Choose your path below
          </motion.p>

          {/* Dual Path Cards */}
          <motion.div
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {/* Student Path */}
            <motion.div 
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-4">Taking an Exam?</h3>
              <p className="mb-6 text-white/80">Access your assigned examinations</p>
              
              <Link
                to="/quiz_demo"
                className="block w-full bg-success hover:bg-success/90 text-white py-3 px-6 rounded-lg font-semibold text-center mb-3 transition-colors shadow-lg"
              >
                Try Sample Quiz
              </Link>
              
              <Link
                to="/student_exam_login"
                className="block w-full border-2 border-white text-white hover:bg-white hover:text-primary py-3 px-6 rounded-lg font-semibold text-center transition-colors"
              >
                Student Login
              </Link>
            </motion.div>

            {/* Examiner Path */}
            <motion.div 
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-4">Creating Exams?</h3>
              <p className="mb-6 text-white/80">Login to manage your examinations</p>
              
              <Link
                to="/login"
                className="block w-full bg-secondary hover:bg-secondary/90 text-white py-3 px-6 rounded-lg font-semibold text-center mb-3 transition-colors shadow-lg"
              >
                Examiner Login
              </Link>
              
              <Link
                to="/register"
                className="block w-full border-2 border-white text-white hover:bg-white hover:text-primary py-3 px-6 rounded-lg font-semibold text-center transition-colors"
              >
                Create Account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Courses Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        id="courses"
        className="container mx-auto px-4 py-20"
      >
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
          Featured Courses
        </h3>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.map((course, index) => (
            <motion.div
              key={index}
              variants={{ 
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-surface border border-border rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all"
            >
              <h4 className="text-xl font-bold text-text-primary mb-3">{course.title}</h4>
              <p className="text-text-secondary mb-6">{course.description}</p>
              <Link
                to="/quiz_demo"
                className="block bg-primary hover:bg-primary-hover text-white text-center py-2.5 rounded-lg font-semibold transition-colors"
              >
                Start Quiz
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-surface-elevated py-20"
      >
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
          }}
          className="container mx-auto px-4"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', text: 'Sign up for an account' },
              { step: '2', text: 'Choose a course' },
              { step: '3', text: 'Take quizzes to assess your knowledge' }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <p className="text-text-secondary text-lg">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 py-20"
      >
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
          What Our Users Say
        </h3>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-surface border border-border rounded-2xl shadow-lg p-6 transition-all"
            >
              <p className="italic text-text-secondary mb-4">&apos;{testimonial.text}&apos;</p>
              <p className="font-semibold text-text-primary">— {testimonial.user}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
     
      <ScrollDownIcon />
      <Footer />
    </motion.div>
  );
};

export default Home;
