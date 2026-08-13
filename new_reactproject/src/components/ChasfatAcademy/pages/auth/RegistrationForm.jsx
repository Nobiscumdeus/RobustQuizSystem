import APP_CONFIG from '@/config/appConfig';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../../shared/Footer";
import ScrollDownIcon from "../../utility/ScrollDownIcon";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
// Use the custom hook instead of direct API import
import { useRegister } from "@hooks/useAuth";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { register, isLoading, error: apiError } = useRegister();

  // Initial values for the form fields
  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
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
    terms: Yup.boolean()
      .oneOf([true], "You must accept the terms and conditions")
      .required("You must accept the terms and conditions"),
  });

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    // Remove confirmPassword and terms from submission
   const { confirmPassword, terms, ...submitData } = values;
   
    console.log(confirmPassword,terms)
    try {
      const result = await register(submitData);
      
      if (result.success) {
        toast.success("Registration successful! Welcome!");
        
        // Small delay to ensure cookies are set
        setTimeout(() => {
          navigate("/welcome");
        }, 500);
      } else {
        // Handle field-specific errors
        if (result.error && typeof result.error === 'object') {
          setErrors(result.error);
        } else if (result.error) {
          setErrors({ general: result.error });
          toast.error(result.error);
        } else {
          toast.error("Registration failed");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-gray-100 mb-4">
            Join {APP_CONFIG.name} Today
          </h1>
          <p className="text-text-secondary dark:text-gray-400 text-lg">
            Create your account and start your learning journey
          </p>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className="bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-2xl mb-4">
              📝
            </div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-gray-100">
              Create Account
            </h2>
            <p className="text-text-secondary dark:text-gray-400 mt-2">
              Join our learning community
            </p>
          </div>

          {/* API Error Display */}
          {apiError && typeof apiError === 'string' && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                {/* General Error Display */}
                {errors.general && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.general}</span>
                    </div>
                  </div>
                )}

                {/* Username Input */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-bold mb-2 text-text-primary dark:text-gray-100"
                  >
                    Username
                  </label>
                  <Field
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className={`w-full py-3 px-4 bg-background dark:bg-gray-700 border rounded-lg text-text-primary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-all ${
                      errors.username && touched.username 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-border dark:border-gray-600'
                    }`}
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-red-500 dark:text-red-400 text-sm mt-1"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold mb-2 text-text-primary dark:text-gray-100"
                  >
                    Email
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full py-3 px-4 bg-background dark:bg-gray-700 border rounded-lg text-text-primary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-all ${
                      errors.email && touched.email 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-border dark:border-gray-600'
                    }`}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 dark:text-red-400 text-sm mt-1"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold mb-2 text-text-primary dark:text-gray-100"
                  >
                    Password
                  </label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full py-3 px-4 bg-background dark:bg-gray-700 border rounded-lg text-text-primary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-all ${
                      errors.password && touched.password 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-border dark:border-gray-600'
                    }`}
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 dark:text-red-400 text-sm mt-1"
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold mb-2 text-text-primary dark:text-gray-100"
                  >
                    Confirm Password
                  </label>
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full py-3 px-4 bg-background dark:bg-gray-700 border rounded-lg text-text-primary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-all ${
                      errors.confirmPassword && touched.confirmPassword 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-border dark:border-gray-600'
                    }`}
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 dark:text-red-400 text-sm mt-1"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                  <Field
                    type="checkbox"
                    name="terms"
                    id="terms"
                    className="h-4 w-4 text-primary focus:ring-primary border-border dark:border-gray-600 rounded mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-text-secondary dark:text-gray-400 text-sm"
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-primary hover:text-primary-hover dark:hover:text-primary-hover font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:text-primary-hover dark:hover:text-primary-hover font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <ErrorMessage
                  name="terms"
                  component="div"
                  className="text-red-500 dark:text-red-400 text-sm mt-1"
                />

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary dark:bg-primary hover:bg-primary-hover dark:hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(isSubmitting || isLoading) ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </Form>
            )}
          </Formik>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface dark:bg-gray-800 text-text-secondary dark:text-gray-400">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 border border-border dark:border-gray-700 rounded-lg hover:bg-surface-elevated dark:hover:bg-gray-750 transition-colors text-text-primary dark:text-gray-100 font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign in to existing account
            </Link>
          </div>

          {/* Demo Account Info */}
          <div className="mt-6 text-center">
            <p className="text-text-tertiary dark:text-gray-500 text-sm">
              By registering, you agree to our{" "}
              <Link
                to="/terms"
                className="text-primary hover:text-primary-hover dark:hover:text-primary-hover"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary-hover dark:hover:text-primary-hover"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-md text-center"
        >
          <div className="bg-surface/50 dark:bg-gray-800/50 border border-border dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-success/10 dark:bg-success/20 flex items-center justify-center text-success mr-2">
                🔒
              </div>
              <h3 className="font-semibold text-text-primary dark:text-gray-100">Secure Registration</h3>
            </div>
            <p className="text-text-secondary dark:text-gray-400 text-sm">
              Your data is encrypted and protected. We use HTTP-only cookies for secure authentication.
            </p>
          </div>
        </motion.div>
      </div>

      <ScrollDownIcon />
      <Footer />
    </>
  );
};

export default RegistrationForm;

