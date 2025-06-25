const { prisma } = require('../database'); // Import prisma client
const jwt = require('jsonwebtoken');

/*
// Get Profile (already implemented)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the userId from the decoded JWT
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        students: true,
        exams: true,
        courses: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user profile: ', err);
    res.status(500).json({ message: 'An error occurred while fetching the profile.' });
  }
};
*/

// Get Profile - Enhanced version
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the userId from the decoded JWT
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        students: {
          include: {
            results: {
              include: {
                exam: true
              }
            },
            courses: true
          }
        },
        exams: {
          include: {
            results: true,
            questions: true,
            course: true
          }
        },
        courses: {
          include: {
            students: true,
            exams: true
          }
        },
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Calculate statistics based on user role
    let stats = {};
    
    if (user.role === 'student') {
      // For students - calculate their performance stats
      const studentRecord = user.students[0]; // Assuming one student record per user
      if (studentRecord) {
        const examResults = studentRecord.results;
        const totalExams = examResults.length;
        const completedExams = examResults.filter(r => r.status === 'COMPLETED').length;
        const averageScore = examResults.length > 0 
          ? examResults.reduce((sum, result) => sum + result.percentage, 0) / examResults.length 
          : 0;
        const coursesEnrolled = studentRecord.courses.length;

        stats = {
          examsCompleted: completedExams,
          totalExams: totalExams,
          averageScore: Math.round(averageScore * 100) / 100,
          coursesEnrolled: coursesEnrolled,
          achievements: calculateAchievements(examResults, averageScore),
          recentResults: examResults
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5)
        };
      }
    } else if (user.role === 'examiner') {
      // For examiners - calculate their teaching stats
      const totalStudents = user.students.length;
      const totalExams = user.exams.length;
      const totalCourses = user.courses.length;
      const totalResults = user.exams.reduce((sum, exam) => sum + exam.results.length, 0);

      stats = {
        studentsManaged: totalStudents,
        examsCreated: totalExams,
        coursesTeaching: totalCourses,
        totalSubmissions: totalResults,
        recentExams: user.exams
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      };
    }

    // Enhanced user profile response
    const profileResponse = {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || generateDefaultAvatar(user.firstName, user.lastName),
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: stats,
      notifications: user.notifications,
      // Additional computed fields
      memberSince: user.createdAt,
      isOnline: user.lastLogin ? isRecentlyActive(user.lastLogin) : false,
      profileCompletion: calculateProfileCompletion(user)
    };

    // If student, add student-specific data
    if (user.role === 'student' && user.students[0]) {
      const student = user.students[0];
      profileResponse.studentInfo = {
        matricNo: student.matricNo,
        department: student.department || '',
        level: student.level || '',
        courses: student.courses,
        recentActivity: student.lastActive
      };
    }

    // If examiner, add examiner-specific data
    if (user.role === 'examiner') {
      profileResponse.examinerInfo = {
        totalStudents: user.students.length,
        activeCourses: user.courses.filter(course => course.isActive),
        upcomingExams: user.exams.filter(exam => 
          new Date(exam.date) > new Date() && exam.isPublished
        ).slice(0, 5)
      };
    }

    res.status(200).json({
      success: true,
      data: profileResponse,
      message: 'Profile fetched successfully'
    });

  } catch (err) {
    console.error('Error fetching user profile: ', err);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while fetching the profile.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper function to calculate achievements
const calculateAchievements = (examResults, averageScore) => {
  let achievements = 0;
  
  // First quiz achievement
  if (examResults.length > 0) achievements++;
  
  // Perfect score achievement
  if (examResults.some(result => result.percentage >= 100)) achievements++;
  
  // Quick learner (10+ exams)
  if (examResults.length >= 10) achievements++;
  
  // High performer (90+ average)
  if (averageScore >= 90) achievements++;
  
  // Consistent performer (5+ exams with 80+ scores)
  const highScores = examResults.filter(result => result.percentage >= 80);
  if (highScores.length >= 5) achievements++;
  
  return achievements;
};

// Helper function to generate default avatar
const generateDefaultAvatar = (firstName, lastName) => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=4F46E5&color=fff&size=150`;
};

// Helper function to check if user was recently active
const isRecentlyActive = (lastLogin) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(lastLogin) > fiveMinutesAgo;
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  const fields = [
    user.firstName,
    user.lastName,
    user.email,
    user.phone,
    user.avatarUrl
  ];
  
  const filledFields = fields.filter(field => field && field.trim() !== '').length;
  return Math.round((filledFields / fields.length) * 100);
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phone, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        avatarUrl,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (err) {
    console.error('Error updating user profile: ', err);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while updating the profile.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


/*



// Edit Profile
const editProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, firstName, lastName, role } = req.body;

    // Validate required fields
 // Validate that at least one field is provided
 if (!username && !firstName  && !role) {
  return res.status(400).json({ message: 'At least one field is required for update.' });
}

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        firstName,
        role,
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating user profile: ', err);
    res.status(500).json({ message: 'An error occurred while updating the profile.' });
  }
};



// Edit Exam
const editExam = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { examId, title, date, duration } = req.body;

    // Validate required fields
    if (!examId && !title && !date && !duration) {
      return res.status(400).json({ message: 'Exam ID, Title, Date, and Duration are required.' });
    }

    // Check if the exam belongs to the user
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || exam.examinerId !== userId) {
      return res.status(404).json({ message: 'Exam not found or unauthorized.' });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title,
        date: new Date(date),  // Ensure the date is in a valid Date format
        duration,
      },
    });

    res.status(200).json(updatedExam);
  } catch (err) {
    console.error('Error updating exam: ', err);
    res.status(500).json({ message: 'An error occurred while updating the exam.' });
  }
};




// Delete Exam
const deleteExam = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { examId } = req.params;

    console.log('examId:', examId); // Log the examId

    // Convert examId to an integer if necessary
    const parsedExamId = parseInt(examId, 10);

    if (isNaN(parsedExamId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    // Check if the exam belongs to the user
    const exam = await prisma.exam.findUnique({
      where: { id: parsedExamId },
    });

    if (!exam || exam.examinerId !== userId) {
      return res.status(404).json({ message: 'Exam not found or unauthorized.' });
    }

    await prisma.exam.delete({
      where: { id: parsedExamId },
    });

    res.status(200).json({ message: 'Exam deleted successfully.' });
  } catch (err) {
    console.error('Error deleting exam: ', err);
    res.status(500).json({ message: 'An error occurred while deleting the exam.' });
  }
};





// Edit Course
const editCourse = async (req, res) => {
  try {
    const userId = req.user.userId;  // The user making the request
    const { courseId, title, code } = req.body;

    // Validate required fields
    if (!courseId && !title && !code) {
      return res.status(400).json({ message: 'One of Course ID, Title, and Code is/are required.' });
    }

    // Ensure courseId is an integer
    const parsedCourseId = parseInt(courseId, 10);

    if (isNaN(parsedCourseId)) {
      return res.status(400).json({ message: 'Invalid course ID.' });
    }

    // Check if the course belongs to the user (examinerId matches userId)
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
    });

    if (!course || course.examinerId !== userId) {
      return res.status(404).json({ message: 'Course not found or unauthorized.' });
    }

    // Update the course details
    const updatedCourse = await prisma.course.update({
      where: { id: parsedCourseId },
      data: {
        title,
        code,
      },
    });

    res.status(200).json(updatedCourse);
  } catch (err) {
    console.error('Error updating course: ', err);
    res.status(500).json({ message: 'An error occurred while updating the course.' });
  }
};


//delete course 
const deleteCourse = async (req, res) => {
  try {
    const userId = req.user.userId;  // The user making the request
    const { courseId } = req.params;

    // Ensure courseId is an integer
    const parsedCourseId = parseInt(courseId, 10);

    if (isNaN(parsedCourseId)) {
      return res.status(400).json({ message: 'Invalid course ID.' });
    }

    // Check if the course belongs to the user (examinerId matches userId)
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
    });

    if (!course || course.examinerId !== userId) {
      return res.status(404).json({ message: 'Course not found or unauthorized.' });
    }

    // Delete all exams associated with the course
    await prisma.exam.deleteMany({
      where: { courseId: parsedCourseId },
    });

    // Now delete the course
    await prisma.course.delete({
      where: { id: parsedCourseId },
    });

    res.status(200).json({ message: 'Course and related exams deleted successfully.' });
  } catch (err) {
    console.error('Error deleting course: ', err);
    res.status(500).json({ message: 'An error occurred while deleting the course.' });
  }
};





// Edit a student's data
const editStudent = async (req, res) => {
  const { id } = req.params; // Get student ID from URL parameter
  const { firstName, lastName, matricNo } = req.body; // Get data to be updated

  try {
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update student data
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        matricNo,
      },
    });

    return res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({ message: "Failed to update student" });
  }
};


// Delete a student by ID
const deleteStudent = async (req, res) => {
  try {
    const userId = req.user.userId;  // The user making the request
    const { studentId } = req.params;

    // Ensure studentId is an integer
    const parsedStudentId = parseInt(studentId, 10);

    if (isNaN(parsedStudentId)) {
      return res.status(400).json({ message: 'Invalid student ID.' });
    }

    // Check if the student exists and if the examinerId matches the current user's ID
    const student = await prisma.student.findUnique({
      where: { id: parsedStudentId },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (student.examinerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this student.' });
    }

    // Delete any associated exam results
    await prisma.examResult.deleteMany({
      where: { studentId: parsedStudentId },
    });

    // Delete the student
    await prisma.student.delete({
      where: { id: parsedStudentId },
    });

    res.status(200).json({ message: 'Student and associated exam results deleted successfully.' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'An error occurred while deleting the student.' });
  }
};

*/


/*
module.exports = {
  getProfile,
  editProfile,
  editExam,
  deleteExam,
  editCourse,
  deleteCourse,
  editStudent,
  deleteStudent
};

*/

module.exports={
   getProfile,
  updateProfile
}
