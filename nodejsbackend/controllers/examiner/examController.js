const { prisma } = require('@database'); // Import prisma client

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


// Get all exams by course
exports.getExamsByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const exams = await prisma.exam.findMany({
      where: { courseId: parseInt(courseId) },
    });

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exams.' });
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
