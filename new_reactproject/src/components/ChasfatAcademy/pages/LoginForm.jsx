import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Footer from '../shared/Footer';
import ScrollDownIcon from '../utility/ScrollDownIcon';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for entrance and exit
const containerVariants = {
    hidden: {
        opacity: 0,
      
    },
    visible: {
        opacity: 1,
    
        transition: {
            type: 'spring',
            when: 'beforeChildren',
            staggerChildren: 0.4,
            delay: 0.5,
        },
    },
    exit: {
        x: '-50vw', // Slide off to the left when exiting
        opacity: 0, // Fade out
        transition: {
            ease: 'easeInOut',
            duration: 1, // Smooth transition duration for exit
        },
    },
};

const LoginForm = () => {
    const navigate = useNavigate();
    const darkMode = useSelector((state) => state.darkMode.darkMode);
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation schema using Yup
    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    // Auto-dismiss server error after 5 seconds
    useEffect(() => {
        if (serverError) {
            const timer = setTimeout(() => {
                setServerError('');
            }, 5000); // Clear error after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [serverError]);

    const handleSubmit = async (values, { resetForm }) => {
        setIsSubmitting(true); // Start loading
        try {
            const response = await axios.post('http://localhost:5000/login', values);
            localStorage.setItem('token', response.data.token); // Store JWT token
            navigate('/welcome'); // Redirect after login
        } catch (error) {
            // Handle server errors
            if (error.response && error.response.data) {
                setServerError(error.response.data.message || 'Login failed. Please try again.');
            } else {
                setServerError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false); // Stop loading
            resetForm(); // Clear form fields
        }
    };

    return (
        <>
            <AnimatePresence>
                <motion.div
                    key="login-form" // Unique key for AnimatePresence
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`w-full flex flex-col items-center justify-center min-h-screen ${
                        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100'
                    }`}
                >
                    <div
                        className={`${
                            darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
                        } shadow-lg rounded-lg p-8 max-w-md w-full`}
                    >
                        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

                        {/* Display server error message */}
                        {serverError && (
                            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                {serverError}
                            </div>
                        )}

                        <Formik
                            initialValues={{ email: '', password: '' }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {() => (
                                <Form>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-2">Email</label>
                                        <Field
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                                                darkMode ? 'text-gray-900' : 'text-gray-800'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        <ErrorMessage name="email" component="div" className="text-red-500 text-xs italic" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-2">Password</label>
                                        <Field
                                            name="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                                                darkMode ? 'text-gray-900' : 'text-gray-800'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        <ErrorMessage name="password" component="div" className="text-red-500 text-xs italic" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting} // Disable button while loading
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {isSubmitting ? 'Logging in...' : 'Login'}
                                    </button>
                                </Form>
                            )}
                        </Formik>

                        <p className="text-center mt-4">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="text-blue-500 hover:text-blue-700">
                                Register here
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <ScrollDownIcon />
            <Footer />
        </>
    );
};

export default LoginForm;