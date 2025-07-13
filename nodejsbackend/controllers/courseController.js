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
  const examinerId = req.user.userId; // From JWT token

 // const examinerId = req.user.id; // Assuming examiner ID is in the JWT token

  try {
    // Basic validation
    if (!courseId) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    // Retrieve exam with all related data
    const course  = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId),
        examinerId: parseInt(examinerId) // Corrected from parse() to parseInt()
        
      },

      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricNo: true
          },
          orderBy: {
            lastName: 'asc' // Alphabetical student sorting
          },
          take: 50 // Limit student preview
        },
        exams: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            date: true,
            _count: {
              select: {
                students: true,
                results: true
              }
            }
          },
          orderBy: {
            date: 'desc' // Newest exams first
          }
        },
        _count: {
          select: {
            students: true,
            exams: true
          }
        }
      }


    });

   
    if (!course) {
      // More specific error message
      return res.status(404).json({ 
        message: 'Exam not found or you do not have permission to access it',
        courseId,
        examinerId
      });
    }

    // Verify the exam belongs to the requesting examiner
    if (course.examinerId !== parseInt(examinerId)) {
      return res.status(403).json({ message: 'Unauthorized access to this exam' });
    }

    const stats = {
      totalStudents: course._count.students,
      totalExams: course._count.exams,
      activeExams: course.exams.filter(exam => exam.isPublished).length,
      upcomingExams: course.exams.filter(exam => {
        try {
          return new Date(exam.date) > new Date();
        } catch {
          return false;
        }
      }).length,
      enrollmentRate: course._count.students > 0 
        ? (course._count.students / (course._count.students + 10)) * 100 // Replace 10 with your actual available slots logic
        : 0,
      averageExamScore: course.exams.length > 0
        ? course.exams.reduce((sum, exam) => {
            // Remove results calculation since we didn't include them
            return sum + 0; // Placeholder - implement your actual score logic
          }, 0) / course.exams.length
        : 0
    };

    res.status(200).json({ course, stats });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Failed to retrieve exam',
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
        students: {
          select: {
            id: true,
            firstName:true,
            lastName:true,
            matricNo:true,
           
          }
        },
        _count: {
          select: {
            exams: true,
            students: true
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
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricNo: true
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
    await prisma.question.deleteMany({
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



// Select Course and Exam for Student Registration (for the Admin/Examiner interface)
exports.getCoursesAndExamsForRegistration = async (req, res) => {
  const { examinerId } = req.params;

  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }

    // Get all courses and exams that belong to the examiner
    const courses = await prisma.course.findMany({
      where: { examinerId: parseInt(examinerId) },
    });

    const exams = await prisma.exam.findMany({
      where: { examinerId: parseInt(examinerId) },
    });

    if (courses.length === 0 || exams.length === 0) {
      return res.status(404).json({ message: 'No courses or exams found for this examiner' });
    }

    res.status(200).json({
      courses,
      exams,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve courses and exams for registration. Please try again.' });
  }
};


// Get single exam with all related data (with examiner validation)
exports.getExamById = async (req, res) => {
  
  const { examId } = req.params;
  const examinerId = req.user.userId; // From JWT token

 // const examinerId = req.user.id; // Assuming examiner ID is in the JWT token

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
        questions: {
          /*
          include: {
            options: true
          },
          */
          orderBy: {
            createdAt: 'asc'
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
        _count: {
          select: {
            students: true,
            results: true,
            questions: true
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
      questions: exam._count.questions,
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

  
/*

    // Verify requesting examiner matches URL parameter
    if (parseInt(examinerId) !== parseInt(requestingExaminerId)) {
      return res.status(403).json({ message: 'Unauthorized access to this exam' });
    }
      */

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
        questions: {
          select: {
            id: true,
           questionText: true,
          questionType: true,
          difficulty: true,    // Alternative field since points doesn't exist
          options: true,       // This is an array of strings, not a relation
          correctAnswer: true  // Include this for editing
           // points: true,
           /*
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true
              }
            }
              */
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            questions: true,
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
      // First delete all existing questions
      await prisma.question.deleteMany({
        where: { examId: parseInt(examId) }
      });

      // Then create new questions with options
      questionsUpdate = {
        questions: {
          create: questions.map(question => ({
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options, // This is correct since options is String[]
            correctAnswer: question.correctAnswer,
            difficulty: question.difficulty || 'Medium',
            category: question.category || 'GENERAL',
            tags: question.tags || [],
            imageUrl: question.imageUrl || null
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
        questions: {
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
              */
          },
          /*
          orderBy: {
            date: 'desc'
          },
          */
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

/*
exports.getStudentsByExaminer=async(req,res)=>{
  const examinerId=req.user.userId
  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }

    // Retrieve all courses associated with the examiner
    const students = await prisma.student.findMany({
      where: {
        examinerId: parseInt(examinerId), // Ensure examinerId is an integer
      },
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for this examiner' });
    }

    res.status(200).json({ students });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve courses. Please try again.' });
  }

}
  */

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
