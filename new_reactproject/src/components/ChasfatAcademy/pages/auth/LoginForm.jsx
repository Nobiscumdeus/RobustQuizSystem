import APP_CONFIG from '@/config/appConfig';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Footer from "../../shared/Footer";
import ScrollDownIcon from "../../utility/ScrollDownIcon";
import { useAuthLogin } from "@hooks/useAuth"; // ← NEW: Use our custom hook

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.6,
      bounce: 0.3,
    },
  },
  exit: {
    x: "-50vw",
    opacity: 0,
    transition: {
      ease: "easeInOut",
      duration: 0.8,
    },
  },
};

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use our new auth hook
  const { login, isLoading: isSubmitting, error: loginError } = useAuthLogin();

  // Redirect data
  const { from = "/admin_panel", message } = location.state || {};

  // Validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Use the hook instead of direct axios call
      await login(values);
      
      // If we reach here, login was successful
      toast.success("Login successful! Redirecting...");
      
      // Navigate after successful login
      navigate(from, { replace: true });
      
    } catch (error) {
      // The hook already sets error state, but we can show specific messages
      const errorMessage = error?.data?.message || 
                          loginError?.data?.message || 
                          "Login failed. Please try again.";
      
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      resetForm();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Welcome Back to {APP_CONFIG.name}
          </h1>
          <p className="text-text-secondary text-lg">
            Sign in to access your personalized learning dashboard
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-surface border border-border rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl mb-4">
              🔐
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Login</h2>
            <p className="text-text-secondary mt-2">Access your account</p>
          </div>

          {/* Message Alert */}
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-warning/10 border border-warning/20 text-warning rounded-lg"
            >
              <div className="flex items-center">
                <span className="mr-2">ℹ️</span>
                <span>{message}</span>
              </div>
            </motion.div>
          )}

          {/* Error Alert from API */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-lg"
            >
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{loginError.data?.message || "Login failed"}</span>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-text-primary">
                    Email Address
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full py-3 px-4 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-error text-sm mt-1"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-text-primary">
                    Password
                  </label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full py-3 px-4 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-error text-sm mt-1"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      name="remember"
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    />
                    <label className="ml-2 text-text-secondary text-sm">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-primary-hover text-sm font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </Form>
            )}
          </Formik>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-text-secondary">Or continue with</span>
            </div>
          </div>

          {/* Social Login (Optional) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className="flex items-center justify-center py-2.5 px-4 border border-border rounded-lg hover:bg-surface-elevated transition-colors text-text-primary"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-2.5 px-4 border border-border rounded-lg hover:bg-surface-elevated transition-colors text-text-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Registration Link */}
          <div className="text-center">
            <p className="text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary-hover font-semibold"
              >
                Create account
              </Link>
            </p>
            <p className="text-text-tertiary text-sm mt-4">
              By logging in, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:text-primary-hover">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:text-primary-hover">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Demo Account Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-md text-center"
        >
          <div className="bg-surface/50 border border-border rounded-xl p-4">
            <p className="text-text-secondary text-sm">
              <span className="font-semibold">Demo account:</span> demo@quizmaster.com / demopass123
            </p>
            <p className="text-text-tertiary text-xs mt-1">
              Try out our platform with sample data
            </p>
          </div>
        </motion.div>
      </div>

      <ScrollDownIcon />
      <Footer />
    </>
  );
};

export default LoginForm;
