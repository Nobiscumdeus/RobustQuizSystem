import { useNavigate } from 'react-router-dom';
// REMOVE: import { clearAuthState } from '../../utility/auth';
import { useAuthLogout } from '@/hooks/useAuth'; // ADD THIS

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuthLogout(); // ADD THIS

    const handleLogout = async () => {
        // REMOVE: localStorage.removeItem('token');
        // REMOVE: clearAuthState();
        
        // Use the hook for logout
        await logout(); // This handles the API call and Redux state
        
        // Redirect to the login page
        navigate('/login');
    };

    return (
        <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white p-2 rounded hover:bg-red-300"
        >
            Logout
        </button>
    );
};

export default Logout;

/*
import { useNavigate } from 'react-router-dom';
import { clearAuthState } from '../../utility/auth';
const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove the token from local storage
        localStorage.removeItem('token');


        // Optionally, you can clear any user-related state here

        // Redirect to the login page or home page
        clearAuthState();
        navigate('/login');
    };

    return (
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded hover:bg-red-300">
            Logout
        </button>
    );
};

export default Logout;
*/