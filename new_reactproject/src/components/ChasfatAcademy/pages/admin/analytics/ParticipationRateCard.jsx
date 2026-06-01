import PropTypes from "prop-types";

const ParticipationRateCard = ({ darkMode, data, isLoading, error, onRetry }) => {
  const items = Array.isArray(data?.items) ? data.items : [];

  return (
    <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
      <h3 className="text-lg font-semibold mb-2">Participation Rate</h3>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Loading participation data...
          </p>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-500">Could not load participation data.</p>
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
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className={`rounded-md p-3 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className="text-xs opacity-70">Rate</p>
              <p className="text-xl font-bold">{data?.overallRate ?? 0}%</p>
            </div>
            <div className={`rounded-md p-3 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className="text-xs opacity-70">Submitted</p>
              <p className="text-xl font-bold">{data?.totalPresent ?? 0}</p>
            </div>
            <div className={`rounded-md p-3 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className="text-xs opacity-70">Enrolled</p>
              <p className="text-xl font-bold">{data?.totalEnrolled ?? 0}</p>
            </div>
          </div>

          <div className="space-y-3">
            {items.length > 0 ? (
              items.slice(0, 5).map((item, index) => (
                <div key={`${item.examId ?? item.title ?? index}`} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate max-w-[70%]">{item.title ?? "Exam"}</span>
                    <span>{item.participationRate ?? 0}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.max(0, Math.min(item.participationRate ?? 0, 100))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div
                className={`h-32 flex items-center justify-center text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No participation records for this timeframe.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ParticipationRateCard.propTypes = {
  darkMode: PropTypes.bool.isRequired,

  data: PropTypes.shape({
    overallRate: PropTypes.number,
    totalPresent: PropTypes.number,
    totalEnrolled: PropTypes.number,

    items: PropTypes.arrayOf(
      PropTypes.shape({
        examId: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

        title: PropTypes.string,

        participationRate: PropTypes.number,
      })
    ),
  }),

  isLoading: PropTypes.bool,

  error: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.bool,
  ]),

  onRetry: PropTypes.func,
};



export default ParticipationRateCard;