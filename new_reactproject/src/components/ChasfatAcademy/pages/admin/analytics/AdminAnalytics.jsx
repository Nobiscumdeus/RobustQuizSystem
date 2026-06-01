import { useAnalytics } from "../../../../../hooks/useAnalytics";
import ParticipationRateCard from "./ParticipationRateCard";
import PerformanceTrendsCard from "./PerformanceTrendsCard";
import ScoreDistributionCard from "./ScoreDistributionCard";
import DeviceUsageCard from "./DeviceUsageCard";
import PropTypes from "prop-types";

const AdminAnalytics = ({ darkMode }) => {
  const {
    timeframe,
    updateTimeframe,
    analytics,
    isLoading,
    error,
    refetchAll,
  } = useAnalytics();

  const periods = ["week", "month", "year"];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-sm mt-1`}>
            Track participation, exam performance, score spread, and device usage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map((period) => {
            const isActive = timeframe === period;

            return (
              <button
                key={period}
                onClick={() => updateTimeframe(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          className={`rounded-lg border px-4 py-3 ${
            darkMode
              ? "border-red-900 bg-red-950 text-red-200"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">Analytics data could not be loaded.</p>
            <button
              onClick={refetchAll}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                darkMode
                  ? "bg-red-700 text-white hover:bg-red-600"
                  : "bg-red-600 text-white hover:bg-red-500"
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformanceTrendsCard
          darkMode={darkMode}
          data={analytics.performance}
          isLoading={isLoading}
          error={error}
          onRetry={refetchAll}
        />

        <ParticipationRateCard
          darkMode={darkMode}
          data={analytics.participation}
          isLoading={isLoading}
          error={error}
          onRetry={refetchAll}
        />

        <ScoreDistributionCard
          darkMode={darkMode}
          data={analytics.distribution}
          isLoading={isLoading}
          error={error}
          onRetry={refetchAll}
        />

        <DeviceUsageCard
          darkMode={darkMode}
          data={analytics.devices}
          isLoading={isLoading}
          error={error}
          onRetry={refetchAll}
        />
      </div>
    </section>
  );
};

AdminAnalytics.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AdminAnalytics;