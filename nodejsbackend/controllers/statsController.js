const { prisma } = require('../database'); // Import prisma client


/*
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId; // From your auth middleware
    
    const stats = await prisma.$transaction([
      // Total Exams
      prisma.exam.count({
        where: { examinerId: userId }
      }),
      
      // Total Students
      prisma.student.count({
        where: { examinerId: userId }
      }),
      
      // Total Courses
      prisma.course.count({
        where: { examinerId: userId }
      }),
      
      // Ongoing Exams
      prisma.exam.count({
        where: { 
          examinerId: userId,
          date: { 
              lte: new Date(), // Date is less than or equal to now
              endTime: { gt: new Date() } // End time is in future
          }
        }
      }),
      
      // Completed Exams
      prisma.exam.count({
        where: { 
          examinerId: userId,
          endTime: { lt: new Date() } // End time has passed
        }
      })
    ]);

    res.json({
      totalExams: stats[0],
      totalStudents: stats[1],
      totalCourses: stats[2],
      ongoingExams: stats[3],
      completedExams: stats[4]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
*/

exports.getUserStats = async (req, res) => {
    try {
      // 1. Validate user
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
      // 2. Normalize date
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  
      // 3. Run queries
      const stats = await prisma.$transaction([
        prisma.exam.count({ where: { examinerId: userId } }),
        prisma.student.count({ where: { examinerId: userId } }),
        prisma.course.count({ where: { examinerId: userId } }),
        prisma.exam.count({
          where: { 
            examinerId: userId,
            date: { lte: now },
            endTime: { not: null, gt: now }
          }
        }),
        prisma.exam.count({
          where: { 
            examinerId: userId,
            endTime: { not: null, lt: now }
          }
        })
      ]);
  
      // 4. Validate results
      if (stats.some(count => count === undefined)) {
        throw new Error("Invalid query results");
      }
  
      res.json({
        success: true,
        statsData: {
          totalExams: stats[0] ?? 0,
          totalStudents: stats[1] ?? 0,
          totalCourses: stats[2] ?? 0,
          ongoingExams: stats[3] ?? 0,
          completedExams: stats[4] ?? 0
        }
      });
  
    } catch (error) {
      console.error("Stats error:", {
        message: error.message,
        stack: error.stack,
        userId: req.user?.id,
        status: error.response?.status,
        headers: error.response?.headers,
        data: error.response?.data
  
      });
      
      res.status(500).json({ 
        success: false,
        error: "Failed to load statistics",
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  };