import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import axios from "axios"; // Axios for HTTP Requests
import { useNavigate, Link } from "react-router-dom";
import Footer from "../../shared/Footer";
import { useSelector } from "react-redux";
import ScrollDownIcon from "../../utility/ScrollDownIcon";

import { motion } from "framer-motion";
import { toast } from "react-toastify"; // Import toast for notifications


const RegistrationForm = () => {
  const darkMode = useSelector((state) => state.darkMode.darkMode); // Access the dark mode state
  const navigate = useNavigate();

  // Initial values for the form fields
  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  // Validation Schema using YUP
  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters"),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/register",
        values
      );
      localStorage.setItem("token", response.data.token); // Store JWT token
      console.log("Registration successful:", response.data);
  

      navigate("/welcome");
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
        toast.error("Registration failed. Please check your inputs");
      } else {
       setErrors({ general: "Registration failed. Please try again." });
      //  toast.error("Registration failed. Please try again.");
      }
      console.error("Registration error", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`w-full  flex flex-col items-center justify-center min-h-screen  ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-700"
        }`}
      >
        <motion.div
        initial={{opacity:0,x:100}}
        animate={{opacity:1,x:0}}
        type={{ type:'spring',delay:0.5}}
        
          className={`mt-4 mb-4 ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-700"
          } shadow-lg rounded-lg p-8 max-w-md w-full`}
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            Register for Chasfat Academy
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Username Input */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-bold mb-2"
                  >
                    Username
                  </label>
                  <Field
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-red-500 text-xs italic"
                  />
                </div>
                {/* First Name Input (Optional) */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-bold mb-2"
                  >
                    First Name (Optional)
                  </label>
                  <Field
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="text-red-500 text-xs italic"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold mb-2"
                  >
                    Email
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs italic"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold mb-2"
                  >
                    Password
                  </label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-xs italic"
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold mb-2"
                  >
                    Confirm Password
                  </label>
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-xs italic"
                  />
                </div>

                {/* Submit Button */}
                <motion.button 
                whileHover={{
                  scale:1.1,
                  textShadow:"0px 0px 8px rgb(255,255,255)",
                  boxShadow:"0px 0px 8px rgb(255,255,255)"
                }}

                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${
                    darkMode
                      ? "bg-green-700 text-green-100"
                      : "bg-blue-500 text-white"
                  } py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  Register
                </motion.button>

                {/* Error Message for Form Submission */}
                <ErrorMessage
                  name="submit"
                  component="div"
                  className="text-red-500"
                />
              </Form>
            )}
          </Formik>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className={`text-blue-500 hover:text-blue-700 ${
                darkMode ? "text-green-500" : ""
              }`}
            >
              Login here
            </Link>
         

          </p>
        </motion.div>
      </div>

      <ScrollDownIcon />
      <Footer />
    </>
  );
};

export default RegistrationForm;
