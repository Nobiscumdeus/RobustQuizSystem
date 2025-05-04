import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "./shared/Footer";
import { motion } from "framer-motion";
import ScrollDownIcon from "./utility/ScrollDownIcon";


const Home = () => {
 

  const darkMode = useSelector((state) => state.darkMode.darkMode); // Access the dark mode state

  // Sample course data
  const courses = [
    {
      title: "Anatomy",
      description:
        "Study of structure in relation to function  of the human body ",
    },
    { title: "Statistics", description: "Brief description of course 2" },
    { title: "Pharmacology", description: "Brief description of course 3" },
  ];

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      text: "This platform has improved my learning experience!",
      user: "Rachel Adebola",
    },
    { id: 2, text: "I love the interactive quizzes!", user: "Bamidele Muyiwa" },
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
    exit={{ opacity: 0,x:'-100vw' }}
    transition={{ duration: 0.5 }}
    
    className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Hero Section */}
      <motion.section
       initial={{ opacity: 0, y: 50 }}
       whileInView={{ opacity: 1, y: 0 }}
       transition={{ duration: 1 }}

        className={`text-white text-center py-20 ${
          darkMode ? "bg-gray-800" : "bg-blue-600"
        }`}
      >
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold"
        >
          Elevate Your Knowledge with Interactive Quizzes
        </motion.h2>

        <motion.p 
        initial={{opacity:0,y:50}}
        animate={{ opacity:1,y:0}}
        transition={{ duration:1, delay:0.5}}


        className="mt-4 text-lg">
          Join us to enhance your learning experience!
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 50 }} //Initial state taken off screen
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Link
            to="/quiz_demo"
            className={`py-2 px-4 rounded-md font-semibold shadow-md  ${
              darkMode
                ? "bg-transparent text-gray-100 border  "
                : "bg-white text-blue-600"
            }  `}
          >
            Quiz Trial
          </Link>

          <a
            href="#courses"
            className={`ml-4 ${
              darkMode
                ? "bg-transparent border-gray-100 text-gray-100"
                : "bg-white  border-blue-600 text-blue-600"
            } border py-2 px-4 rounded-md font-semibold`}
          >
            View Courses
          </a>
        </motion.div>
      </motion.section>

      {/* Featured Courses Section */}
      <motion.section
       initial={{ opacity: 0, y: 50 }}
       whileInView={{ opacity: 1, y: 0 }}
       transition={{ duration: 1 }}


        id="courses"
        className={`container mx-auto px-4 py-20 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        <h3 className="text-3xl font-bold text-center mb-8">
          Featured Courses
        </h3>


        <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
            hidden:{opacity:0},
            visible:{opacity:1,transition:{staggerChildren:0.2 }}
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              variants={{ 
                hidden:{opacity:0,y:50},
                visible:{opacity:1,y:0},
              }}
              whileHover={{ scale:1.05}}
              className={`rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105 ${
                darkMode
                  ? "bg-gray-800 text-gray-100"
                  : "bg-white text-gray-900"
              }`}
            >
              <h4 className="text-xl font-semibold">{course.title}</h4>
              <p className="mt-2">{course.description}</p>
              <a
                href="quiz_demo"
                className={`mt-4 block ${
                  darkMode ? "bg-gray-800" : "bg-blue-600"
                } text-white text-center py-2 rounded-md`}
              >
                Start Quiz
              </a>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>


      {/* How It Works Section */}
      <motion.section
       initial={{ opacity: 0, y: 50 }}
       whileInView={{ opacity: 1, y: 0 }}
       transition={{ duration: 1 }}
        className={`py-20 ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-900"
        }`}
      >
        <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
        }}
        
        
        className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-8">How It Works</h3>
          <div className="text-center space-y-4">
            <motion.p
             variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >1. Sign up for an account.</motion.p>
            <motion.p
             variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >2. Choose a course.</motion.p>
            <motion.p
             variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >3. Take quizzes to assess your knowledge.</motion.p>
          </div>
        </motion.div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
       initial={{ opacity: 0, y: 50 }}
       whileInView={{ opacity: 1, y: 0 }}
       transition={{ duration: 1 }}
        className={`container mx-auto px-4 py-20 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        <h3 className="text-3xl font-bold text-center mb-8">
          What Our Users Say
        </h3>
        <motion.div 
         initial="hidden"
         animate="visible"
         variants={{
           hidden: { opacity: 0 },
           visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
         }}
        
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              className={`rounded-lg shadow-lg p-4 ${
                darkMode
                  ? "bg-gray-800 text-gray-100"
                  : "bg-white text-gray-900"
              }`}
            >
              <p className="italic">{testimonial.text}</p>
              <p className="mt-2 font-semibold">- {testimonial.user}</p>
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
