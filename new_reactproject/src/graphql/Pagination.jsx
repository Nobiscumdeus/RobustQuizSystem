import PropTypes from 'prop-types';


function Pagination({ page, setPage, hasNextPage }) {
    return (
      <div className="flex justify-center mt-8 space-x-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
        >
          Previous
        </button>
        <span className="px-4 py-2 bg-gray-100 rounded-lg">
          Page {page}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!hasNextPage}
          className={`px-4 py-2 rounded-lg ${!hasNextPage ? 'bg-gray-200 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
        >
          Next
        </button>
      </div>
    );
  }

  Pagination.propTypes = {
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
    hasNextPage: PropTypes.bool.isRequired,
  };

  export default Pagination;