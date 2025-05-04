import { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { evaluate  } from 'mathjs'; // For calculations
import { FaTimes } from 'react-icons/fa'; // Import the close icon from React Icons

const CalculatorModal = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState(''); // For error messages

  const handleButtonClick = (value) => {
    setInput((prev) => prev + value);
    setError(''); // Clear error when new input is added
  };

  const handleCalculate = () => {
    try {
      if (!input.trim()) {
        setError('Please enter a valid expression.');
        return;
      }

       // Replace trigonometric functions with a version that works in degrees
       const degreeInput = input.replace(/(sin|cos|tan)\((\d+(\.\d+)?)\)/g, (match, func, num) => {
        const angleInRadians = parseFloat(num) * (Math.PI / 180); // Convert degrees to radians
        return `${func}(${angleInRadians})`; // Replace with radians
      });

      setResult(evaluate(degreeInput));

      //setResult(evaluate(input));
    } catch (error) {
      setError('Invalid expression or operation.');
      setResult('');
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setError('');
  };

  if (!isOpen) return null; // Ensure modal is hidden when isOpen is false

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-auto relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaTimes className="text-xl" /> {/* Close icon */}
        </button>

        <h2 className="text-lg font-bold mb-4">Calculator</h2>

        {/* Input and Result Display */}
        <div className="mb-4">
          <input
            type="text"
            value={input}
            readOnly
            className="w-full p-2 border rounded text-right text-lg"
          />
          <div className="text-right text-gray-600 mt-1">{result}</div>
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>} {/* Error message */}
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {/* Numbers */}
          {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map((num) => (
            <button
              key={num}
              onClick={() => handleButtonClick(num.toString())}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {num}
            </button>
          ))}

          {/* Operations */}
          {['+', '-', '*', '/'].map((op) => (
            <button
              key={op}
              onClick={() => handleButtonClick(op)}
              className="p-2 bg-blue-200 rounded hover:bg-blue-300"
            >
              {op}
            </button>
          ))}

          {/* Advanced Functions */}
          {['cos', 'sin', 'tan', 'sqrt', 'log'].map((func) => (
            <button
              key={func}
              onClick={() => handleButtonClick(`${func}(`)} // Auto insert '(' after the function name
              className="p-2 bg-purple-200 rounded hover:bg-purple-300"
            >
              {func}
            </button>
          ))}

          {/* Parenthesis button to close open parenthesis */}
          <button
            onClick={() => handleButtonClick(')')}
            className="p-2 bg-yellow-200 rounded hover:bg-yellow-300"
          >
            )
          </button>

          {/* Clear and Calculate */}
          <button
            onClick={handleClear}
            className="col-span-2 p-2 bg-red-200 rounded hover:bg-red-300"
          >
            Clear
          </button>
          <button
            onClick={handleCalculate}
            className="p-2 bg-green-200 rounded hover:bg-green-300"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes Validation
CalculatorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // isOpen must be a boolean and is required
  onClose: PropTypes.func.isRequired, // onClose must be a function and is required
};

export default CalculatorModal;