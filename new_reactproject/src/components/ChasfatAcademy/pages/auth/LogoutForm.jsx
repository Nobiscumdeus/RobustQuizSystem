import { useNavigate } from 'react-router-dom';
// REMOVE: import { clearAuthState } from '../../utility/auth';
import { useAuthLogout } from '@/hooks/useAuth'; // ADD THIS

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuthLogout(); // ADD THIS

    const handleLogout = async () => {
       
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

