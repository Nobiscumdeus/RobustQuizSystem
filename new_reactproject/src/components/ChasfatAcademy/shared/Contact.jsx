import Footer from "./Footer";
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";
import ScrollDownIcon from "../utility/ScrollDownIcon";

const Contact = () => {
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  return (
    <AnimatePresence>
      <div className={`min-h-screen ${
        darkMode 
          ? "bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900" 
          : "bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50"
      }`}>
        {/* Contact Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className={`px-4 py-20 ${
            darkMode ? "bg-black/20 text-gray-100" : "bg-white/40 text-gray-800"
          }`}
        >
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-8"
          >
            Get in Touch
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-center mb-6"
          >
            Have questions or feedback? We&apos;d love to hear from you! Fill out the form below and we&apos;ll get back to you shortly.
          </motion.p>

          {/* Contact Form */}
          <motion.form 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`${
              darkMode 
                ? "bg-gray-800/80 text-gray-100" 
                : "bg-white/60 text-gray-800 backdrop-blur-sm"
            } shadow-lg rounded-lg p-8 max-w-lg mx-auto`}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileFocus={{ scale: 1.02 }}
              className="mb-6"
            >
              <label className="block text-sm font-bold mb-2" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800"
                }`}
                placeholder="Your Name"
                required
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileFocus={{ scale: 1.02 }}
              className="mb-6"
            >
              <label className="block text-sm font-bold mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800"
                }`}
                placeholder="Your Email"
                required
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileFocus={{ scale: 1.02 }}
              className="mb-6"
            >
              <label className="block text-sm font-bold mb-2" htmlFor="message">Message</label>
              <textarea
                id="message"
                rows="4"
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800"
                }`}
                placeholder="Your Message"
                required
              ></textarea>
            </motion.div>

            <div className="flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send Message
              </motion.button>
            </div>
          </motion.form>
        </motion.section>
        
        <ScrollDownIcon />
        <Footer />
      </div>
    </AnimatePresence>
  );
};

export default Contact;