import PropTypes from 'prop-types';


function ErrorMessage({ error }) {
    return (
      <div className=" bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        <p className="font-bold">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  ErrorMessage.propTypes = {
    error: PropTypes.object.isRequired,
  };
  export default ErrorMessage;