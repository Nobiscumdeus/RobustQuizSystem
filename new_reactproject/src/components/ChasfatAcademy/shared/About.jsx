import APP_CONFIG from '@/config/appConfig';
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "./Footer";
import { Link } from "react-router-dom";

import ScrollDownIcon from "../utility/ScrollDownIcon";

const buttonVariants = {
  visible: {
    x: [0, -20, 20, -20, 20, 0],
    transition: {
      delay: 2,
    }
  },
  hover: {
    scale: 1.1,
    textShadow: '0px 0px 8px rgb(255,255,255)',
    boxShadow: '0px 0px 8px rgb(255,255,255)',
  }
}

const AboutPage = () => {
 
  
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
  };

  const scaleUp = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <AnimatePresence>
      {/* Use our theme colors - NO conditionals */}
      <div className="min-h-screen bg-gradient-background">
        {/* Sticky Navigation Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="top-16 left-0 w-full z-50 p-4 flex justify-center space-x-4 bg-surface/50 backdrop-blur-sm shadow-md"
        >
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            animate="visible"
            onClick={() => scrollToSection(aboutRef)}
            className="px-4 py-2 rounded-md bg-primary/20 text-primary hover:bg-primary/30 backdrop-blur-sm"
          >
            About Us
          </motion.button>
          <button
            onClick={() => scrollToSection(featuresRef)}
            className="px-4 py-2 rounded-md bg-primary/20 text-primary hover:bg-primary/30 backdrop-blur-sm"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection(teamRef)}
            className="px-4 py-2 rounded-md bg-primary/20 text-primary hover:bg-primary/30 backdrop-blur-sm"
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
          className="px-4 py-20 bg-surface/30"
        >
          <div className="container mx-auto max-w-4xl">
            <motion.h2
              variants={fadeIn}
              className="text-4xl font-bold text-center mb-8 text-text-primary"
            >
              About Us
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-center mb-6 text-text-secondary"
            >
              At <span className="font-bold text-primary">{APP_CONFIG.name}</span>, our mission is to enhance the educational experience through interactive quizzes
              that make learning engaging and effective. We believe that assessment should be fun, informative, and
              tailored to individual learning paths.
            </motion.p>
            <motion.p
              variants={fadeIn}
              className="text-lg text-center mb-8 text-text-secondary"
            >
              Our platform offers a wide range of courses, allowing students to test their knowledge and skills in
              various subjects, from anatomy to physics.
            </motion.p>
            
            {/* Mission/Values Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { title: "Mission", desc: "Make learning engaging through interactive assessment" },
                { title: "Vision", desc: "Become the leading digital examination platform" },
                { title: "Values", desc: "Innovation, Accessibility, Excellence" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={scaleUp}
                  className="bg-surface border border-border rounded-xl p-6 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                  <p className="text-text-secondary">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          ref={featuresRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20 bg-background"
        >
          <div className="container mx-auto px-4">
            <motion.h3
              variants={fadeIn}
              className="text-3xl font-bold text-center mb-12 text-text-primary"
            >
              Why Choose {APP_CONFIG.name}?
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              {[
                { 
                  title: "Interactive Quizzes", 
                  desc: "Engaging, real-time assessments with instant feedback",
                  icon: "🎯"
                },
                { 
                  title: "Wide Range of Subjects", 
                  desc: "From anatomy to statistics, we cover all major disciplines",
                  icon: "📚"
                },
                { 
                  title: "Real-time Feedback", 
                  desc: "Immediate results with detailed explanations",
                  icon: "⚡"
                },
                { 
                  title: "User-Friendly Interface", 
                  desc: "Intuitive design for seamless navigation",
                  icon: "✨"
                },
                { 
                  title: "Progress Tracking", 
                  desc: "Monitor your learning journey with analytics",
                  icon: "📈"
                },
                { 
                  title: "24/7 Support", 
                  desc: "Round-the-clock assistance for all users",
                  icon: "🛡️"
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={scaleUp}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="bg-surface border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h4>
                  <p className="text-text-secondary">{feature.desc}</p>
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
          className="py-20 bg-gradient-primary text-white"
        >
          <div className="container mx-auto px-4">
            <motion.h3
              variants={fadeIn}
              className="text-3xl font-bold text-center mb-12"
            >
              Meet Our Team
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team Member Cards */}
              {[
                { 
                  name: "Dr. Sarah Chen", 
                  role: "Lead Educator", 
                  bio: "PhD in Educational Technology with 10+ years experience",
                  avatar: "👩‍🏫"
                },
                { 
                  name: "Marcus Johnson", 
                  role: "CTO", 
                  bio: "Software architect specializing in scalable ed-tech platforms",
                  avatar: "👨‍💻"
                },
                { 
                  name: "Aisha Mohammed", 
                  role: "UX Designer", 
                  bio: "Creating intuitive learning experiences for diverse users",
                  avatar: "👩‍🎨"
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  variants={scaleUp}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
                >
                  <div className="text-5xl mb-4">{member.avatar}</div>
                  <h4 className="text-2xl font-bold mb-2">{member.name}</h4>
                  <p className="text-blue-800 font-semibold mb-3">{member.role}</p>
                  <p className="text-white/80">{member.bio}</p>
                </motion.div>
              ))}
            </div>
            
            {/* Call to Action */}
            <motion.div
              variants={fadeIn}
              className="text-center mt-16"
            >
              <h4 className="text-2xl font-bold mb-6">Ready to Start Learning?</h4>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already enhancing their knowledge with QuizMaster.
              </p>
              <Link to="/register" className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-colors">
                Get Started Now
              </Link>
            </motion.div>
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

