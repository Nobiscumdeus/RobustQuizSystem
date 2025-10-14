
const { prisma } = require('../../database');



exports.validateExamAccess = async (req, res) => {
  const { examId } = req.params;
  const { password } = req.body;
  const studentId = req.student.studentId;

  if (!password) {
    return res.status(400).json({ 
      message: 'Exam password is required' 
    });
  }

  try {
    // Get exam data with maxAttempts and student's results
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      select: {
        id: true,
        title: true,
        password: true,
        duration: true,
        state: true,
        maxAttempts: true,
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        results: {
          where: { studentId: studentId },
          select: { id: true, status: true }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // ✅ NEW: Check max attempts
    const attemptsTaken = exam.results.length;
    if (attemptsTaken >= exam.maxAttempts) {
      return res.status(403).json({ 
        message: `Maximum attempts (${exam.maxAttempts}) exceeded. You cannot take this exam again.`,
        attemptsTaken,
        maxAttempts: exam.maxAttempts
      });
    }

    // Auto-activate published exams
    if (exam.state === 'PUBLISHED') {
      await prisma.exam.update({
        where: { id: parseInt(examId) },
        data: { 
          state: 'ACTIVE',
          activatedAt: new Date()
        }
      });
    }

    // Check exam availability
    if (!['PUBLISHED', 'ACTIVE'].includes(exam.state)) {
      return res.status(403).json({ 
        message: 'Exam is not available for students'
      });
    }

    // Validate password
    if (exam.password !== password) {
      return res.status(401).json({ 
        message: 'Invalid exam password' 
      });
    }

    // Check for existing session (rest of your existing code...)
    let existingSession = await prisma.examSession.findUnique({
      where: {
        studentId_examId: {
          studentId,
          examId: parseInt(examId)
        }
      }
    });

    // Return existing session or create new one
    if (existingSession) {
      // Reactivate if needed
      if (!existingSession.isActive) {
        existingSession = await prisma.examSession.update({
          where: { id: existingSession.id },
          data: { isActive: true, startedAt: new Date() }
        });
      }

      const timeElapsed = Math.floor((new Date() - existingSession.startedAt) / 1000);
      
      return res.status(200).json({
        success: true,
        message: 'Exam session resumed',
        examSession: {
          id: existingSession.id,
          startedAt: existingSession.startedAt.toISOString(),
          timeElapsed: timeElapsed,
          duration: exam.duration * 60
        },
        exam: {
          id: exam.id,
          title: exam.title,
          duration: exam.duration,
          course: exam.course,
          maxAttempts: exam.maxAttempts,
          attemptsTaken: attemptsTaken
        }
      });
    }

    // Create new session
    const examSession = await prisma.examSession.create({
      data: {
        studentId,
        examId: parseInt(examId),
        startedAt: new Date(),
        isActive: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Exam access granted',
      examSession: {
        id: examSession.id,
        startedAt: examSession.startedAt.toISOString(),
        timeElapsed: 0,
        duration: exam.duration * 60
      },
      exam: {
        id: exam.id,
        title: exam.title,
        duration: exam.duration,
        course: exam.course,
        maxAttempts: exam.maxAttempts,
        attemptsTaken: attemptsTaken
      }
    });

  } catch (err) {
    console.error('Exam access validation error:', err);
    res.status(500).json({
      message: 'Failed to validate exam access',
      error: err.message
    });
  }
};


exports.startExamSession = async (req, res) => {
   console.log('🔍 startExamSession Debug - req.student:', req.student);
  console.log('🔍 startExamSession Debug - auth header:', req.headers.authorization);
  const { sessionId } = req.params;
  const studentId = req.student.studentId; // From JWT middleware

  console.log('📝 Starting exam questions fetch:', { sessionId, studentId });

  try {
    // Step 1: Validate session
    const session = await prisma.examSession.findUnique({
      where: { 
        id: parseInt(sessionId)
      },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: {
                question: {
                  select: {
                    id: true,
                    questionText: true,
                    questionType: true,
                    options: true,
                    imageUrl: true,
                    points: true
                  }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ 
        message: 'Exam session not found' 
      });
    }

    if (session.studentId !== studentId) {
      return res.status(403).json({ 
        message: 'Session does not belong to you' 
      });
    }

    if (!session.isActive) {
      return res.status(403).json({ 
        message: 'Exam session is not active' 
      });
    }

    // Step 2: Check time limits
    const currentTime = new Date();
    const timeElapsed = Math.floor((currentTime - session.startedAt) / 1000);
    const timeLimit = session.exam.duration * 60;

    if (timeElapsed >= timeLimit) {
      // Auto-submit if time exceeded
      await prisma.examSession.update({
        where: { id: session.id },
        data: { 
          isActive: false,
          endedAt: currentTime
        }
      });

      return res.status(403).json({ 
        message: 'Exam time has expired',
        timeElapsed,
        timeLimit
      });
    }

    // Step 3: Format questions (remove correct answers)
    const questions = session.exam.examQuestions.map((eq, index) => ({
      id: eq.question.id,
      questionNumber: index + 1,
      questionText: eq.question.questionText,
      questionType: eq.question.questionType,
      options: eq.question.options,
      imageUrl: eq.question.imageUrl,
      points: eq.points,
      // Don't include correctAnswer
    }));

    console.log('✅ Exam questions loaded:', {
      sessionId: session.id,
      questionCount: questions.length,
      timeRemaining: timeLimit - timeElapsed
    });

    res.status(200).json({
      success: true,
      examSession: {
        id: session.id,
        timeElapsed,
        timeRemaining: timeLimit - timeElapsed,
        totalQuestions: questions.length
      },
      exam: {
        id: session.exam.id,
        title: session.exam.title,
        duration: session.exam.duration,
        instructions: session.exam.instructions
      },
      questions
    });

  } catch (err) {
    console.error('💥 Start exam session error:', {
      message: err.message,
      sessionId,
      studentId,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      message: 'Failed to start exam session',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.fetchExamSession = async (req, res) => {
  const { examId } = req.params;
  const studentId = req.student.studentId;

  try {
    // Get exam with all needed data
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: {
        course: true,
        examiner: true,
        examQuestions: {
          include: { question: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Auto-activate published exams
    if (exam.state === 'PUBLISHED') {
      await prisma.exam.update({
        where: { id: parseInt(examId) },
        data: { 
          state: 'ACTIVE',
          activatedAt: new Date()
        }
      });
    }

    // Check if exam is available
    if (!['PUBLISHED', 'ACTIVE'].includes(exam.state)) {
      return res.status(403).json({ 
        message: 'Exam is not available for students',
        currentState: exam.state
      });
    }

    // Get or create exam session
    let examSession = await prisma.examSession.findUnique({
      where: {
        studentId_examId: {
          studentId: studentId,
          examId: parseInt(examId)
        }
      }
    });

    if (!examSession) {
      examSession = await prisma.examSession.create({
        data: {
          studentId: studentId,
          examId: parseInt(examId),
          startedAt: new Date(),
          isActive: true,
          violations: '[]'
        }
      });
    }

    // Calculate time remaining
    const examDuration = exam.duration * 60;
    const elapsed = Math.floor((new Date() - examSession.startedAt) / 1000);
    const timeRemaining = Math.max(0, examDuration - elapsed);

    // Return response
    res.status(200).json({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        instructions: exam.instructions
      },
      examiner: exam.examiner,
      course: exam.course,
      student: {
        id: studentId,
        firstName: req.student.firstName,
        lastName: req.student.lastName,
        matricNo: req.student.matricNo
      },
      examSession: {
        id: examSession.id,
        status: examSession.isActive ? 'in_progress' : 'ended',
        startedAt: examSession.startedAt,
        endedAt: examSession.endedAt
      },
      questions: exam.examQuestions.map(eq => ({
        id: eq.question.id,
        questionText: eq.question.questionText,
        questionType: eq.question.questionType,
        options: eq.question.options,
        points: eq.points || eq.question.points,
        imageUrl: eq.question.imageUrl,
        order: eq.order
      })),
      timeRemaining,
      violations: JSON.parse(examSession.violations || '[]')
    });

  } catch (error) {
    console.error('Fetch exam session error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch exam session',
      error: error.message
    });
  }
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


// Fetch question batch for exam session
exports.fetchQuestionBatch = async (req, res) => {
  const { examId } = req.params;
  const { studentId, batchSize = 10, startIndex = 0 } = req.query;

  try {
    // Validate exam and student
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: {
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
          orderBy: { order: 'asc' },
          skip: parseInt(startIndex),
          take: parseInt(batchSize)
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: { id: true }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verify student is enrolled
    const isEnrolled = await prisma.exam.findFirst({
      where: {
        id: parseInt(examId),
        students: { some: { id: parseInt(studentId) } }
      }
    });

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Student not enrolled in this exam' });
    }

    // Get active exam session
    const examSession = await prisma.examSession.findFirst({
      where: {
        examId: parseInt(examId),
        studentId: parseInt(studentId),
        isActive: true
      }
    });

    if (!examSession) {
      return res.status(403).json({ message: 'No active exam session found' });
    }

    // Format questions
    const questions = exam.examQuestions.map(eq => ({
      id: eq.question.id,
      questionText: eq.question.questionText,
      type: eq.question.questionType,
      options: eq.question.options,
      points: eq.points,
      order: eq.order,
      imageUrl: eq.question.imageUrl,
      difficulty: eq.question.difficulty
    }));

    res.status(200).json({
      questions,
      batchInfo: {
        startIndex: parseInt(startIndex),
        batchSize: parseInt(batchSize),
        totalQuestions: exam.examQuestions.length
      },
      examSessionId: examSession.id
    });
  } catch (err) {
    console.error('Fetch question batch error:', err);
    res.status(500).json({
      message: 'Failed to fetch question batch',
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
        },

      },
    
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

exports.updateExam = async (req, res) => {
  const { examId } = req.params;
  const examinerId = req.user.userId;
  const updateData = req.body;

  try {
    // Check if exam exists and belongs to this examiner
    const existingExam = await prisma.exam.findFirst({
      where: {
        id: parseInt(examId),
        examinerId: parseInt(examinerId)
      },
      include: {
        examQuestions: true
      }
    });

    if (!existingExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // If publishing, validate and set additional fields
    if (updateData.isPublished && !existingExam.isPublished) {
      // Check if exam has questions
      if (existingExam.examQuestions.length === 0) {
        return res.status(400).json({ message: 'Cannot publish an exam with no questions' });
      }

      // Set publishing-related fields
      updateData.publishedAt = new Date();
      updateData.state = 'PUBLISHED';
    }

    // Update the exam
    const updatedExam = await prisma.exam.update({
      where: { id: parseInt(examId) },
      data: updateData
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

// Save answer batch
exports.saveAnswerBatch = async (req, res) => {
  const { sessionId } = req.params;
  const { answers } = req.body;
  const studentId = req.student.studentId;

  try {
    // Verify session
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      },
      include: {
        exam: {
          select: {
            id: true,
            duration: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    // Validate exam timing
    const timing = exports.calculateRemainingTime(examSession, examSession.exam);
    if (!timing.timeRemaining) {
      return res.status(403).json({ message: 'Exam time has expired' });
    }

    // Verify all questions belong to exam
    const examQuestions = await prisma.examQuestion.findMany({
      where: {
        examId: examSession.examId,
        questionId: { in: answers.map(a => parseInt(a.questionId)) }
      },
      select: { questionId: true }
    });

    const validQuestionIds = examQuestions.map(eq => eq.questionId);
    const invalidQuestions = answers.filter(a => !validQuestionIds.includes(parseInt(a.questionId)));

    if (invalidQuestions.length > 0) {
      return res.status(400).json({
        message: 'Some questions are not part of this exam',
        invalidQuestions: invalidQuestions.map(a => a.questionId)
      });
    }

    // Update or create answers in transaction
    const updatedAnswers = await prisma.$transaction(
      answers.map(answer =>
        prisma.studentAnswer.upsert({
          where: {
            examSessionId_questionId: {
              examSessionId: parseInt(sessionId),
              questionId: parseInt(answer.questionId)
            }
          },
          update: {
            studentResponse: answer.answer,
            updatedAt: new Date()
          },
          create: {
            examSessionId: parseInt(sessionId),
            questionId: parseInt(answer.questionId),
            studentResponse: answer.answer,
            examId: examSession.examId,
            studentId: parseInt(studentId)
          }
        })
      )
    );

    res.status(200).json({
      message: 'Answers saved successfully',
      updatedAnswers: updatedAnswers.length
    });
  } catch (err) {
    console.error('Save answer batch error:', err);
    res.status(500).json({
      message: 'Failed to save answer batch',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// Submit exam
exports.submitExam = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.student.studentId;

  try {
    // Verify session
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      },
      include: {
        exam: {
          select: {
            id: true,
            duration: true,
            startTime: true,
            endTime: true,
            passingScore: true,
            results: {
              where: { studentId: parseInt(studentId) },
              include: {
                studentAnswers: {
                  include: {
                    question: {
                      select: {
                        id: true,
                        correctAnswer: true,
                        points: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        student: true
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: "Active exam session not found" });
    }

    const studentResult = examSession.exam.results[0]; // student’s result
    const studentAnswers = studentResult?.studentAnswers || [];

    // Calculate score
    let score = 0;
    let correctAnswers = 0;
    studentAnswers.forEach(answer => {
      const question = answer.question;
      if (answer.studentResponse === question.correctAnswer) {
        score += question.points;
        correctAnswers++;
      }
    });

    const totalQuestions = studentAnswers.length;
    const percentage = totalQuestions > 0 ? (score / (totalQuestions * 1.0)) * 100 : 0;

    // Update session and upsert result
    const [updatedSession, examResult] = await prisma.$transaction([
      prisma.examSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          isActive: false,
          endedAt: new Date()
        }
      }),
      prisma.examResult.upsert({
        where: {
          studentId_examId: { // ✅ compound unique key
            examId: examSession.examId,
            studentId: parseInt(studentId)
          }
        },
        update: {
          score,
          correctAnswers,
          totalQuestions,
          percentage,
          status: "COMPLETED", // ✅ matches ExamStatus enum
          submittedAt: new Date()
        },
        create: {
          examId: examSession.examId,
          studentId: parseInt(studentId),
          score,
          correctAnswers,
          totalQuestions,
          percentage,
          status: "COMPLETED", // ✅ matches ExamStatus enum
          submittedAt: new Date()
        }
      })
    ]);

    res.status(200).json({
      message: "Exam submitted successfully",
      score,
      correctAnswers,
      totalQuestions,
      percentage,
      status: examResult.status,
      resultId: examResult.id,
      answers: studentAnswers.map(a => ({
        questionId: a.questionId,
        response: a.studentResponse,
        correct: a.studentResponse === a.question.correctAnswer
      }))
    });
  } catch (err) {
    console.error("Submit exam error:", err);
    res.status(500).json({
      message: "Failed to submit exam",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Auto-submit exam
exports.autoSubmitExam = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.student.studentId;

  try {
    // Verify session
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      },
      include: {
        exam: {
          select: {
            id: true,
            duration: true,
            startTime: true,
            endTime: true,
            passingScore: true
          }
        },
        studentAnswers: {
          include: {
            question: {
              select: {
                id: true,
                correctAnswer: true,
                points: true
              }
            }
          }
        }
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    // Calculate score
    let score = 0;
    examSession.studentAnswers.forEach(answer => {
      const question = answer.question;
      if (answer.studentResponse === question.correctAnswer) {
        score += question.points;
      }
    });

    // Update session and create result
    const [updatedSession, examResult] = await prisma.$transaction([
      prisma.examSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          isActive: false,
          endedAt: new Date(),
          score,
          status: score >= examSession.exam.passingScore ? 'PASSED' : 'FAILED',
          autoSubmitted: true
        }
      }),
      prisma.examResult.create({
        data: {
          examId: examSession.examId,
          studentId: parseInt(studentId),
          score,
          status: score >= examSession.exam.passingScore ? 'PASSED' : 'FAILED',
          submittedAt: new Date(),
          answers: examSession.studentAnswers.reduce((acc, answer) => {
            acc[answer.questionId] = answer.studentResponse;
            return acc;
          }, {}),
          autoSubmitted: true
        }
      })
    ]);

    res.status(200).json({
      message: 'Exam auto-submitted successfully',
      score,
      status: updatedSession.status,
      resultId: examResult.id
    });
  } catch (err) {
    console.error('Auto-submit exam error:', err);
    res.status(500).json({
      message: 'Failed to auto-submit exam',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Sync timer
exports.syncTimer = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.student.studentId;

  try {
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      },
      include: {
        exam: {
          select: {
            duration: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    const timing = exports.calculateRemainingTime(examSession, examSession.exam);

    res.status(200).json({
      timeRemaining: timing.timeRemaining,
      serverTime: new Date().toISOString(),
      shouldAutoSubmit: timing.shouldAutoSubmit
    });
  } catch (err) {
    console.error('Sync timer error:', err);
    res.status(500).json({
      message: 'Failed to sync timer',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Send heartbeat
exports.sendHeartbeat = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.user.studentId;
  const { clientTime } = req.body;

  try {
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      },
      include: {
        exam: {
          select: {
            duration: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    const timing = exports.calculateRemainingTime(examSession, examSession.exam);

    // Update last active time
    await prisma.examSession.update({
      where: { id: parseInt(sessionId) },
      data: {
        lastActive: new Date(),
        metadata: {
          ...examSession.metadata,
          lastHeartbeat: new Date().toISOString(),
          clientTime
        }
      }
    });

    res.status(200).json({
      message: 'Heartbeat received',
      timeRemaining: timing.timeRemaining,
      serverTime: new Date().toISOString(),
      shouldAutoSubmit: timing.shouldAutoSubmit
    });
  } catch (err) {
    console.error('Heartbeat error:', err);
    res.status(500).json({
      message: 'Failed to process heartbeat',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Log violation
exports.logViolation = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.student.studentId;
  const { violationType, details } = req.body;

  try {
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    const violations = JSON.parse(examSession.violations || '[]');
    violations.push({
      type: violationType,
      details,
      timestamp: new Date().toISOString()
    });

    await prisma.examSession.update({
      where: { id: parseInt(sessionId) },
      data: {
        violations: JSON.stringify(violations)
      }
    });

    res.status(200).json({
      message: 'Violation logged successfully',
      violationCount: violations.length
    });
  } catch (err) {
    console.error('Log violation error:', err);
    res.status(500).json({
      message: 'Failed to log violation',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get current answers
exports.getCurrentAnswers = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.student.studentId;

  try {
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      },
      include: {
        studentAnswers: {
          select: {
            questionId: true,
            studentResponse: true,
            updatedAt: true
          }
        }
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    const answers = examSession.studentAnswers.reduce((acc, answer) => {
      acc[answer.questionId] = {
        response: answer.studentResponse,
        updatedAt: answer.updatedAt
      };
      return acc;
    }, {});

    res.status(200).json({
      answers,
      totalAnswers: examSession.studentAnswers.length
    });
  } catch (err) {
    console.error('Get current answers error:', err);
    res.status(500).json({
      message: 'Failed to fetch current answers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get violations
exports.getViolations = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.user.studentId;

  try {
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    const violations = JSON.parse(examSession.violations || '[]');

    res.status(200).json({
      violations,
      totalViolations: violations.length
    });
  } catch (err) {
    console.error('Get violations error:', err);
    res.status(500).json({
      message: 'Failed to fetch violations',
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

// Add question to exam
exports.addQuestionToExam = async (req, res) => {
  const { examId } = req.params;
  const { questionId, points, order } = req.body;
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
        points: points || question.points,
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

// Get exam results
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

// Get question analytics
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

// Get exam attendances
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


// Update single answer
exports.updateAnswer = async (req, res) => {
  const { sessionId } = req.params;
  const { questionId, answer } = req.body;
  const studentId = req.student.studentId;

  try {
    // Verify session
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: parseInt(sessionId),
        studentId: parseInt(studentId),
        isActive: true
      },
      include: {
        exam: {
          select: {
            id: true,
            duration: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    if (!examSession) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    // Validate exam timing
    const timing = exports.calculateRemainingTime(examSession, examSession.exam);
    if (!timing.timeRemaining) {
      return res.status(403).json({ message: 'Exam time has expired' });
    }

    // Verify question belongs to exam
    const examQuestion = await prisma.examQuestion.findFirst({
      where: {
        examId: examSession.examId,
        questionId: parseInt(questionId)
      }
    });

    if (!examQuestion) {
      return res.status(404).json({ message: 'Question not found in this exam' });
    }

    // Update or create answer
    const studentAnswer = await prisma.studentAnswer.upsert({
      where: {
        examSessionId_questionId: {
          examSessionId: parseInt(sessionId),
          questionId: parseInt(questionId)
        }
      },
      update: {
        studentResponse: answer,
        updatedAt: new Date()
      },
      create: {
        examSessionId: parseInt(sessionId),
        questionId: parseInt(questionId),
        studentResponse: answer,
        examId: examSession.examId,
        studentId: parseInt(studentId)
      }
    });

    res.status(200).json({
      message: 'Answer updated successfully',
      answer: studentAnswer
    });
  } catch (err) {
    console.error('Update answer error:', err);
    res.status(500).json({
      message: 'Failed to update answer',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};










/*

module.exports = {
  studentLogin,
  validateExamAccess,
  startExamSession,
  fetchExamSession,
  validateExamTiming,
  calculateRemainingTime,
  getStudentExams,
  fetchQuestionBatch,
  updateAnswer,
  saveAnswerBatch,
  submitExam,
  autoSubmitExam,
  syncTimer,
  sendHeartbeat,
  logViolation,
  getCurrentAnswers,
  getViolations
};

*/
