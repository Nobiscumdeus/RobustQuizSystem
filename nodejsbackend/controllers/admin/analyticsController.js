const { prisma } = require("@database");

exports.analyticsData = async (req, res) => {
  try {
    const bundle = await buildAnalyticsBundle(req);

    return res.json({
      success: true,
      data: bundle,
      meta: bundle.meta,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.participationData = async (req, res) => {
  try {
    const bundle = await buildAnalyticsBundle(req);
    return res.json({
      success: true,
      data: bundle.participationRate,
      meta: bundle.meta,
    });
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

exports.performanceData = async (req, res) => {
  try {
    const bundle = await buildAnalyticsBundle(req);
    return res.json({
      success: true,
      data: bundle.performanceTrends,
      meta: bundle.meta,
    });
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

exports.distributionData = async (req, res) => {
  try {
    const bundle = await buildAnalyticsBundle(req);
    return res.json({
      success: true,
      data: bundle.scoreDistribution,
      meta: bundle.meta,
    });
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

exports.deviceUsageData = async (req, res) => {
  try {
    const bundle = await buildAnalyticsBundle(req);
    return res.json({
      success: true,
      data: bundle.deviceUsage,
      meta: bundle.meta,
    });
  } catch (error) {
    return handleAnalyticsError(res, error);
  }
};

async function buildAnalyticsBundle(req) {
  const userId = req.user?.userId;

  if (!userId) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }

  const timeframe = normalizeTimeframe(req.query.timeframe);
  const { from, to } = getTimeRange(timeframe);

  const [exams, attendanceRows, results] = await Promise.all([
    prisma.exam.findMany({
      where: {
        examinerId: userId,
        date: { gte: from, lte: to },
      },
      select: {
        id: true,
        title: true,
        date: true,
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { date: "asc" },
    }),

    prisma.attendance.findMany({
      where: {
        timestamp: { gte: from, lte: to },
        exam: { examinerId: userId },
      },
      select: {
        id: true,
        studentId: true,
        examId: true,
        status: true,
        timestamp: true,
      },
    }),

    prisma.examResult.findMany({
      where: {
        submittedAt: { gte: from, lte: to },
        exam: { examinerId: userId },
      },
      select: {
        id: true,
        score: true,
        percentage: true,
        deviceInfo: true,
        submittedAt: true,
        examId: true,
      },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  const attendanceByExam = buildAttendanceByExam(attendanceRows);

  return {
    participationRate: buildParticipationRate(exams, attendanceByExam),
    performanceTrends: buildPerformanceTrends(results, timeframe),
    scoreDistribution: buildScoreDistribution(results),
    deviceUsage: buildDeviceUsage(results),
    meta: {
      timeframe,
      from,
      to,
      examsCount: exams.length,
      attendanceCount: attendanceRows.length,
      resultCount: results.length,
    },
  };
}

function handleAnalyticsError(res, error) {
  console.error("Analytics error:", error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode === 401 ? "Unauthorized" : "Failed to fetch analytics data",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}

function normalizeTimeframe(value) {
  if (value === "month" || value === "year") return value;
  return "week";
}

function getTimeRange(timeframe) {
  const to = new Date();
  const from = new Date(to);

  if (timeframe === "month") {
    from.setDate(to.getDate() - 29);
  } else if (timeframe === "year") {
    from.setMonth(to.getMonth() - 11);
  } else {
    from.setDate(to.getDate() - 6);
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

function buildAttendanceByExam(attendanceRows) {
  const map = new Map();

  for (const row of attendanceRows) {
    if (!map.has(row.examId)) {
      map.set(row.examId, {
        presentStudents: new Set(),
        totalRows: 0,
        presentRows: 0,
        absentRows: 0,
        lateRows: 0,
      });
    }

    const bucket = map.get(row.examId);
    bucket.totalRows += 1;

    const status = (row.status || "").toLowerCase();
    if (status === "present") bucket.presentRows += 1;
    if (status === "absent") bucket.absentRows += 1;
    if (status === "late") bucket.lateRows += 1;

    if (status === "present") {
      bucket.presentStudents.add(row.studentId);
    }
  }

  return map;
}

function buildParticipationRate(exams, attendanceByExam) {
  const items = exams.map((exam) => {
    const bucket = attendanceByExam.get(exam.id);
    const enrolled = exam._count?.students || 0;
    const present = bucket ? bucket.presentStudents.size : 0;
    const late = bucket ? bucket.lateRows : 0;

    const participation = enrolled > 0 ? (present / enrolled) * 100 : 0;

    return {
      examId: exam.id,
      title: exam.title,
      course: exam.course?.title || exam.course?.code || "Unknown course",
      enrolled,
      present,
      late,
      participationRate: roundToOne(participation),
    };
  });

  const totalEnrolled = items.reduce((sum, item) => sum + item.enrolled, 0);
  const totalPresent = items.reduce((sum, item) => sum + item.present, 0);
  const overallRate = totalEnrolled > 0 ? (totalPresent / totalEnrolled) * 100 : 0;

  return {
    overallRate: roundToOne(overallRate),
    totalEnrolled,
    totalPresent,
    items,
  };
}

function buildPerformanceTrends(results, timeframe) {
  const groups = new Map();

  for (const result of results) {
    const date = new Date(result.submittedAt);
    const label = formatTrendLabel(date, timeframe);

    if (!groups.has(label)) {
      groups.set(label, {
        label,
        attempts: 0,
        totalScore: 0,
        totalPercentage: 0,
      });
    }

    const bucket = groups.get(label);
    bucket.attempts += 1;
    bucket.totalScore += Number(result.score || 0);
    bucket.totalPercentage += Number(result.percentage || 0);
  }

  return Array.from(groups.values()).map((bucket) => ({
    label: bucket.label,
    attempts: bucket.attempts,
    avgScore: bucket.attempts > 0 ? roundToOne(bucket.totalScore / bucket.attempts) : 0,
    avgPercentage: bucket.attempts > 0 ? roundToOne(bucket.totalPercentage / bucket.attempts) : 0,
  }));
}

function formatTrendLabel(date, timeframe) {
  if (timeframe === "year") return date.toLocaleString("en-US", { month: "short" });
  if (timeframe === "month") return date.getDate().toString().padStart(2, "0");
  return date.toLocaleString("en-US", { weekday: "short" });
}

function buildScoreDistribution(results) {
  const buckets = [
    { label: "0-49", min: 0, max: 49, count: 0 },
    { label: "50-59", min: 50, max: 59, count: 0 },
    { label: "60-69", min: 60, max: 69, count: 0 },
    { label: "70-79", min: 70, max: 79, count: 0 },
    { label: "80-89", min: 80, max: 89, count: 0 },
    { label: "90-100", min: 90, max: 100, count: 0 },
  ];

  for (const result of results) {
    const score = Number(result.percentage || 0);
    const bucket = buckets.find((item) => score >= item.min && score <= item.max);
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

function buildDeviceUsage(results) {
  const counts = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    unknown: 0,
  };

  for (const result of results) {
    const device = normalizeDeviceInfo(result.deviceInfo);
    counts[device] += 1;
  }

  return Object.entries(counts).map(([label, count]) => ({
    label,
    count,
  }));
}

function normalizeDeviceInfo(value) {
  if (!value || typeof value !== "string") return "unknown";

  const text = value.toLowerCase();

  if (text.includes("mobile") || text.includes("android") || text.includes("iphone")) return "mobile";
  if (text.includes("tablet") || text.includes("ipad")) return "tablet";
  if (text.includes("windows") || text.includes("mac") || text.includes("linux") || text.includes("desktop")) return "desktop";

  return "unknown";
}

function roundToOne(value) {
  return Number(Number(value || 0).toFixed(1));
}

