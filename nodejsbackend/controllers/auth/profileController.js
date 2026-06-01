const bcrypt = require('bcryptjs');
const { prisma } = require('@database'); // Import prisma client



const calculateAchievements = (examResults, averageScore) => {
  let achievements = 0;

  if (examResults.length > 0) achievements += 1;
  if (examResults.some(result => result.percentage >= 100)) achievements += 1;
  if (examResults.length >= 10) achievements += 1;
  if (averageScore >= 90) achievements += 1;
  if (examResults.filter(result => result.percentage >= 80).length >= 5) achievements += 1;

  return achievements;
};

const calculateProfileStats = (user) => {
  let stats = {};

  if (user.role === 'student') {
    const studentRecord = user.students[0];
    if (studentRecord) {
      const examResults = studentRecord.results;
      const totalExams = examResults.length;
      const completedExams = examResults.filter(r => r.status === 'COMPLETED').length;
      const averageScore = examResults.length > 0
        ? examResults.reduce((sum, result) => sum + result.percentage, 0) / examResults.length
        : 0;

      stats = {
        examsCompleted: completedExams,
        totalExams,
        averageScore: Math.round(averageScore * 100) / 100,
        coursesEnrolled: studentRecord.courses.length,
        achievements: calculateAchievements(examResults, averageScore),
        recentResults: examResults
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
          .slice(0, 5)
      };
    }
  } else if (user.role === 'examiner') {
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

  return stats;
};

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
            examQuestions: true,
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

    const stats = calculateProfileStats(user);

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

const buildProfileStatsResponse = async (req, res) => {
  const userId = req.user.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      students: {
        include: {
          results: true,
          courses: true
        }
      },
      exams: {
        include: {
          results: true,
          examQuestions: true,
          course: true
        }
      },
      courses: {
        include: {
          students: true,
          exams: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.status(200).json({
    success: true,
    statsData: calculateProfileStats(user)
  });
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password: ', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing the password.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: updatedUser.avatarUrl
      }
    });
  } catch (err) {
    console.error('Error uploading avatar: ', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while uploading the avatar.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




module.exports={
   getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  buildProfileStatsResponse
}
