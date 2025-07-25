// components/Spinner.js

import PropTypes from 'prop-types'; // Import PropTypes

const Spinner = ({ size = 'medium' }) => {
    const sizes = {
      small: 'h-4 w-4',
      medium: 'h-6 w-6',
      large: 'h-8 w-8'
    };
  
    return (
      <svg 
        className={`animate-spin ${sizes[size]} text-blue-500`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
  };

Spinner.propTypes = {
    //size:PropTypes.isRequired,
    size:PropTypes.oneOf(['small', 'medium', 'large']),
    //isOpen: PropTypes.bool.isRequired, // isOpen must be a boolean and is required
    //onClose: PropTypes.func.isRequired, // onClose must be a function and is required
  };
  
  export default Spinner;