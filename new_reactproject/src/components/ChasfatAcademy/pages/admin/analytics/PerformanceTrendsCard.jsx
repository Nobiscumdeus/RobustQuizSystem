import PropTypes from "prop-types";

const PerformanceTrendsCard = ({ darkMode, data, isLoading, error, onRetry }) => {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
      <h3 className="text-lg font-semibold mb-2">Exam Performance Trends</h3>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Loading performance data...
          </p>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-500">Could not load performance trends.</p>
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
            items.slice(0, 6).map((item, index) => (
              <div key={`${item.label ?? index}`} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate max-w-[70%]">{item.label ?? "Period"}</span>
                  <span>{item.avgPercentage ?? 0}%</span>
                </div>
                <div className={`h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.max(0, Math.min(item.avgPercentage ?? 0, 100))}%` }}
                  />
                </div>
                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Attempts: {item.attempts ?? 0} | Avg score: {item.avgScore ?? 0}
                </div>
              </div>
            ))
          ) : (
            <div
              className={`h-32 flex items-center justify-center text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No performance data for this timeframe.
            </div>
          )}
        </div>
      )}
    </div>
  );
};


PerformanceTrendsCard.propTypes = {
  darkMode: PropTypes.bool.isRequired,

  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,

      avgPercentage: PropTypes.number,

      attempts: PropTypes.number,

      avgScore: PropTypes.number,
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

export default PerformanceTrendsCard;