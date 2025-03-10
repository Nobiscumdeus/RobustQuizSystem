import { useState ,useEffect} from 'react';
import Modal from '../../utility/ChasfatAcademy/Modal';
import Loader from '../../utility/ChasfatAcademy/Loader';

import useTourStore from '../../zustand/store';


const AdminPanel = () => {

    const {stopTour} =useTourStore(); //use stopTour to end the tour

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to toggle modal visibility
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

     // Stop the tour when the component mounts
  useEffect(() => {
    stopTour();
  }, [stopTour]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
             <p>Welcome to the Admin Panel! The tour has ended.</p>
            <button
                className="modal bg-green-500 text-white px-6 py-3 rounded"
                onClick={openModal} // Open modal on button click
            >
                Open Modal

            </button>

            {/* Render the Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} />

            <Loader />
        </div>
    );
};

export default AdminPanel;
