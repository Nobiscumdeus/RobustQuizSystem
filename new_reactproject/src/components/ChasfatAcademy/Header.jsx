import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, selectDarkMode } from "/src/features/ChasfatAcademy/darkmode/darkModeSlice.js";
import { logoutUser, getUser } from '../../actions/authActions';

import useOnlineStatus from '../../utility/ChasfatAcademy/OnlineStatusBar';
import { motion } from 'framer-motion';


const Header = () => {
  const isOnline =useOnlineStatus();


  const dispatch = useDispatch();
  const darkMode = useSelector(selectDarkMode);
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Token in localStorage:', token);
    console.log('User from Redux state:', user);

    if (token) {
      dispatch(getUser());
    } else {
      dispatch(logoutUser());
    }
  }, [dispatch, token,user]);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className={`shadow-lg ${darkMode ? 'bg-gray-900 text-white' : 'text-blue-600'}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-600'}`}>QuizMaster</h1>

   


        <span 
        
        className={`text-xl font-semibold ${ isOnline ? (darkMode ? "text-white" : "text-green-400") : "text-red-500"}`}
        disabled={!isOnline} >
        {isOnline ? 'Online' : 'Reconnecting...'}

        </span>
       
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 dark:text-white">
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <nav className={`flex-1 lg:flex justify-end items-center space-x-4 ${menuOpen ? 'block' : 'hidden'} lg:block`}>
          <ul className="flex space-x-4">
          
          
         
            
            {token ? (
              <>
                <li><a href="#" onClick={() => handleNavigate('/profile')} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>Profile</a></li>
                <li><a href="#" onClick={handleLogout} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>Logout</a></li>
                {user && <li className={`${darkMode ? 'text-white' : 'text-gray-600'}`}>Welcome, {user.name}</li>}
              </>
            ) : (
              <>
                  <motion.li
                  whileHover={{
                    scale:1.2,
                    originX:0,
                    color:'#f8e112'
                  }}
                  transition={{
                    type:'spring', stiffness:300
                  }}
                  
                  ><a href="#" onClick={() => handleNavigate('/')} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>Home</a></motion.li>
                  <motion.li
                     whileHover={{
                      scale:1.2,
                      originX:0,
                      color:'#f8e112'
                    }}
                    transition={{
                      type:'spring', stiffness:300
                    }}
                  ><a href="#" onClick={() => handleNavigate('/contact')} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>Contact</a></motion.li>
                  <motion.li
                     whileHover={{
                      scale:1.2,
                      originX:0,
                      color:'#f8e112'
                    }}
                    transition={{
                      type:'spring', stiffness:300
                    }}
                  ><a href="#" onClick={() => handleNavigate('/about')} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>About</a></motion.li>
                <motion.li
                   whileHover={{
                    scale:1.2,
                    originX:0,
                    color:'#f8e112'
                  }}
                  transition={{
                    type:'spring', stiffness:300
                  }}
                ><a href="#" onClick={() => handleNavigate('/login')} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>Login</a></motion.li>
                <motion.li
                   whileHover={{
                    scale:1.2,
                    originX:0,
                    color:'#f8e112'
                  }}
                  transition={{
                    type:'spring', stiffness:300
                  }}
                ><a href="#" onClick={() => handleNavigate('/register')} className={`${darkMode ? 'text-white hover:text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>Register</a></motion.li>
              </>
            )}
            
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