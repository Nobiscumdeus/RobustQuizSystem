import PropTypes from "prop-types";

const ScoreDistributionCard = ({ darkMode, data, isLoading, error, onRetry }) => {
  const items = Array.isArray(data) ? data : [];
  const maxCount = items.reduce((max, item) => Math.max(max, item.count ?? 0), 0) || 1;

  return (
    <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
      <h3 className="text-lg font-semibold mb-2">Score Distribution</h3>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Loading score distribution...
          </p>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-500">Could not load score distribution.</p>
          <button
            onClick={onRetry}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item, index) => {
              const width = ((item.count ?? 0) / maxCount) * 100;

              return (
                <div key={`${item.label ?? index}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label ?? "Range"}</span>
                    <span>{item.count ?? 0}</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div className="h-2 rounded-full bg-violet-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className={`h-32 flex items-center justify-center text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No score distribution data for this timeframe.
            </div>
          )}
        </div>
      )}
    </div>
  );
};


ScoreDistributionCard.propTypes = {
  darkMode: PropTypes.bool.isRequired,

  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,

      count: PropTypes.number,
    })
  ),

  isLoading: PropTypes.bool,

  error: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.bool,
  ]),

  onRetry: PropTypes.func,
};
export default ScoreDistributionCard;