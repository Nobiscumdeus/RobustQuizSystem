const { prisma } = require('@database');  // Import the Prisma client


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// Register new Course
exports.createCourse = async (req, res) => {
  const { title, code, description, examinerId } = req.body;

  try {
    // Input validation: Ensure title and examinerId are provided
    if (!title || !examinerId) {
      return res.status(400).json({ message: 'Course title and examiner ID are required' });
    }

    // Ensure the examinerId is a valid ID (check if it's a number)
    if (isNaN(examinerId)) {
      return res.status(400).json({ message: 'Invalid examiner ID' });
    }

    // Create a new course
    const newCourse = await prisma.course.create({
      data: {
        title,
        code: code || null, // Course code is optional, defaulting to null if not provided
        description: description || null, // Course description is optional, defaulting to null if not provided
        examinerId, // Associate the course with the examiner
      },
    });

    // Respond with the created course details
    return res.status(201).json({
      message: 'Course created successfully',
      course: newCourse,
    });

  } catch (err) {
    console.error('Error creating course:', err);
    
    // Handle Prisma specific errors
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Course already exists with the provided data.' });
    }
    
    // Catch-all error handling
    return res.status(500).json({
      message: 'Failed to create course. Please try again.',
      error: err.message,
    });
  }
};

// Get all Courses by Examiner
exports.getCoursesByExaminer = async (req, res) => {
  const examinerId = req.user.userId;

  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }

    // Retrieve all courses associated with the examiner
    const courses = await prisma.course.findMany({
      where: {
        examinerId: parseInt(examinerId), // Ensure examinerId is an integer
      },
      orderBy:{
        createdAt:'desc',
      }
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this examiner' });
    }

    res.status(200).json({ courses });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve courses. Please try again.' });
  }
};

exports.getCourseById = async (req, res) => {
  const { courseId } = req.params;
  const examinerId = req.user.userId;

  try {
    // Basic validation
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Retrieve course with all related data
    const course = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId),
        examinerId: parseInt(examinerId)
      },
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            phone: true
          }
        },
        courseStudents: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                matricNo: true,
                email: true,
                phone: true,
                department: true,
                level: true,
                isActive: true,
                lastActive: true
              }
            }
          },
          take: 50,
          orderBy: {
            enrolledAt: 'desc'
          }
        },
        exams: {
          select: {
            id: true,
            title: true,
            description: true,
            isPublished: true,
            date: true,
            startTime: true,
            endTime: true,
            duration: true,
            maxAttempts: true,
            passingScore: true,
            state: true,
            publishedAt: true,
            activatedAt: true,
            completedAt: true,
            instructions: true,
            _count: {
              select: {
                students: true,
                results: true,
                examQuestions: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        },
        // 🆕 ADD: All questions associated with this course
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            correctAnswer: true,
            imageUrl: true,
            category: true,
            tags: true,
            difficulty: true,
            points: true,
            createdAt: true,
            updatedAt: true,
            examiner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                examQuestions: true, // How many exams use this question
                analytics: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            courseStudents: true,
            exams: true,
            questions: true // 🆕 ADD: Count of questions
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        message: 'Course not found or you do not have permission to access it',
        courseId,
        examinerId
      });
    }

    // Enhanced stats with question analytics
    const stats = {
      totalStudents: course._count.courseStudents,
      totalExams: course._count.exams,
      totalQuestions: course._count.questions, // 🆕 ADD
      activeExams: course.exams.filter(exam => exam.isPublished).length,
      draftExams: course.exams.filter(exam => !exam.isPublished).length, // 🆕 ADD
      upcomingExams: course.exams.filter(exam => {
        try {
          return new Date(exam.date) > new Date();
        } catch {
          return false;
        }
      }).length,
      completedExams: course.exams.filter(exam => exam.state === 'COMPLETED').length, // 🆕 ADD
      enrollmentRate: course._count.courseStudents > 0
        ? (course._count.courseStudents / (course._count.courseStudents + 10)) * 100
        : 0,
      averageExamScore: 0, // Keep as placeholder
      // 🆕 ADD: Question breakdown by type
      questionsByType: course.questions.reduce((acc, question) => {
        acc[question.questionType] = (acc[question.questionType] || 0) + 1;
        return acc;
      }, {}),
      // 🆕 ADD: Question breakdown by difficulty
      questionsByDifficulty: course.questions.reduce((acc, question) => {
        const difficulty = question.difficulty || 'UNSPECIFIED';
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {}),
      // 🆕 ADD: Question breakdown by category
      questionsByCategory: course.questions.reduce((acc, question) => {
        const category = question.category || 'UNCATEGORIZED';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
      // 🆕 ADD: Active students count
      activeStudents: course.courseStudents.filter(cs => cs.student.isActive).length,
      // 🆕 ADD: Recent activity
      recentlyEnrolledStudents: course.courseStudents.filter(cs => {
        const enrolledDate = new Date(cs.enrolledAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return enrolledDate > thirtyDaysAgo;
      }).length
    };

    res.status(200).json({ 
      course, 
      stats,
      // 🆕 ADD: Additional metadata
      metadata: {
        lastUpdated: course.updatedAt,
        totalPoints: course.questions.reduce((sum, q) => sum + q.points, 0),
        hasActiveExams: course.exams.some(exam => exam.state === 'ACTIVE'),
        canEdit: !course.isPublished, // Assuming you add this field
        examStates: course.exams.reduce((acc, exam) => {
          acc[exam.state] = (acc[exam.state] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to retrieve course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get course data specifically for editing
exports.getCourseForEdit = async (req, res) => {
  const { courseId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId),
        examinerId: parseInt(requestingExaminerId) // Changed from instructorId to examinerId
      },
      select: {
        id: true,
        title: true,
        code: true,
        description: true,
        creditHours: true,
        semester: true, // Added to match schema
        isActive: true, // Changed from isPublished to isActive
        examinerId: true, // Changed from instructorId
        examiner: { // Changed from instructor
          select: {
            id: true,
            firstName: true,
            lastName:true,
            email: true
          }
        },
        exams: {
          select: {
            id: true,
            title: true,
            date: true,
            isPublished: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
       courseStudents: {
  include: {
    student: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNo: true
      }
    }
  }
},
        _count: {
          select: {
            exams: true,
            courseStudents: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or not owned by this examiner' });
    }

    res.status(200).json({ course });

  } catch (err) {
    console.error('Error fetching course for edit:', err);
    res.status(500).json({ 
      message: 'Failed to retrieve course data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const requestingExaminerId = req.user.userId;

  console.log('Received update payload:', req.body); // Debug log

  try {
    // Validate parameters
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Check if course exists and belongs to examiner
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId),
        examinerId: parseInt(requestingExaminerId)
      }
    });

    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found or not owned by this examiner' });
    }

   

    // Prepare update data with defaults
    const updateData = {
      title: req.body.title,
      code: req.body.code,
      description: req.body.description || null,
      creditHours: parseInt(req.body.creditHours) || 0,
      semester: req.body.semester || null,
      isActive: req.body.isActive !== false, // Changed from isPublished to isActive
    
    };

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(courseId) },
      data: updateData,
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
       courseStudents: {
  include: {
    student: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNo: true
      }
    }
  }
},
        exams: {
          select: {
            id: true,
            title: true,
            date: true,
            isPublished: true // Note: You might want to update this to isActive too if your exam model uses isActive
          }
        }
      }
    });

    res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (err) {
    console.error('Error updating course:', {
      message: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      validationErrors: err.meta // Prisma validation errors
    });
  }
};

exports.deleteCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  
  // Validate courseId
  if (isNaN(courseId)) {
    return res.status(400).json({ error: 'Invalid course ID' });
  }
  
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        ...(process.env.NODE_ENV === 'development' && { details: 'No course found with that ID' })
      });
    }
    
    const requestUserId = parseInt(req.user.userId);
    
    if (course.examinerId !== requestUserId) {
      return res.status(403).json({
        error: 'Not authorized to delete this course',
        ...(process.env.NODE_ENV === 'development' && { details: 'User ID does not match course owner' })
      });
    }

    // First, find all exams for this course
    const exams = await prisma.exam.findMany({
      where: { courseId: courseId },
      select: { id: true }
    });
    
    const examIds = exams.map(exam => exam.id);
    
    // Delete associated questions first
    await prisma.examQuestion.deleteMany({
      where: { 
        examId: { in: examIds } 
      }
    });
    
    // Then delete the exams
    await prisma.exam.deleteMany({
      where: { courseId: courseId }
    });
    
    // Finally delete the course
    await prisma.course.delete({
      where: { id: courseId }
    });
    
    res.status(200).json({ message: 'Course and all associated exams and questions deleted successfully' });
  } catch (error) {
    console.error('Course deletion error:', error);
    res.status(500).json({
      error: 'Error deleting course',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getCoursesAndExamsForRegistration = async (req, res) => {
  const { examinerId } = req.params;
  
  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }
    
    // Get all courses that belong to the examiner
    const courses = await prisma.course.findMany({
      where: { examinerId: parseInt(examinerId) },
      orderBy: { title: 'asc' }
    });
    
    // Get all exams that belong to the examiner
    const exams = await prisma.exam.findMany({
      where: { examinerId: parseInt(examinerId) },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      },
      orderBy: { title: 'asc' }
    });
    
    // ✅ Add debugging logs
    console.log('Courses found:', courses.length);
    console.log('Exams found:', exams.length);
    
    if (exams.length > 0) {
      console.log('First exam structure:', JSON.stringify(exams[0], null, 2));
      console.log('First exam courseId:', exams[0].courseId);
      console.log('First exam course:', exams[0].course);
    }
    
    res.status(200).json({
      courses,
      exams,
    });
    
  } catch (err) {
    console.error('Error fetching courses and exams:', err);
    res.status(500).json({
      message: 'Failed to retrieve courses and exams. Please try again.',
      error: err.message
    });
  }
};

exports.getCourseQuestions = async (req, res) => {
  const { courseId } = req.params;
  const examinerId = req.user.userId;
  const { page = 1, limit = 50, type, difficulty, category } = req.query;

  try {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId),
        examinerId: parseInt(examinerId)
      },
      select: { id: true, title: true }
    });

    if (!course) {
      return res.status(404).json({
        message: 'Course not found or you do not have permission to access it'
      });
    }

    // Build filter conditions
    const whereConditions = {
      courseId: parseInt(courseId)
    };

    if (type) whereConditions.questionType = type;
    if (difficulty) whereConditions.difficulty = difficulty;
    if (category) whereConditions.category = category;

    // Get questions with pagination
    const questions = await prisma.question.findMany({
      where: whereConditions,
      select: {
        id: true,
        questionText: true,
        questionType: true,
        options: true,
        correctAnswer: true,
        imageUrl: true,
        category: true,
        tags: true,
        difficulty: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            examQuestions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    // Get total count for pagination
    const totalQuestions = await prisma.question.count({
      where: whereConditions
    });

    res.status(200).json({
      questions,
      courseInfo: {
        id: course.id,
        title: course.title
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalQuestions / parseInt(limit)),
        totalQuestions,
        limit: parseInt(limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to retrieve course questions',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.getStudentsNotInCourse = async (req, res) => {
  const { courseId } = req.params;
  const examinerId = req.user.userId;

  try {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId), examinerId: parseInt(examinerId) },
      select: { id: true }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    // Get enrolled student IDs
    const enrolledStudents = await prisma.courseStudent.findMany({
      where: { courseId: parseInt(courseId) },
      select: { studentId: true }
    });
    const enrolledStudentIds = enrolledStudents.map(cs => cs.studentId);

    // Get all students not enrolled
    const students = await prisma.student.findMany({
      where: {
        examinerId: parseInt(examinerId),
        id: { notIn: enrolledStudentIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNo: true,
        email: true,
        department: true,
        level: true,
        isActive: true
      },
      orderBy: { lastName: 'asc' }
    });

    res.status(200).json({
      message: 'Students retrieved successfully',
      students,
      total: students.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to retrieve students',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.addStudentsToCourse = async (req, res) => {
  const { courseId } = req.params;
  const { studentIds } = req.body;
  const examinerId = req.user.userId;

  try {
    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId), examinerId: parseInt(examinerId) },
      select: { id: true, title: true }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    // Verify students exist and are not already enrolled
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds.map(id => parseInt(id)) }, examinerId: parseInt(examinerId) },
      select: { id: true }
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'Some students not found or unauthorized' });
    }

    const existingEnrollments = await prisma.courseStudent.findMany({
      where: { courseId: parseInt(courseId), studentId: { in: studentIds.map(id => parseInt(id)) } },
      select: { studentId: true }
    });
    const existingStudentIds = existingEnrollments.map(cs => cs.studentId);

    const newEnrollments = studentIds
      .filter(id => !existingStudentIds.includes(parseInt(id)))
      .map(id => ({
        courseId: parseInt(courseId),
        studentId: parseInt(id),
        enrolledAt: new Date()
      }));

    if (newEnrollments.length === 0) {
      return res.status(400).json({ message: 'All students are already enrolled' });
    }

    // Add students to course
    await prisma.courseStudent.createMany({
      data: newEnrollments
    });

    // Optionally add to active exams
    const activeExams = await prisma.exam.findMany({
      where: { courseId: parseInt(courseId), isPublished: true, state: 'ACTIVE' },
      select: { id: true }
    });

    for (const exam of activeExams) {
      for (const studentId of studentIds) {
        await prisma.exam.update({
          where: { id: exam.id },
          data: { students: { connect: { id: parseInt(studentId) } } },
          include: { students: { select: { id: true } } }
        });
      }
    }

    res.status(201).json({
      message: `${newEnrollments.length} students added to course successfully`,
      courseId: course.id,
      addedStudents: newEnrollments.map(e => e.studentId)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to add students to course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.removeStudentFromCourse = async (req, res) => {
  const { courseId, studentId } = req.params;
  const examinerId = req.user.userId;

  try {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId), examinerId: parseInt(examinerId) },
      select: { id: true, title: true }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    // Verify student is enrolled
    const courseStudent = await prisma.courseStudent.findFirst({
      where: { courseId: parseInt(courseId), studentId: parseInt(studentId) },
      include: { student: { select: { id: true, firstName: true, lastName: true, matricNo: true } } }
    });

    if (!courseStudent) {
      return res.status(404).json({ message: 'Student not enrolled in this course' });
    }

    // Remove student from course
    await prisma.courseStudent.delete({
      where: {
        courseId_studentId: {
          courseId: parseInt(courseId),
          studentId: parseInt(studentId)
        }
      }
    });

    // Remove from active exams
    const activeExams = await prisma.exam.findMany({
      where: { courseId: parseInt(courseId), isPublished: true, state: 'ACTIVE' },
      select: { id: true }
    });

    for (const exam of activeExams) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { students: { disconnect: { id: parseInt(studentId) } } }
      });
    }

    res.status(200).json({
      message: 'Student removed from course successfully',
      courseId: course.id,
      removedStudent: courseStudent.student
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to remove student from course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};







