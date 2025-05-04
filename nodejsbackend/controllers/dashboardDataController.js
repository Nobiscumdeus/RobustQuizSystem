const { prisma } = require('../database'); // Import prisma client

exports.dashboardData = async (req, res) => {
    try {
        // 1. Fetch all exam types in parallel
        const [upcomingExams, ongoingExams, completedExams] = await Promise.all([
            prisma.exam.findMany({
                where: {
                    date: { gt: new Date() },
                    isPublished: true
                },
                include: {
                    course: true,
                    _count: { select: { students: true } }
                },
                orderBy: { date: 'asc' },
                take: 5
            }),
            prisma.exam.findMany({
                where: {
                    startTime: { lte: new Date() },
                    endTime: { gt: new Date() }
                },
                include: {
                    course: true,
                    _count: { select: { students: true } }
                }
            }),
            prisma.exam.findMany({
                where: {
                    endTime: { lt: new Date() }
                },
                include: {
                    course: true,
                    _count: { select: { students: true } },
                    results: { select: { score: true } }
                },
                orderBy: { endTime: 'desc' },
                take: 5
            })
        ]);

        // 2. Process ongoing exams with active counts
        const ongoingWithActive = await Promise.all(
            ongoingExams.map(async exam => ({
                ...exam,
                active: await getActiveStudentsCount(exam.id)
            }))
        );

        // 3. Process completed exams with averages
        const completedWithAverages = completedExams.map(exam => ({
            ...exam,
            avgScore: calculateAverage(exam.results.map(r => r.score))
        }));

        // 4. Format the final response
        const response = {
            upcomingExams: upcomingExams.map(exam => ({
                id: exam.id,
                title: exam.title,
                course: exam.course.name,
                date: exam.date.toISOString(), // Serialize date
                status: "scheduled",
                enrolled: exam._count.students
            })),
            ongoingExams: ongoingWithActive.map(exam => ({
                id: exam.id,
                title: exam.title,
                course: exam.course.name,
                date: exam.date.toISOString(),
                status: "in-progress",
                enrolled: exam._count.students,
                active: exam.active // Now properly resolved
            })),
            completedExams: completedWithAverages.map(exam => ({
                id: exam.id,
                title: exam.title,
                course: exam.course.name,
                date: exam.date.toISOString(),
                status: "completed",
                enrolled: exam._count.students,
                submitted: exam.results.length,
                avgScore: exam.avgScore
            }))
        };

        res.json(response);
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

// Helper function to count active students
async function getActiveStudentsCount(examId) {
    return await prisma.attendance.count({
        where: {
            examId,
            lastPing: { gt: new Date(Date.now() - 300000) } // Active within 5 minutes
        }
    });
}

// Helper function to calculate average score
function calculateAverage(scores) {
    if (!scores.length) return 0;
    const sum = scores.reduce((total, score) => total + score, 0);
    return parseFloat((sum / scores.length).toFixed(2));
}