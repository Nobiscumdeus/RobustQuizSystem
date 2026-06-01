import { Link } from 'react-router-dom';
import Footer from '../shared/Footer';
import { useTheme } from '@hooks/useTheme';
import ScrollDownIcon from '../utility/ScrollDownIcon';
import { useAuthLogout } from '@hooks/useAuth';

const Onboarding = () => {
    const { darkMode } = useTheme();
    const { logout } = useAuthLogout();

    const handleLogout = async () => {
        try {
            await logout();
            // Optionally, you could redirect to login page after logout
            // window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-background'}`}>
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-surface-elevated border-border'} p-8 rounded-xl shadow-xl border transition-all duration-300 max-w-md w-full mx-4`}>
                    {/* Welcome Header */}
                    <div className="text-center mb-8">
                        <div className="mb-4">
                            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
                                Welcome to <span className="text-primary dark:text-primary">Chasfat Academy</span>!
                            </h1>
                        </div>
                        <p className="text-text-secondary dark:text-gray-300">
                            Your journey to excellence begins here. Get started with these simple steps:
                        </p>
                    </div>

                    {/* Steps List - Updated with actual actions */}
                    <div className="mb-8 space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-border dark:border-gray-700">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary dark:text-gray-100 mb-1">Take the Interactive Tour</h3>
                                <p className="text-sm text-text-secondary dark:text-gray-400">Learn how to use the platform with our guided tour</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-border dark:border-gray-700">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary dark:text-gray-100 mb-1">Complete Your Profile</h3>
                                <p className="text-sm text-text-secondary dark:text-gray-400">Set up your account for personalized experience</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-border dark:border-gray-700">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary dark:text-gray-100 mb-1">Start Your First Quiz</h3>
                                <p className="text-sm text-text-secondary dark:text-gray-400">Test your knowledge with our interactive quizzes</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Updated with Start Tour button */}
                    <div className="space-y-3">
                        <Link
                            to="/manage"
                            className="w-full py-3 px-4 rounded-lg font-medium text-center
                                     bg-primary dark:bg-primary
                                     text-white
                                     hover:bg-primary-hover dark:hover:bg-primary-hover
                                     focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                     dark:focus:ring-offset-gray-800
                                     transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Start Interactive Tour
                        </Link>
                        
                        <div className="flex gap-3">
                            <Link
                                to="/admin_panel"
                                className="flex-1 py-3 px-4 rounded-lg font-medium text-center
                                         bg-blue-100 dark:bg-blue-900/20
                                         text-blue-700 dark:text-blue-400
                                         hover:bg-blue-200 dark:hover:bg-blue-900/30
                                         border border-blue-200 dark:border-blue-800
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                         dark:focus:ring-offset-gray-800
                                         transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                Admin Dashboard
                            </Link>
                            
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 px-4 rounded-lg font-medium
                                         bg-gray-100 dark:bg-gray-800
                                         text-text-primary dark:text-gray-300
                                         hover:bg-gray-200 dark:hover:bg-gray-700
                                         border border-border dark:border-gray-700
                                         focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                         dark:focus:ring-offset-gray-800
                                         transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Quick Tips - Updated */}
                    <div className="mt-8 pt-6 border-t border-border dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-2">
                            For First-Time Users:
                        </h3>
                        <ul className="text-xs text-text-secondary dark:text-gray-500 space-y-1">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary"></div>
                                We recommend starting with the interactive tour
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary"></div>
                                Complete your profile before taking quizzes
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary"></div>
                                Visit the help center if you need assistance
                            </li>
                        </ul>
                    </div>

                    {/* Skip Option */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-text-secondary dark:text-gray-500">
                            Already familiar with the platform?{' '}
                            <Link 
                                to="/admin_panel" 
                                className="text-primary dark:text-primary hover:underline font-medium"
                            >
                                Skip to dashboard
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <ScrollDownIcon />
            <Footer />
        </>
    );
};

export default Onboarding;

