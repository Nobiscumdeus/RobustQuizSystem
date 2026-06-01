import { useCallback, useMemo, useState } from "react";
import {
  useGetAnalyticsOverviewQuery,
  useGetParticipationDataQuery,
  useGetPerformanceTrendsQuery,
  useGetScoreDistributionQuery,
  useGetDeviceUsageQuery,
} from "../api/analyticsApi";

export const useAnalytics = () => {
  const [timeframe, setTimeframe] = useState("week");

  // Load all analytics slices using the same timeframe so the dashboard stays in sync.
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useGetAnalyticsOverviewQuery(timeframe);

  const {
    data: participationData,
    isLoading: participationLoading,
    error: participationError,
    refetch: refetchParticipation,
  } = useGetParticipationDataQuery(timeframe);

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: refetchPerformance,
  } = useGetPerformanceTrendsQuery(timeframe);

  const {
    data: distributionData,
    isLoading: distributionLoading,
    error: distributionError,
    refetch: refetchDistribution,
  } = useGetScoreDistributionQuery(timeframe);

  const {
    data: deviceData,
    isLoading: deviceLoading,
    error: deviceError,
    refetch: refetchDevice,
  } = useGetDeviceUsageQuery(timeframe);

  // Keep one setter so the UI can switch all analytics cards together.
  const updateTimeframe = useCallback((nextTimeframe) => {
    if (nextTimeframe === "week" || nextTimeframe === "month" || nextTimeframe === "year") {
      setTimeframe(nextTimeframe);
    }
  }, []);

  // Normalize the most common shapes so the component layer stays simple.
  const analytics = useMemo(() => {
    return {
      overview: overviewData ?? {},
      participation: participationData ?? {
        overallRate: 0,
        totalEnrolled: 0,
        totalPresent: 0,
        items: [],
      },
      performance: performanceData ?? [],
      distribution: distributionData ?? [],
      devices: deviceData ?? [],
    };
  }, [overviewData, participationData, performanceData, distributionData, deviceData]);

  const isLoading =
    overviewLoading ||
    participationLoading ||
    performanceLoading ||
    distributionLoading ||
    deviceLoading;

  const error =
    overviewError ||
    participationError ||
    performanceError ||
    distributionError ||
    deviceError ||
    null;

  const refetchAll = useCallback(() => {
    refetchOverview();
    refetchParticipation();
    refetchPerformance();
    refetchDistribution();
    refetchDevice();
  }, [
    refetchOverview,
    refetchParticipation,
    refetchPerformance,
    refetchDistribution,
    refetchDevice,
  ]);

  return {
    timeframe,
    updateTimeframe,

    analytics,
    isLoading,
    error,
    refetchAll,

    overviewData,
    participationData,
    performanceData,
    distributionData,
    deviceData,
  };
};