import APP_CONFIG from '@/config/appConfig';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa'; 
import useOnlineStatus from '../utility/OnlineStatusBar';
import { motion } from 'framer-motion';
import { useCurrentUser, useAuthLogout} from "@hooks/useAuth";

import { useTheme } from '@/hooks/useTheme';

const Header = () => {
  const isOnline = useOnlineStatus();
 // const dispatch = useDispatch();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Get user from Redux state
  //const user = useSelector((state) => state.auth?.user);
  const { user, isAuthenticated} = useCurrentUser();
  const isLoggedIn = isAuthenticated;
  //const isLoggedIn = !!user;

  const { logout } = useAuthLogout(); 

  /*
  // Cookie-based auth sync
  useEffect(() => {
    const verifyAuth = async () => {
      try {
       const authStatus = await checkAuthStatus();
        if (!authStatus.isAuthenticated && user) {
          dispatch(logoutUser());
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    verifyAuth();
    const interval = setInterval(verifyAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch, user]);
  */


  // Logout handler
  const handleLogout = async () => {
    try {
     await logout();
      //dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
     // dispatch(logoutUser());
      navigate('/login');
    }
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', show: true },
    { path: '/contact', label: 'Contact', show: !isLoggedIn },
    { path: '/about', label: 'About', show: !isLoggedIn },
    { path: '/profile', label: 'Profile', show: isLoggedIn },
    { path: '/login', label: 'Login', show: !isLoggedIn },
    { path: '/register', label: 'Register', show: !isLoggedIn },
  ];

return (

  <header className="shadow-lg bg-background/95 text-text/90 ">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
  

      <h1 className="text-2xl font-bold text-primary/80 hover:text-primary transition-colors">
        {APP_CONFIG.name}
      </h1>


      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
        isOnline 
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      }`}>
        {isOnline ? '✓ Online' : '⚠ Offline'}
      </span>

 
      <div className="lg:hidden">
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="p-2 rounded text-text/80 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      <nav className={`${
        menuOpen 
          ? 'block absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg z-50' 
          : 'hidden'
      } lg:flex lg:static lg:bg-transparent lg:shadow-none lg:p-0 lg:border-0`}
      >
        <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-3 lg:space-y-0">
          {navItems.map((item) => item.show && (
            <motion.li
              key={item.path}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <button 
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg transition-colors text-text/80 hover:text-primary hover:bg-primary/5"
              >
                {item.label}
              </button>
            </motion.li>
          ))}

          {isLoggedIn && (
            <>
              <motion.li
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg transition-colors text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
                >
                  Logout
                </button>
              </motion.li>
              {user && (
                <li className="px-4 py-2 text-text/60">
                  👋 Welcome, {user.name || user.email}
                </li>
              )}
            </>
          )}

          <li>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-primary/5 text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
);
};

export default Header;

