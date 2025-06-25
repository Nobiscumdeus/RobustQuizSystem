import { Link } from 'react-router-dom';
//import LogoutForm from './auth/LogoutForm'; // Ensure you have the Logout component imported

import Logout from './auth/LogoutForm';

import Footer from '../shared/Footer';

import { useSelector } from 'react-redux';

import ScrollDownIcon from '../utility/ScrollDownIcon';
const Onboarding = () => {
    const darkMode = useSelector((state) => state.darkMode.darkMode); // Access the dark mode state
    return (
        <>
            <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'}`}>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 max-w-md w-full`}>
                    <h1 className="text-3xl font-bold text-center mb-4">
                        Welcome to Chasfat Academy!
                    </h1>
                    <p className="text-center mb-6">
                        We are excited to have you on board. Here are some steps to get started:
                    </p>
                    <ul className="list-disc ml-5 mb-6">
                        <li className="mb-2">🌟 Explore available courses.</li>
                        <li className="mb-2">👤 Complete your profile.</li>
                        <li className="mb-2">📝 Start your first quiz!</li>
                    </ul>
                    <div className="flex justify-between items-center space-x-4">
                        <Link
                            to="/admin_panel"
                            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 ${darkMode ? 'hover:bg-blue-700' : ''}`}
                        >
                            Explore Admin Dashboard
                        </Link>
                        {/*}
                        <LogoutForm />
                        */}
                        <Logout />
                    </div>
                </div>
            </div>
            <ScrollDownIcon />
            <Footer />
        </>
    );
};

export default Onboarding;
