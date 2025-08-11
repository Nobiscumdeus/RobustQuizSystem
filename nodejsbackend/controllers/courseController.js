const { prisma } = require('../database');  // Import the Prisma client

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





exports.createExam = async (req, res) => {
  const {
    title,
    date,
    password,
    duration,
    examinerId,
    courseId,
    // New fields with defaults
    description = null,
    instructions = null,
    isPublished = false,
    startTime = null,
    endTime = null,
    maxAttempts = 1,
    passingScore = 60.0,
    proctoringSettings = null
  } = req.body;

  try {
    const exam = await prisma.exam.create({
      data: {
        // Original working fields
        title,
        date: new Date(date),
        password,
        duration: parseInt(duration),
        examinerId: parseInt(examinerId),
        courseId: parseInt(courseId),
        
        // New fields with simpler handling
        description,
        instructions,
        isPublished,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        maxAttempts: parseInt(maxAttempts),
        passingScore: parseFloat(passingScore),
        proctoringSettings
      }
    });

    res.status(201).json(exam);

  } catch (error) {
    console.error('Exam creation error:', error);
    res.status(500).json({ 
      error: 'Error creating exam',
      // Include specific error in development
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


//delete exams
exports.deleteExam = async (req, res) => {
  const examId = parseInt(req.params.examId);
  
  try {
    // Optional: First check if the exam exists and if the logged-in user is authorized to delete it
    const exam = await prisma.exam.findUnique({
      where: { id: examId }
    });
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    // Get the user ID from the JWT token to verify ownership
    const requestUserId = parseInt(req.user.userId); // Assuming you have auth middleware that sets req.user
    
    // Only allow the examiner who created the exam (or an admin) to delete it
    if (exam.examinerId !== requestUserId) {
      return res.status(403).json({ error: 'Not authorized to delete this exam' });
    }
    
    // Proceed with deletion
    await prisma.exam.delete({
      where: { id: examId }
    });
    
    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Exam deletion error:', error);
    res.status(500).json({
      error: 'Error deleting exam',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Get all Exams by Examiner with related data
exports.getExamsByExaminer = async (req, res) => {
  const { examinerId } = req.params;

  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }

    // Retrieve all exams with related course and counts
    const exams = await prisma.exam.findMany({
      where: {
        examinerId: parseInt(examinerId),
      },
      include: {
        course: {
          select: {
            title: true,
            code: true
          }
        },
        _count: {
          select: {
            students: true,
            results: true
          }
        },
        results: {
          select: {
            submittedAt: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (exams.length === 0) {
      return res.status(404).json({ message: 'No exams found for this examiner' });
    }

    // Format response
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration,
      isPublished: exam.isPublished,
      course: exam.course,
      enrolled: exam._count.students,
      submitted: exam._count.results,
      active: exam.results.filter(r => {
        // Calculate active students (submitted in last 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        return new Date(r.submittedAt) > thirtyMinutesAgo;
      }).length
    }));

    res.status(200).json({ exams: formattedExams });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Failed to retrieve exams',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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



// Get single exam with all related data (with examiner validation)
exports.getExamById = async (req, res) => {
  
  const { examId } = req.params;
  const examinerId = req.user.userId; // From JWT token

 
  try {
    // Basic validation
    if (!examId) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    // Retrieve exam with all related data
    const exam = await prisma.exam.findUnique({
      where: {
        id: parseInt(examId),
        examinerId: parseInt(examinerId) // Corrected from parse() to parseInt()
        
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
       examQuestions: {
  include: {
    question: true
  },
  orderBy: {
    order: 'asc'
  }
},
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricNo: true
          }
        },
        results: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                matricNo: true
              }
            },
            score: true,
            submittedAt: true,
            status: true
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        examSessions: { include: { student: { select: { id: true, firstName: true, lastName: true, matricNo: true } } } },
        _count: {
          select: {
            students: true,
            results: true,
            examQuestions: true
          }
        }
      }
    });

   
    if (!exam) {
      // More specific error message
      return res.status(404).json({ 
        message: 'Exam not found or you do not have permission to access it',
        examId,
        examinerId
      });
    }

    // Verify the exam belongs to the requesting examiner
    if (exam.examinerId !== parseInt(examinerId)) {
      return res.status(403).json({ message: 'Unauthorized access to this exam' });
    }

    // Calculate statistics
    
   const stats = {
  totalStudents: exam._count.students,
  submitted: exam._count.results,
  questions: exam._count.examQuestions, // Changed from questions
  averageScore: exam.results.length > 0 
    ? exam.results.reduce((sum, result) => sum + result.score, 0) / exam.results.length 
    : 0
};

    res.status(200).json({ exam, stats });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Failed to retrieve exam',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// Get exam data specifically for editing
exports.getExamForEdit = async (req, res) => {
  const { examId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    // Validate parameters
    if ( !examId) {
      return res.status(400).json({ message: 'Examiner ID and Exam ID are required' });
    }

  


    // Retrieve exam data with only necessary fields for editing
    const exam = await prisma.exam.findUnique({
      where: {
        id: parseInt(examId),
      //  examinerId: parseInt(examinerId)
      examinerId:parseInt(requestingExaminerId)
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        startTime: true,
        endTime: true,
        duration: true,
        isPublished: true,
        courseId: true,
        examinerId: true,
        course: {
          select: {
            title: true,
            code: true
          }
        },
       examQuestions: {
  include: {
    question: {
      select: {
        id: true,
        questionText: true,
        questionType: true,
        difficulty: true,
        options: true,
        correctAnswer: true
      }
    }
  },
  orderBy: {
    order: 'asc'
  }
},
     _count: {
  select: {
    examQuestions: true,
    students: true
  }
}
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not owned by this examiner' });
    }

    // Prevent editing if exam is already published
    if (exam.isPublished) {
      return res.status(400).json({ 
        message: 'Published exams cannot be edited',
        exam // Still return the exam data for reference
      });
    }

    res.status(200).json({ exam });

  } catch (err) {
    console.error('Error fetching exam for edit:', err);
    res.status(500).json({ 
      message: 'Failed to retrieve exam data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



// Update exam details
exports.updateExam = async (req, res) => {
 const { examId } = req.params;
 const requestingExaminerId = req.user.userId;
 const {
   title,
   description,
   date,
   startTime,
   endTime,
   duration,
   isPublished,
   courseId,
   instructions,
   maxAttempts,
   passingScore,
   questions // Optional: if updating questions in the same request
 } = req.body;

 try {
   // Validate parameters
   if (!examId) {
     return res.status(400).json({ message: 'Exam ID is required' });
   }

   // Check if exam exists and belongs to examiner
   const existingExam = await prisma.exam.findUnique({
     where: {
       id: parseInt(examId),
       examinerId: parseInt(requestingExaminerId)
     }
   });

   if (!existingExam) {
     return res.status(404).json({ message: 'Exam not found or not owned by this examiner' });
   }

   // Prevent editing if exam is already published
   if (existingExam.isPublished) {
     return res.status(400).json({
       message: 'Published exams cannot be modified',
       exam: existingExam
     });
   }

   // Validate required fields
   if (!title || !date || !duration) {
     return res.status(400).json({ message: 'Title, date and duration are required' });
   }

   // Prepare update data
   const updateData = {
     title,
     description: description || null,
     instructions: instructions || null,
     date: new Date(date),
     duration: parseInt(duration),
     courseId: courseId ? parseInt(courseId) : existingExam.courseId,
     maxAttempts: maxAttempts ? parseInt(maxAttempts) : existingExam.maxAttempts,
     passingScore: passingScore ? parseFloat(passingScore) : existingExam.passingScore
   };

   // Add time fields if provided
   if (startTime) updateData.startTime = new Date(startTime);
   if (endTime) updateData.endTime = new Date(endTime);

   // Handle questions updates if provided
   let questionsUpdate = {};
   if (questions && Array.isArray(questions)) {
     // First delete all existing exam-question relationships
     await prisma.examQuestion.deleteMany({
       where: { examId: parseInt(examId) }
     });

     // Then create new exam-question relationships
     questionsUpdate = {
       examQuestions: {
         create: questions.map((question, index) => ({
           questionId: question.id, // Assuming you're linking existing questions
           order: index + 1,
           points: question.points || 1.0
         }))
       }
     };
   }

   // Update exam with transaction for data consistency
   const updatedExam = await prisma.exam.update({
     where: { id: parseInt(examId) },
     data: {
       ...updateData,
       ...questionsUpdate
     },
     include: {
       course: {
         select: {
           title: true,
           code: true
         }
       },
       examQuestions: {
         include: {
           question: {
             select: {
               id: true,
               questionText: true,
               questionType: true,
               options: true,
               correctAnswer: true,
               difficulty: true,
               category: true,
               tags: true,
               imageUrl: true
             }
           }
         }
       }
     }
   });

   res.status(200).json({
     message: 'Exam updated successfully',
     exam: updatedExam
   });
 } catch (err) {
   console.error('Error updating exam:', err);
   res.status(500).json({
     message: 'Failed to update exam',
     error: process.env.NODE_ENV === 'development' ? err.message : undefined
   });
 }
};


//.............................................Students .........................

/*
...........................................Maintenance 1 ....................................

exports.getStudentById = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Convert to integer
    const studentIdInt = parseInt(studentId);
    
    // Find the student
    const student = await prisma.student.findUnique({
      where: { id: studentIdInt },
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        courses: {
          select: {
            id: true,
            title: true,
            code: true,
            semester: true
          }
        },
        results: {
          select: {
            id: true,
            score: true,
           // grade: true,
            exam: {
              select: {
                id: true,
                title: true,
             //   date: true
              }
            }
          }
        },
        attendances: {
          select: {
            id: true,
          //  date: true,
            status: true,
            /*
            course: {
              select: {
                id: true,
                title: true,
                code: true
              }
            }
              
          },
          /*
          orderBy: {
            date: 'desc'
          },
          
          take: 10 // Limit to most recent attendances
        }
      }
    });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if requesting examiner has access to this student
    if (student.examinerId !== requestingExaminerId) {
      return res.status(403).json({ 
        message: 'Access denied: You are not authorized to view this student' 
      });
    }

    // Return the student data
    res.status(200).json({
      message: 'Student retrieved successfully',
      student
    });

  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({
      message: 'Failed to fetch student',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

*/
/*
.......................................Maintenance 2 .....................................
exports.getStudentById = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const studentIdInt = parseInt(studentId);
    
    if (isNaN(studentIdInt)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // Find the student with proper relationships
    const student = await prisma.student.findUnique({
      where: { id: studentIdInt },
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        // Get courses through the many-to-many relationship
        courseStudents: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
                semester: true,
                creditHours: true,
                isActive: true,
                examiner: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: {
            enrolledAt: 'desc'
          }
        },
        // Get exam results with full exam and course details
        results: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                date: true,
                course: {
                  select: {
                    id: true,
                    code: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        // Get attendance records
        attendances: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                date: true,
                course: {
                  select: {
                    id: true,
                    code: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        },
        // Get recent exam sessions
        examSessions: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            isActive: true,
            exam: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    code: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            startedAt: 'desc'
          },
          take: 5
        }
      }
    });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if requesting examiner has access to this student
    if (student.examinerId !== requestingExaminerId) {
      return res.status(403).json({
        message: 'Access denied: You are not authorized to view this student'
      });
    }

    // Transform and enrich the data for frontend consumption
    const transformedStudent = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      matricNo: student.matricNo,
      email: student.email,
      phone: student.phone,
      department: student.department,
      level: student.level,
      isActive: student.isActive,
      lastActive: student.lastActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      
      // Examiner information
      examiner: student.examiner,
      
      // Transform courseStudents to courses with enrollment info
      courses: student.courseStudents.map(cs => ({
        id: cs.course.id,
        title: cs.course.title,
        code: cs.course.code,
        semester: cs.course.semester,
        creditHours: cs.course.creditHours,
        isActive: cs.course.isActive,
        enrolledAt: cs.enrolledAt,
        examiner: cs.course.examiner,
        // Add enrollment status
        enrollmentStatus: cs.course.isActive ? 'Active' : 'Inactive'
      })),
      
      // Enhanced results with proper course information
      results: student.results.map(result => ({
        id: result.id,
        score: result.score,
        grade: result.grade,
        submittedAt: result.submittedAt,
        isPassed: result.score >= 40, // Assuming 40 is pass mark
        exam: {
          id: result.exam.id,
          title: result.exam.title,
          date: result.exam.date,
          course: result.exam.course
        }
      })),
      
      // Recent attendances
      attendances: student.attendances.map(attendance => ({
        id: attendance.id,
        timestamp: attendance.timestamp,
        status: attendance.status || 'Present',
        exam: {
          id: attendance.exam.id,
          title: attendance.exam.title,
          date: attendance.exam.date,
          course: attendance.exam.course
        }
      })),
      
      // Recent exam sessions
      examSessions: student.examSessions.map(session => ({
        id: session.id,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        isActive: session.isActive,
        duration: session.endedAt 
          ? Math.round((new Date(session.endedAt) - new Date(session.startedAt)) / (1000 * 60)) // minutes
          : null,
        exam: session.exam
      })),
      
      // Computed statistics
      stats: {
        totalCourses: student.courseStudents.length,
        activeCourses: student.courseStudents.filter(cs => cs.course.isActive).length,
        totalExams: student.results.length,
        passedExams: student.results.filter(result => result.score >= 40).length,
        averageScore: student.results.length > 0 
          ? parseFloat((student.results.reduce((sum, result) => sum + (result.score || 0), 0) / student.results.length).toFixed(2))
          : 0,
        highestScore: student.results.length > 0 
          ? Math.max(...student.results.map(r => r.score || 0))
          : 0,
        lowestScore: student.results.length > 0 
          ? Math.min(...student.results.map(r => r.score || 0))
          : 0,
        recentActivity: student.examSessions.filter(session => session.isActive).length > 0 ? 'Active' : 'Inactive',
        totalAttendances: student.attendances.length,
        lastExamDate: student.results.length > 0 
          ? student.results[0].exam.date // Already ordered by submittedAt desc
          : null
      }
    };

    // Return the enriched student data
    res.status(200).json({
      message: 'Student retrieved successfully',
      student: transformedStudent,
      // Add metadata for debugging
      metadata: {
        dataFetchedAt: new Date().toISOString(),
        hasResults: transformedStudent.results.length > 0,
        hasCourses: transformedStudent.courses.length > 0,
        hasAttendances: transformedStudent.attendances.length > 0
      }
    });

  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({
      message: 'Failed to fetch student',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

*/
exports.getStudentById = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const studentIdInt = parseInt(studentId);
    
    if (isNaN(studentIdInt)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // Find the student with proper relationships
    const student = await prisma.student.findUnique({
      where: { id: studentIdInt },
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        // ✅ FIX: Use courseStudents for proper many-to-many relationship
        courseStudents: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
                semester: true,
                creditHours: true,
                isActive: true,
                examiner: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: {
            enrolledAt: 'desc'
          }
        },
        results: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                date: true,
                course: {
                  select: {
                    code: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        attendances: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                date: true,
                course: {
                  select: {
                    code: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        },
        // ✅ ADD: Get exam sessions for activity tracking
        examSessions: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            isActive: true,
            exam: {
              select: {
                title: true,
                course: {
                  select: {
                    code: true
                  }
                }
              }
            }
          },
          orderBy: {
            startedAt: 'desc'
          },
          take: 5
        }
      }
    });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if requesting examiner has access to this student
    if (student.examinerId !== requestingExaminerId) {
      return res.status(403).json({
        message: 'Access denied: You are not authorized to view this student'
      });
    }

    // ✅ Transform the data for easier frontend consumption
    const transformedStudent = {
      ...student,
      // Transform courseStudents to courses for backward compatibility
      courses: student.courseStudents.map(cs => ({
        ...cs.course,
        enrolledAt: cs.enrolledAt
      })),
      // Add computed statistics
      stats: {
        totalCourses: student.courseStudents.length,
        totalExams: student.results.length,
        averageScore: student.results.length > 0 
          ? (student.results.reduce((sum, result) => sum + result.score, 0) / student.results.length).toFixed(2)
          : 0,
        recentActivity: student.examSessions.filter(session => session.isActive).length > 0 ? 'Active' : 'Inactive'
      }
    };

    // Remove the courseStudents from response to avoid confusion
    delete transformedStudent.courseStudents;

    // Return the student data
    res.status(200).json({
      message: 'Student retrieved successfully',
      student: transformedStudent
    });

  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({
      message: 'Failed to fetch student',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getStudentForEdit = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Find the student with minimal data needed for editing
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: {
        id: true,
        matricNo: true,
        firstName: true,
        lastName: true,
        examinerId: true,
        email: true,
        phone: true,
        department: true,
        level: true,
        isActive: true
      }
    });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if requesting examiner has access to this student
    if (student.examinerId !== requestingExaminerId) {
      return res.status(403).json({ 
        message: 'Access denied: You are not authorized to edit this student' 
      });
    }

    // Return the student data for editing
    res.status(200).json({
      message: 'Student data retrieved for editing',
      student
    });

  } catch (err) {
    console.error('Error fetching student for edit:', err);
    res.status(500).json({
      message: 'Failed to fetch student data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  console.log('Received update payload:', req.body);

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Check if student exists and belongs to examiner
    const existingStudent = await prisma.student.findUnique({
      where: {
        id: parseInt(studentId),
        examinerId: parseInt(requestingExaminerId)
      }
    });

    if (!existingStudent) {
      return res.status(404).json({ 
        message: 'Student not found or not owned by this examiner' 
      });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'matricNo'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        requiredFields
      });
    }

    // Check if matricNo is being changed and if so, ensure it's unique
    if (req.body.matricNo !== existingStudent.matricNo) {
      const existingMatricNo = await prisma.student.findUnique({
        where: { matricNo: req.body.matricNo }
      });

      if (existingMatricNo) {
        return res.status(400).json({
          message: 'Matric number already exists',
          field: 'matricNo'
        });
      }
    }

    // Prepare update data with defaults
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      matricNo: req.body.matricNo,
      email: req.body.email || null,
      phone: req.body.phone || null,
      department: req.body.department || null,
      level: req.body.level || null,
      isActive: req.body.isActive !== false,
      lastActive: req.body.lastActive || existingStudent.lastActive
    };

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(studentId) },
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
        courses: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (err) {
    console.error('Error updating student:', {
      message: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({
      message: 'Failed to update student',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      validationErrors: err.meta // Prisma validation errors
    });
  }
};



exports.getStudentsByExaminer = async (req, res) => {
  const examinerId = req.user.userId;
  
  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }
    
    // Retrieve all students associated with the examiner WITH course enrollment info
    const students = await prisma.student.findMany({
      where: {
        examinerId: parseInt(examinerId),
      },
      include: {
        courseStudents: {
          include: {
            course: true // Include course details if needed
          }
        },
        _count: {
          select: {
            courseStudents: true // This will give you the count of enrolled courses
          }
        }
      }
    });
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for this examiner' });
    }
    
    res.status(200).json({ students });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve students. Please try again.' });
  }
};



//...............................New details ...................

exports.getEligibleStudents=async (req,res)=>{
  const { examId } =req.params;
  const examinerId =req.user.userId


  try{
    
    const exam =await prisma.exam.findUnique({
      where:{
        id:parseInt(examId),
        examinerId:parseInt(examinerId)
      },select:{
        id:true,
        courseId:true,
        title:true
      }
    });

    if(!exam){
      return res.status(404).json({
        message:'Exam not found or you do not have permission to access it '
      })
    }
    //Get all students enrolled in the course
    const eligibleStudents =await prisma.courseStudent.findMany({
      where:{
        courseId:exam.courseId
      },include:{
        student:{
          select:{
            id:true,
            firstName:true,
            lastName:true,
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
      orderBy:{
        enrolledAt:'desc'
      }
    });

    //Response format
    const students =eligibleStudents.map(cs=>({
      ...cs.student,
      enrolledAt:cs.enrolledAt,
      hasAttempted:false //....................Logic to check exam result will be added here later

    }));
    res.status(200).json({
      students,
      examInfo:{
        id:exam.id,
        title:exam.title,
        courseId:exam.courseId
      },
      total:students.length,
      activeStudents:students.filter(s=>s.isActive).length
    })
  }catch(err){
    console.error(err);
    res.status(500).json({
      message:'Failed to retrieve eligible students',
      error:process.env.NODE_ENV === 'development' ? err.message :undefined
    })
  }
}

// 2. GET /course/:courseId/questions - Returns all questions from a course

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



async function getNextQuestionOrder(examId){
  const lastQuestion =await prisma.examQuestion.findFirst({
    where:{examId:parseInt(examId)},
    orderBy:{ order: 'desc'},
    select:{ order:true}
  });

  return lastQuestion ? lastQuestion.order + 1 :  1; 
}

exports.removeQuestionFromExam = async (req, res) => {
  const { examId, examQuestionId } = req.params;
  const examinerId = req.user.userId;

  try {
    // Verify exam ownership and that it's not published
    const exam = await prisma.exam.findUnique({
      where: {
        id: parseInt(examId),
        examinerId: parseInt(examinerId)
      },
      select: {
        id: true,
        title: true,
        isPublished: true
      }
    });

    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found or you do not have permission to access it'
      });
    }

    if (exam.isPublished) {
      return res.status(400).json({
        message: 'Cannot modify questions in a published exam'
      });
    }

    // Verify examQuestion exists and belongs to this exam
    const examQuestion = await prisma.examQuestion.findUnique({
      where: {
        id: parseInt(examQuestionId),
        examId: parseInt(examId)
      },
      include: {
        question: {
          select: {
            id: true,
            questionText: true
          }
        }
      }
    });

    if (!examQuestion) {
      return res.status(404).json({
        message: 'Question not found in this exam'
      });
    }

    // Remove question from exam
    await prisma.examQuestion.delete({
      where: {
        id: parseInt(examQuestionId)
      }
    });

    res.status(200).json({
      message: 'Question removed from exam successfully',
      removedQuestion: {
        id: examQuestion.question.id,
        questionText: examQuestion.question.questionText
      },
      examInfo: {
        id: exam.id,
        title: exam.title
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to remove question from exam',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.addStudentToExam = async (req, res) => {
  const { examId } = req.params;
  const { studentId } = req.body;
  const examinerId = req.user.userId;

  try {
    // Verify exam ownership
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId), examinerId: parseInt(examinerId) },
      select: { id: true, title: true, courseId: true, isPublished: true }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or you do not have permission to access it' });
    }

    if (exam.isPublished) {
      return res.status(400).json({ message: 'Cannot modify students in a published exam' });
    }

    // Verify student is enrolled in the course
    const courseStudent = await prisma.courseStudent.findFirst({
      where: { studentId: parseInt(studentId), courseId: exam.courseId },
      include: { student: { select: { id: true, firstName: true, lastName: true, matricNo: true } } }
    });

    if (!courseStudent) {
      return res.status(400).json({ message: 'Student is not enrolled in the course' });
    }

    // Check if student is already added
    const existingStudent = await prisma.exam.findFirst({
      where: { id: parseInt(examId), students: { some: { id: parseInt(studentId) } } }
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Student is already added to this exam' });
    }

    // Add student to exam
    const updatedExam = await prisma.exam.update({
      where: { id: parseInt(examId) },
      data: { students: { connect: { id: parseInt(studentId) } } },
      include: { students: { select: { id: true, firstName: true, lastName: true, matricNo: true } } }
    });

    res.status(201).json({
      message: 'Student added to exam successfully',
      exam: updatedExam
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to add student to exam',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.removeStudentFromExam = async (req, res) => {
  const { examId, studentId } = req.params;
  const examinerId = req.user.userId;

  try {
    // Verify exam ownership
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId), examinerId: parseInt(examinerId) },
      select: { id: true, title: true, isPublished: true }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or you do not have permission to access it' });
    }

    if (exam.isPublished) {
      return res.status(400).json({ message: 'Cannot modify students in a published exam' });
    }

    // Verify student is in the exam
    const examStudent = await prisma.exam.findFirst({
      where: { id: parseInt(examId), students: { some: { id: parseInt(studentId) } } },
      include: { students: { where: { id: parseInt(studentId) }, select: { id: true, firstName: true, lastName: true, matricNo: true } } }
    });

    if (!examStudent) {
      return res.status(404).json({ message: 'Student not found in this exam' });
    }

    // Remove student from exam
    const updatedExam = await prisma.exam.update({
      where: { id: parseInt(examId) },
      data: { students: { disconnect: { id: parseInt(studentId) } } },
      include: { students: { select: { id: true, firstName: true, lastName: true, matricNo: true } } }
    });

    res.status(200).json({
      message: 'Student removed from exam successfully',
      exam: updatedExam,
      removedStudent: examStudent.students[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to remove student from exam',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.addRandomQuestionsToExam = async (req, res) => {
  const { examId } = req.params;
  const { count } = req.body;
  const examinerId = req.user.userId;

  try {
    // Validate input
    if (!count || isNaN(count) || count <= 0) {
      return res.status(400).json({ message: 'Valid count is required' });
    }

    // Verify exam ownership
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId), examinerId: parseInt(examinerId) },
      select: { id: true, title: true, courseId: true, isPublished: true }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or you do not have permission to access it' });
    }

    if (exam.isPublished) {
      return res.status(400).json({ message: 'Cannot modify questions in a published exam' });
    }

    // Get available questions not already in the exam
    const existingQuestionIds = await prisma.examQuestion.findMany({
      where: { examId: parseInt(examId) },
      select: { questionId: true }
    });
    const excludeIds = existingQuestionIds.map(q => q.questionId);

    const availableQuestions = await prisma.question.findMany({
      where: {
        courseId: exam.courseId,
        id: { notIn: excludeIds }
      },
      select: { id: true, points: true },
      take: parseInt(count)
    });

    if (availableQuestions.length < count) {
      return res.status(400).json({
        message: `Only ${availableQuestions.length} questions available, requested ${count}`
      });
    }

    // Add questions to exam
    const examQuestions = await prisma.$transaction(
      availableQuestions.map((q, index) =>
        prisma.examQuestion.create({
          data: {
            examId: parseInt(examId),
            questionId: q.id,
            points: q.points || 1.0,
            order: index + 1
          },
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                correctAnswer: true
              }
            }
          }
        })
      )
    );

    res.status(201).json({
      message: `${count} questions added to exam successfully`,
      examQuestions,
      examInfo: { id: exam.id, title: exam.title }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to add random questions to exam',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// 3. POST /exam/:examId/questions - Adds a question to an exam (creates ExamQuestion)
exports.addQuestionToExam = async (req, res) => {
  const { examId } = req.params;
  const { questionId, points,order } = req.body;
  const examinerId = req.user.userId;

  try {
    // Verify exam ownership and that it's not published
    const exam = await prisma.exam.findUnique({
      where: {
        id: parseInt(examId),
        examinerId: parseInt(examinerId)
      },
      select: {
        id: true,
        title: true,
        courseId: true,
        isPublished: true
      }
    });

    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found or you do not have permission to access it'
      });
    }

    if (exam.isPublished) {
      return res.status(400).json({
        message: 'Cannot modify questions in a published exam'
      });
    }

    // Verify question belongs to the same course
    const question = await prisma.question.findUnique({
      where: {
        id: parseInt(questionId),
        courseId: exam.courseId
      },
      select: {
        id: true,
        questionText: true,
        points: true
      }
    });

    if (!question) {
      return res.status(404).json({
        message: 'Question not found or does not belong to this course'
      });
    }

    // Check if question is already added to this exam
    const existingExamQuestion = await prisma.examQuestion.findUnique({
      where: {
        examId_questionId: {
          examId: parseInt(examId),
          questionId: parseInt(questionId)
        }
      }
    });

    if (existingExamQuestion) {
      return res.status(400).json({
        message: 'Question is already added to this exam'
      });
    }

    // Add question to exam
    const examQuestion = await prisma.examQuestion.create({
      data: {
        examId: parseInt(examId),
        questionId: parseInt(questionId),
        points: points || question.points ,// Use custom points or default from question
        order: order || await getNextQuestionOrder(examId)

      },
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            correctAnswer: true,
            category: true,
            difficulty: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Question added to exam successfully',
      examQuestion,
      examInfo: {
        id: exam.id,
        title: exam.title
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to add question to exam',
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

// 4. DELETE /exam/:examId/questions/:examQuestionId - Removes question from exam

exports.getExamResults = async (req, res) => {
  const { examId } = req.params;
  const examinerId = req.user.userId;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId), examinerId: parseInt(examinerId) },
      select: { id: true }
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }
    const results = await prisma.examResult.findMany({
      where: { examId: parseInt(examId) },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, matricNo: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
    res.status(200).json({ results, total: results.length });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch results',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getQuestionAnalytics = async (req, res) => {
  const { examId } = req.params;
  const examinerId = req.user.userId;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId), examinerId: parseInt(examinerId) },
      select: { id: true }
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }
    const analytics = await prisma.questionAnalytics.findMany({
      where: { examId: parseInt(examId) },
      include: { question: { select: { id: true, questionText: true } } },
      orderBy: { questionId: 'asc' }
    });
    res.status(200).json({ analytics, total: analytics.length });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch question analytics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.getExamAttendances = async (req, res) => {
  const { examId } = req.params;
  const examinerId = req.user.userId;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId), examinerId: parseInt(examinerId) },
      select: { id: true }
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }
    const attendances = await prisma.attendance.findMany({
      where: { examId: parseInt(examId) },
      include: { student: { select: { id: true, firstName: true, lastName: true, matricNo: true } } },
      orderBy: { timestamp: 'desc' }
    });
    res.status(200).json({ attendances, total: attendances.length });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch attendances',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/*
exports.studentExamLogin = async (req, res) => {
  const { matricNo, password } = req.body;

  if (!matricNo || !password) {
    return res.status(400).json({ message: 'Matric number and password are required' });
  }

  try {
    // Find student by matricNo
    const student = await prisma.student.findUnique({
      where: { matricNo },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNo: true,
        isActive: true
      }
    });

    if (!student || !student.isActive) {
      return res.status(401).json({ message: 'Invalid matric number or inactive account' });
    }

    // Find exams where student is enrolled and password matches
    const exams = await prisma.exam.findMany({
      where: {
        students: { some: { id: student.id } },
        password,
        isPublished: true,
        state: 'ACTIVE',
        OR: [
          { startTime: null },
          { startTime: { lte: new Date() } }
        ],
        OR: [
          { endTime: null },
          { endTime: { gte: new Date() } }
        ]
      },
      select: {
        id: true,
        title: true,
        date: true,
        duration: true,
        startTime: true,
        endTime: true,
        maxAttempts: true,
        state: true,
        isPublished: true,
        course: { select: { id: true, title: true } },
        results: {
          where: { studentId: student.id },
          select: { id: true }
        }
      }
    });

    // Add attemptsTaken to each exam
    const examsWithAttempts = exams.map((exam) => ({
      ...exam,
      attemptsTaken: exam.results.length
    }));

    if (exams.length === 0) {
      return res.status(401).json({ message: 'Invalid exam password or no accessible exams' });
    }

    res.status(200).json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        matricNo: student.matricNo
      },
      exams: examsWithAttempts
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Failed to authenticate',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.startExam = async (req, res) => {
  const { examId } = req.params;
  const { matricNo } = req.body;

  if (!/^\d+$/.test(examId)) {
    return res.status(400).json({ message: 'Invalid exam ID' });
  }
  if (!matricNo) {
    return res.status(400).json({ message: 'Matric number is required' });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { matricNo },
      select: { id: true, isActive: true }
    });

    if (!student || !student.isActive) {
      return res.status(401).json({ message: 'Invalid matric number or inactive account' });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      select: {
        id: true,
        isPublished: true,
        state: true,
        startTime: true,
        endTime: true,
        maxAttempts: true,
        students: { select: { id: true } },
        results: {
          where: { studentId: student.id },
          select: { id: true }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    if (!exam.isPublished || exam.state !== 'ACTIVE') {
      return res.status(403).json({ message: 'Exam is not active' });
    }
    if (!exam.students.some((s) => s.id === student.id)) {
      return res.status(403).json({ message: 'You are not enrolled in this exam' });
    }
    if (
      exam.startTime && new Date() < new Date(exam.startTime) ||
      exam.endTime && new Date() > new Date(exam.endTime)
    ) {
      return res.status(403).json({ message: 'Exam is not available at this time' });
    }
    if (exam.results.length >= exam.maxAttempts) {
      return res.status(403).json({ message: 'Maximum attempts reached' });
    }

    // Check for existing active session
    const existingSession = await prisma.examSession.findFirst({
      where: {
        examId: parseInt(examId),
        studentId: student.id,
        isActive: true
      }
    });

    if (existingSession) {
      return res.status(400).json({ message: 'An active exam session already exists' });
    }

    // Create exam session
    const session = await prisma.examSession.create({
      data: {
        examId: parseInt(examId),
        studentId: student.id,
        startedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isActive: true
      },
      select: { id: true }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Start exam error:', err);
    res.status(500).json({
      message: 'Failed to start exam',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
*/


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



// ============= AUTHENTICATION ENDPOINTS FOR STUDENTS  =============
// Student login with matric number and exam password
exports.studentLogin = async (req, res) => {
  const { matricNo, password } = req.body;

  if (!matricNo || !password) {
    return res.status(400).json({ message: 'Matric number and password are required' });
  }

  try {
    // Find student by matricNo
    const student = await prisma.student.findUnique({
      where: { matricNo },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNo: true,
        email: true,
        isActive: true
      }
    });

    if (!student || !student.isActive) {
      return res.status(401).json({ message: 'Invalid matric number or inactive account' });
    }

    // Find exams where student is enrolled and password matches
    const exams = await prisma.exam.findMany({
      where: {
        students: { some: { id: student.id } },
        password,
        isPublished: true,
        state: 'ACTIVE',
        OR: [
          { startTime: null },
          { startTime: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endTime: null },
              { endTime: { gte: new Date() } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        duration: true,
        startTime: true,
        endTime: true,
        maxAttempts: true,
        state: true,
        isPublished: true,
        course: { select: { id: true, title: true, code: true } },
        results: {
          where: { studentId: student.id },
          select: { id: true, status: true, score: true }
        }
      }
    });

    if (exams.length === 0) {
      return res.status(401).json({ message: 'Invalid exam password or no accessible exams' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { studentId: student.id, matricNo: student.matricNo },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '4h' }
    );

    // Add attempt information to each exam
    const examsWithAttempts = exams.map((exam) => ({
      ...exam,
      attemptsTaken: exam.results.length,
      canTakeExam: exam.results.length < exam.maxAttempts,
      lastAttempt: exam.results.length > 0 ? exam.results[exam.results.length - 1] : null
    }));

    const primaryExam =examsWithAttempts[0]

    /*
    res.status(200).json({
      success: true,
      token,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        matricNo: student.matricNo,
        email: student.email
      },
      exams: examsWithAttempts
    });
    */
   res.status(200).json({
  success: true,
  token,
  student,
  exam: primaryExam, // Single exam instead of array
  examiner: null, // Add if needed
  course: primaryExam.course,
  examSession: null // Will be created when starting exam
});


  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Failed to authenticate',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get available exams for a student
exports.getStudentExams = async (req, res) => {
  const { matricNo } = req.params;

  try {
    const student = await prisma.student.findUnique({
      where: { matricNo },
      select: { id: true }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const exams = await prisma.exam.findMany({
      where: {
        students: { some: { id: student.id } },
        isPublished: true,
        OR: [
          { state: 'PUBLISHED' },
          { state: 'ACTIVE' }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        duration: true,
        startTime: true,
        endTime: true,
        maxAttempts: true,
        state: true,
        course: { select: { id: true, title: true, code: true } },
        results: {
          where: { studentId: student.id },
          select: { id: true, status: true, score: true, submittedAt: true }
        }
      }
    });

    const examsWithStatus = exams.map(exam => ({
      ...exam,
      attemptsTaken: exam.results.length,
      canTakeExam: exam.results.length < exam.maxAttempts && exam.state === 'ACTIVE',
      isAvailable: exam.state === 'ACTIVE' && 
        (!exam.startTime || new Date() >= exam.startTime) &&
        (!exam.endTime || new Date() <= exam.endTime)
    }));

    res.status(200).json({ exams: examsWithStatus });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

// ============= EXAM SESSION MANAGEMENT =============

// Fetch exam session data
exports.fetchExamSession = async (req, res) => {
  const { examId } = req.params;
  const { studentId } = req.query;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: {
        course: { select: { id: true, title: true, code: true } },
        examiner: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true,
            email: true 
          } 
        },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                points: true,
                imageUrl: true,
                difficulty: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNo: true,
        email: true
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get existing exam session
    const examSession = await prisma.examSession.findFirst({
      where: {
        examId: parseInt(examId),
        studentId: parseInt(studentId),
        isActive: true
      }
    });

    // Get existing answers
    const existingAnswers = examSession ? await prisma.answer.findMany({
      where: { questionId: { in: exam.examQuestions.map(eq => eq.question.id) } }
    }) : [];

    // Calculate time remaining
    const examDuration = exam.duration * 60; // Convert to seconds
    const startTime = examSession?.startedAt || new Date();
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    const timeRemaining = Math.max(0, examDuration - elapsed);

    // Get violations
    const violations = examSession ? JSON.parse(examSession.violations || '[]') : [];

    // Format questions
    const questions = exam.examQuestions.map(eq => ({
      ...eq.question,
      order: eq.order,
      points: eq.points
    }));

    res.status(200).json({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        instructions: exam.instructions,
        proctoringSettings: exam.proctoringSettings
      },
      examiner: exam.examiner,
      course: exam.course,
      student,
      questions,
      examSession,
      existingAnswers: existingAnswers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.content;
        return acc;
      }, {}),
      timeRemaining,
      violations
    });
  } catch (error) {
    console.error('Fetch exam session error:', error);
    res.status(500).json({ message: 'Failed to fetch exam session' });
  }
};


// Start new exam session
exports.startExamSession = async (req, res) => {
  const { examId } = req.params;
  const { studentId } = req.body;

  if (!examId || !studentId) {
    return res.status(400).json({ 
      message: 'Exam ID and Student ID are required' 
    });
  }

  const transaction = await prisma.$transaction(async (tx) => {
    try {
      // Validate exam and student
      const exam = await tx.exam.findUnique({
        where: { id: parseInt(examId) },
        include: {
          students: { 
            select: { id: true } 
          },
          results: { 
            where: { studentId: parseInt(studentId) },
            select: { id: true, status: true, startTime: true }
          },
          questions: {
            select: { id: true },
            orderBy: { order: 'asc' }
          },
          examiner: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true,
              settings: true
            }
          },
          course: {
            select: { 
              id: true, 
              courseCode: true, 
              courseTitle: true 
            }
          }
        }
      });

      if (!exam) {
        return res.status(404).json({ 
          message: 'Exam not found' 
        });
      }

      // Validate student
      const student = await tx.student.findUnique({
        where: { id: parseInt(studentId) },
        select: { 
          id: true, 
          matricNo: true, 
          firstName: true, 
          lastName: true 
        }
      });

      if (!student) {
        return res.status(404).json({ 
          message: 'Student not found' 
        });
      }

      // Check if student is enrolled
      if (!exam.students.some(s => s.id === parseInt(studentId))) {
        return res.status(403).json({ 
          message: 'Student not enrolled in this exam' 
        });
      }

      // Check attempt limits
      const completedAttempts = exam.results.filter(r => 
        r.status === 'COMPLETED' || r.status === 'SUBMITTED'
      ).length;

      if (completedAttempts >= exam.maxAttempts) {
        return res.status(403).json({ 
          message: `Maximum attempts reached (${exam.maxAttempts})` 
        });
      }

      // Check if there's an active session
      const activeResult = exam.results.find(r => 
        r.status === 'IN_PROGRESS' || r.status === 'STARTED'
      );

      if (activeResult) {
        return res.status(409).json({
          message: 'An active exam session already exists',
          sessionId: activeResult.id,
          startTime: activeResult.startTime
        });
      }

      // Check exam timing - PERFECT TIMING VALIDATION
      const now = new Date();
      const examStart = new Date(exam.startTime);
      const examEnd = new Date(exam.endTime);

      // Check if exam hasn't started yet
      if (now < examStart) {
        const timeUntilStart = Math.ceil((examStart - now) / (1000 * 60)); // minutes
        return res.status(423).json({
          message: 'Exam has not started yet',
          startsIn: timeUntilStart,
          startTime: exam.startTime,
          currentTime: now.toISOString()
        });
      }

      // Check if exam has ended
      if (now > examEnd) {
        return res.status(423).json({
          message: 'Exam has ended',
          endTime: exam.endTime,
          currentTime: now.toISOString()
        });
      }

      // Calculate available time (considering late start)
      const totalExamDuration = exam.duration * 60 * 1000; // Convert to milliseconds
      const timeSinceStart = now - examStart;
      const remainingExamTime = examEnd - now;
      
      // Use the smaller of: allocated duration or remaining exam window
      const availableTime = Math.min(totalExamDuration, remainingExamTime);
      const availableMinutes = Math.floor(availableTime / (1000 * 60));

      // Check if there's enough time left (minimum 5 minutes)
      if (availableMinutes < 5) {
        return res.status(423).json({
          message: 'Insufficient time remaining to start exam',
          timeRemaining: availableMinutes,
          minimumRequired: 5
        });
      }

      // Check exam status
      if (exam.status !== 'ACTIVE') {
        return res.status(423).json({
          message: `Exam is ${exam.status.toLowerCase()}`,
          status: exam.status
        });
      }

      // Create new exam result/session
      const examResult = await tx.examResult.create({
        data: {
          examId: parseInt(examId),
          studentId: parseInt(studentId),
          status: 'STARTED',
          startTime: now,
          timeRemaining: availableMinutes,
          totalTime: availableMinutes,
          score: 0,
          totalQuestions: exam.questions.length,
          answeredQuestions: 0,
          violations: [],
          answers: {},
          metadata: {
            examTitle: exam.title,
            examDuration: exam.duration,
            lateStart: timeSinceStart > 60000, // More than 1 minute late
            timeSinceExamStart: Math.floor(timeSinceStart / 1000), // seconds
            browserInfo: req.headers['user-agent'],
            ipAddress: req.ip,
            sessionStartTime: now.toISOString()
          }
        }
      });

      // Create attendance record
      await tx.attendance.create({
        data: {
          examId: parseInt(examId),
          studentId: parseInt(studentId),
          status: 'PRESENT',
          checkInTime: now,
          examResultId: examResult.id
        }
      });

      // Load questions for the session (first batch)
      const questions = await tx.question.findMany({
        where: { examId: parseInt(examId) },
        select: {
          id: true,
          type: true,
          questionText: true,
          options: true,
          marks: true,
          order: true,
          metadata: true
        },
        orderBy: { order: 'asc' },
        take: 10 // Load first 10 questions
      });

      // Shuffle questions if enabled
      let finalQuestions = questions;
      if (exam.shuffleQuestions) {
        finalQuestions = [...questions].sort(() => Math.random() - 0.5);
        
        // Update the question order in session metadata
        await tx.examResult.update({
          where: { id: examResult.id },
          data: {
            metadata: {
              ...examResult.metadata,
              questionOrder: finalQuestions.map(q => q.id),
              questionsShuffled: true
            }
          }
        });
      }

      // Prepare response data
      const sessionData = {
        sessionId: examResult.id,
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          instructions: exam.instructions,
          allowReview: exam.allowReview,
          allowFlagging: exam.allowFlagging,
          shuffleQuestions: exam.shuffleQuestions,
          proctoringSettings: exam.proctoringSettings,
          status: exam.status
        },
        examiner: exam.examiner,
        course: exam.course,
        student: student,
        session: {
          id: examResult.id,
          status: examResult.status,
          startTime: examResult.startTime,
          timeRemaining: availableMinutes,
          totalTime: availableMinutes,
          totalQuestions: exam.questions.length,
          currentQuestionIndex: 0,
          isActive: true
        },
        questions: finalQuestions,
        timing: {
          serverTime: now.toISOString(),
          examStartTime: exam.startTime,
          examEndTime: exam.endTime,
          sessionStartTime: examResult.startTime,
          availableMinutes: availableMinutes,
          lateStart: timeSinceStart > 60000
        },
        settings: {
          autoSaveEnabled: true,
          autoSaveInterval: 30, // seconds
          timerSyncEnabled: true,
          timerSyncInterval: 120, // seconds
          heartbeatInterval: 30, // seconds
          proctoringEnabled: exam.proctoringSettings?.enabled || false
        }
      };

      return res.status(201).json({
        success: true,
        message: 'Exam session started successfully',
        data: sessionData
      });

    } catch (error) {
      console.error('Error starting exam session:', error);
      throw error; // This will cause the transaction to rollback
    }
  });
};

// Helper function to check exam timing (can be used independently)
exports.validateExamTiming = (exam) => {
  const now = new Date();
  const examStart = new Date(exam.startTime);
  const examEnd = new Date(exam.endTime);
  
  if (now < examStart) {
    return {
      valid: false,
      reason: 'NOT_STARTED',
      message: 'Exam has not started yet',
      timeUntilStart: Math.ceil((examStart - now) / (1000 * 60))
    };
  }
  
  if (now > examEnd) {
    return {
      valid: false,
      reason: 'ENDED',
      message: 'Exam has ended',
      timeSinceEnd: Math.ceil((now - examEnd) / (1000 * 60))
    };
  }
  
  const totalExamDuration = exam.duration * 60 * 1000;
  const timeSinceStart = now - examStart;
  const remainingExamTime = examEnd - now;
  const availableTime = Math.min(totalExamDuration, remainingExamTime);
  const availableMinutes = Math.floor(availableTime / (1000 * 60));
  
  if (availableMinutes < 5) {
    return {
      valid: false,
      reason: 'INSUFFICIENT_TIME',
      message: 'Insufficient time remaining',
      timeRemaining: availableMinutes
    };
  }
  
  return {
    valid: true,
    availableMinutes,
    lateStart: timeSinceStart > 60000,
    timeSinceStart: Math.floor(timeSinceStart / 1000)
  };
};

// Helper function to calculate remaining time for existing sessions
exports.calculateRemainingTime = (examResult, exam) => {
  const now = new Date();
  const sessionStart = new Date(examResult.startTime);
  const examEnd = new Date(exam.endTime);
  
  // Time elapsed since session started
  const elapsedTime = now - sessionStart;
  const elapsedMinutes = Math.floor(elapsedTime / (1000 * 60));
  
  // Calculate remaining time based on session allocation
  const sessionTimeRemaining = examResult.totalTime - elapsedMinutes;
  
  // Also consider exam window end time
  const examTimeRemaining = Math.floor((examEnd - now) / (1000 * 60));
  
  // Use the smaller of the two
  const actualTimeRemaining = Math.max(0, Math.min(sessionTimeRemaining, examTimeRemaining));
  
  return {
    timeRemaining: actualTimeRemaining,
    sessionTimeRemaining,
    examTimeRemaining,
    elapsedMinutes,
    shouldAutoSubmit: actualTimeRemaining <= 0
  };
};