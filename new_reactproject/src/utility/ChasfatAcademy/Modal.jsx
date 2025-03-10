import { motion } from 'framer-motion';
import PropTypes from 'prop-types';  // Import PropTypes


const Modal = ({ isOpen, onClose }) => {
    // Animation variants for the modal
    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8, // Start with a smaller scale
        },
        visible: {
            opacity: 1,
            scale: 1, // Full scale when visible
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
    };

    // Backdrop animation
    const backdropVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.2,
            },
        },
    };

    if (!isOpen) return null; // Don't render if the modal is closed

    return (
        <>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose} // Close modal when backdrop is clicked
            />

            {/* Modal */}
            <motion.div
                className="fixed inset-1/4 bg-white rounded-lg p-6 shadow-lg z-50"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <h2 className="text-xl font-bold mb-4">This is a Modal</h2>
                <p className="mb-4">You can put any content inside this modal.</p>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={onClose} // Close the modal on button click
                >
                    Close Modal
                </button>
            </motion.div>
        </>
    );
};

// Prop validation for the Modal component
Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,  // isOpen should be a boolean
    onClose: PropTypes.func.isRequired, // onClose should be a function
};

export default Modal;
