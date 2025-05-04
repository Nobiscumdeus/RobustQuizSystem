import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, selectDarkMode } from "/src/features/ChasfatAcademy/darkmode/darkModeSlice.js";
import { logoutUser} from '../../../actions/authActions';

import useOnlineStatus from '../utility/OnlineStatusBar';
import { motion } from 'framer-motion';
import { isAuthenticated, logout } from '../utility/auth'; // <-- [1] IMPORT YOUR AUTH UTILS

const Header = () => {
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();
  const darkMode = useSelector(selectDarkMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // <-- [2] ADD REAL-TIME AUTH STATE
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const user = useSelector((state) => state.auth?.user);

  // <-- [3] SYNC AUTH STATE ACROSS TABS
  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(isAuthenticated());
      if (!isAuthenticated()) dispatch(logoutUser());
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('logout', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('logout', handleAuthChange);
    };
  }, [dispatch]);

  // <-- [4] IMPROVED LOGOUT HANDLER
  const handleLogout = () => {
    logout(); // <-- Uses your auth utility
    dispatch(logoutUser());
    setIsLoggedIn(false);
    navigate('/login');
  };

  // <-- [5] SIMPLIFIED NAV ITEMS RENDERING
  const navItems = [
    { path: '/', label: 'Home', show: true },
    { path: '/contact', label: 'Contact', show: true },
    { path: '/about', label: 'About', show: true },
    { path: '/profile', label: 'Profile', show: isLoggedIn },
    { path: '/login', label: 'Login', show: !isLoggedIn },
    { path: '/register', label: 'Register', show: !isLoggedIn },
  ];

  return (
    <header className={`shadow-lg ${darkMode ? 'bg-gray-900 text-white' : 'text-blue-600'}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-600'}`}>QuizMaster</h1>

        <span className={`text-xl font-semibold ${isOnline ? (darkMode ? "text-white" : "text-green-400") : "text-red-500"}`}>
          {isOnline ? 'Online' : 'Reconnecting...'}
        </span>

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 dark:text-white">
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 lg:flex justify-end items-center space-x-4 ${menuOpen ? 'block' : 'hidden'} lg:block`}>
          <ul className="flex space-x-4">
            {/* <-- [6] DYNAMIC NAV ITEMS */}
            {navItems.map((item) => item.show && (
              <motion.li
                key={item.path}
                whileHover={{ scale: 1.2, originX: 0, color: '#f8e112' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <a 
                  href="#" 
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
                >
                  {item.label}
                </a>
              </motion.li>
            ))}

            {/* <-- [7] CONDITIONAL LOGOUT/WELCOME */}
            {isLoggedIn && (
              <>
                <motion.li
                  whileHover={{ scale: 1.2, originX: 0, color: '#f8e112' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <a href="#" onClick={handleLogout} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>
                    Logout
                  </a>
                </motion.li>
                {user && (
                  <li className={`${darkMode ? 'text-white' : 'text-gray-600'}`}>
                    Welcome, {user.name}
                  </li>
                )}
              </>
            )}

            {/* Dark Mode Toggle */}
            <li>
              <a
                onClick={() => dispatch(toggleDarkMode())}
                className="cursor-pointer flex items-center"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <FaSun size={24} className="bg-gray-900 text-white" /> : <FaMoon size={24} className="bg-gray-100 text-gray-900" />}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;