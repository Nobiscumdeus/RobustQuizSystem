const { prisma } = require('../database');

exports.searchAll = async (req, res) => {
  try {
    const { query } = req.query;
    const examinerId = req.user.userId; // Assuming authenticate middleware adds user info

    // Validate search query
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query should be at least 2 characters long"
      });
    }

    // Modified queries to include examinerId filter
    const [exams, students, courses] = await Promise.all([
      prisma.exam.findMany({
        where: {
          examinerId: examinerId, // Only this examiner's exams
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { course: { 
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } }
              ],
              examinerId: examinerId // Also ensure course belongs to examiner
            }}
          ]
        },
        // ... rest remains same
          take: 5,
        select: {
          id: true,
          title: true,
          date: true,
          course: {
            select: {
              title: true,
              code: true
            }
          }
        }
      }),
      
      prisma.student.findMany({
        where: {
          examinerId: examinerId, // Only this examiner's students
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { matricNo: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
   
          take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          matricNo: true,
          email: true
        }
      }),
      
      prisma.course.findMany({
        where: {
          examinerId: examinerId, // Only this examiner's courses
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
          take: 5,
        select: {
          id: true,
          title: true,
          code: true,
          description: true
        }
      })
    ]);

    // ... rest of the formatting and response logic remains same

        // Format exam results to include course information
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      date: exam.date,
      course: exam.course.title,
      courseCode: exam.course.code
    }));

    // Check if all results are empty
    const isEmpty = formattedExams.length === 0 &&
                    students.length === 0 &&
                    courses.length === 0;



    res.json({
      success: true,
      message: isEmpty ? "No results found" : "Search successful",
      data: {
        exams: formattedExams,
        students,
        courses
      },
      isEmpty
    });
    

  } catch (error) {
    // ... error handling
     console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred during search",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};