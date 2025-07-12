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
