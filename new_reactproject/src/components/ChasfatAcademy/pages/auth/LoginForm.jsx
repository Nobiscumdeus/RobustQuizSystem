import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { useNavigate, Link,useLocation} from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../shared/Footer";
import ScrollDownIcon from "../../utility/ScrollDownIcon";
import { useState } from "react";
import { motion } from "framer-motion";
import { setLoggedIn } from "../../utility/auth";

import { toast } from "react-toastify";
// Animation variants for entrance and exit
/*
const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,

    transition: {
      type: "spring",
      when: "beforeChildren",
      staggerChildren: 0.4,
      delay: 0.5,
    },
  },
  exit: {
    x: "-50vw", // Slide off to the left when exiting
    opacity: 0, // Fade out
    transition: {
      ease: "easeInOut",
      duration: 1, // Smooth transition duration for exit
    },
  },
};
*/
// Replace containerVariants with:
const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20, // Small upward movement instead of just opacity
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.6,
      bounce: 0.3,
      // Remove delay, staggerChildren, and when
    },
  },
  exit: {
    x: "-50vw",
    opacity: 0,
    transition: {
      ease: "easeInOut",
      duration: 0.8, // Slightly faster exit
    },
  },
};



const LoginForm = () => {
  const navigate = useNavigate();
  const location=useLocation();


  const darkMode = useSelector((state) => state.darkMode.darkMode);
  // const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  //Redirect function

  //const from =location.state?.from || '/admin_panel'
       
  // This line is extracting data from the state that was passed during navigation
  const { from = "/admin_panel", message } = location.state || {};

    const handleSuccessfulLogin = () => {
   navigate(from, { replace: true });
   setLoggedIn();
    };



  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true); // Start loading
    try {
      const response = await axios.post("http://localhost:5000/login", values);
      localStorage.setItem("token", response.data.token); // Store JWT token

       // navigate('/welcome'); // Redirect after login
    handleSuccessfulLogin(); //Redirect after login

    } catch (error) {
      // Handle server errors
      if (error.response && error.response.data) {
        //  setServerError(error.response.data.message || 'Login failed. Please try again.');
        toast.error("Login failed, please try again. ");
      } else {
        //   setServerError('An unexpected error occurred. Please try again.');
        toast.error("An unexpected error occurred. Please try again. ");
      }
    } finally {
      setIsSubmitting(false); // Stop loading
      resetForm(); // Clear form fields
    }
  };

  return (
    <>
      
        <div
         
          className={`w-full flex flex-col items-center justify-center min-h-screen ${
            darkMode ? "bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900" : "bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600"
          }`}

         
        >
          <motion.div
           key="login-form" // Unique key for AnimatePresence
          initial={{opacity:0,x:100}}
        animate={{opacity:1,x:0}}
        type={{ type:'inertia',delay:0.5}}
          variants={containerVariants}
      
          exit="exit"
         
            className={`${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            } shadow-lg rounded-lg p-8 max-w-md w-full`}
          >
            <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
            

            
            
            {message && (
              <div className="mb-4 p-3 bg-orange-100 text-orange-700 rounded">
                {message} 
              </div>
            )}

          

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {() => (
                <Form>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                        darkMode ? "text-gray-900" : "text-gray-800"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">
                      Password
                    </label>
                    <Field
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                        darkMode ? "text-gray-900" : "text-gray-800"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting} // Disable button while loading
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </Form>
              )}
            </Formik>

            <p className="text-center mt-4">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-700"
              >
                Register here
              </Link>
            </p>
          </motion.div>
        </div>
      

      <ScrollDownIcon />
      <Footer />
    </>
  );
};

export default LoginForm;
