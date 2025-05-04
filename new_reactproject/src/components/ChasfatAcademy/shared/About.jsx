import { useRef } from "react";
import { motion,AnimatePresence } from "framer-motion"; // Import motion from Framer Motion
import Footer from "./Footer";
import { useSelector } from "react-redux";
import ScrollDownIcon from "../utility/ScrollDownIcon";

const buttonVariants={
  visible:{
    x:[0,-20,20,-20,20,0],
    transition:{
      delay:2,
    }

  },
  hover:{
    scale:1.1,
    textShadow:'0px 0px 8px rgb(255,255,255)',
    boxShadow:'0px 0px 0px 8px rgb(255,255,255)',
  }
}

const AboutPage = () => {
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  // Create refs for each section
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const teamRef = useRef(null);

  // Function to scroll to a specific section
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    
    visible: { opacity: 1, transition: { duration: 0.8 } },
    scale:[1,1.1,1,1.1,1,1.1,1],
  };

  const scaleUp = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6 } },
  };

 

  return (
    <AnimatePresence>
    <div className={`${darkMode ? "bg-gray-900" : "bg-gray-100"} min-h-screen`}>
      {/* Sticky Navigation Bar */}
      <motion.div
     
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className={`top-16 left-0 w-full z-50 p-4 flex justify-center space-x-4 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <motion.button
        variants={buttonVariants}
        whileHover="hover"
        animate="visible"
        
          onClick={() => scrollToSection(aboutRef)}
          className={`px-4 py-2 rounded-md ${
            darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"
          }`}
        >
          About Us
        </motion.button>
        <button
          onClick={() => scrollToSection(featuresRef)}
          className={`px-4 py-2 rounded-md ${
            darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"
          }`}
        >
          Features
        </button>
        <button
          onClick={() => scrollToSection(teamRef)}
          className={`px-4 py-2 rounded-md ${
            darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"
          }`}
        >
          Meet Our Team
        </button>
      </motion.div>

      {/* About Section */}
      <motion.section
        ref={aboutRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className={`px-4 py-10 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
      >
        <motion.h2

          variants={fadeIn}
          className="text-4xl font-bold text-center mb-8"
        >
          About Us
        </motion.h2>
        <motion.p
          variants={fadeIn}
          className="text-lg text-center mb-6"
        >
          At Chasfat Academy, our mission is to enhance the educational experience through interactive quizzes
          that make learning engaging and effective. We believe that assessment should be fun, informative, and
          tailored to individual learning paths.
        </motion.p>
        <motion.p
          variants={fadeIn}
          className="text-lg text-center mb-8"
        >
          Our platform offers a wide range of courses, allowing students to test their knowledge and skills in
          various subjects, from anatomy to physics.
        </motion.p>
      </motion.section>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className={`py-20 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"}`}
      >
        <div className="container mx-auto px-4">
          <motion.h3
            variants={fadeIn}
            className="text-3xl font-bold text-center mb-8"
          >
            Features
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              "Interactive Quizzes",
              "Wide Range of Subjects",
              "Real-time Feedback",
              "User-Friendly Interface",
              "Track Progress",
              "Community Support",
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleUp}
                whileHover="hover"
                whileInView="visible"
                viewport={{ once: true }}
                className={`rounded-lg shadow-lg p-6 ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                }`}
              >
                <h4 className="text-xl font-semibold">{feature}</h4>
                <p className="mt-2">Description of {feature.toLowerCase()}.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        ref={teamRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className={`px-4 py-20 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}
      >
        <motion.h3
          variants={fadeIn}
          className="text-3xl font-bold text-center mb-8"
        >
          Meet Our Team
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member Cards */}
          {[1, 2, 3].map((member) => (
            <motion.div
              key={member}
              variants={scaleUp}
              whileHover="hover"
              whileInView="visible"
              viewport={{ once: true }}
              className={`rounded-lg shadow-lg p-6 ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
              }`}
            >
              <h4 className="text-xl font-semibold">Team Member {member}</h4>
              <p className="mt-2">Role - Brief description about the team member.</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Scroll Down Icon */}
      <ScrollDownIcon />

      {/* Footer */}
      <Footer />
    </div>
    </AnimatePresence>
  );
};

export default AboutPage;