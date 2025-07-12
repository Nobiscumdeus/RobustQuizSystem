
const { prisma } = require('../database');
class ExaminerController {
  // Create new exam
  async createExam(req, res) {
    try {
      const { title, description, courseId, duration, passingScore, instructions } = req.body;
      const examinerId = req.user.id; // From auth middleware
      
      const exam = await prisma.exam.create({
        data: {
          title,
          description,
          courseId: parseInt(courseId),
          examinerId,
          duration: parseInt(duration),
          passingScore: parseFloat(passingScore),
          instructions,
          password: generateExamPassword(), // Generate random password
          date: new Date(),
          state: 'DRAFT'
        },
        include: {
          course: true,
          questions: true
        }
      });

      res.status(201).json({ success: true, exam });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Add questions to exam from question bank
  async addQuestionsToExam(req, res) {
    try {
      const { examId } = req.params;
      const { questionBankIds } = req.body; // Array of question bank IDs
      
      // Create questions for the exam
      const questions = await Promise.all(
        questionBankIds.map(async (bankId, index) => {
          return await prisma.question.create({
            data: {
              examId: parseInt(examId),
              questionBankId: parseInt(bankId),
              order: index + 1,
              points: 1.0 // Default points
            }
          });
        })
      );

      // Update exam state to READY
      await prisma.exam.update({
        where: { id: parseInt(examId) },
        data: { state: 'READY' }
      });

      res.json({ success: true, questions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Publish exam (make it available to students)
  async publishExam(req, res) {
    try {
      const { examId } = req.params;
      const { startTime, endTime } = req.body;

      const exam = await prisma.exam.update({
        where: { id: parseInt(examId) },
        data: {
          state: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date(),
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        }
      });

      // Send notifications to enrolled students
      await this.notifyStudents(examId, 'New exam published');

      res.json({ success: true, exam });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Activate exam (students can start taking it)
  async activateExam(req, res) {
    try {
      const { examId } = req.params;

      const exam = await prisma.exam.update({
        where: { id: parseInt(examId) },
        data: {
          state: 'ACTIVE',
          activatedAt: new Date()
        }
      });

      res.json({ success: true, exam });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // View exam results and analytics
  async getExamResults(req, res) {
    try {
      const { examId } = req.params;

      const results = await prisma.examResult.findMany({
        where: { examId: parseInt(examId) },
        include: {
          student: {
            select: {
              id: true,
              matricNo: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { score: 'desc' }
      });

      // Calculate statistics
      const totalStudents = results.length;
      const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalStudents;
      const passedStudents = results.filter(r => r.percentage >= exam.passingScore).length;

      res.json({
        success: true,
        results,
        statistics: {
          totalStudents,
          averageScore: Math.round(averageScore * 100) / 100,
          passedStudents,
          passRate: Math.round((passedStudents / totalStudents) * 100)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async notifyStudents(examId, message) {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: { students: true }
    });

    const notifications = exam.students.map(student => ({
      userId: student.id,
      title: `Exam: ${exam.title}`,
      message,
      type: 'info'
    }));

    await prisma.notification.createMany({
      data: notifications
    });
  }
}

// 2. STUDENT CONTROLLERS (Take Exams)

// controllers/studentController.js
class StudentController {
  // Get available exams for student
  async getAvailableExams(req, res) {
    try {
      const studentId = req.user.id;
      const currentTime = new Date();

      const exams = await prisma.exam.findMany({
        where: {
          state: 'PUBLISHED',
          isPublished: true,
          startTime: { lte: currentTime },
          endTime: { gte: currentTime },
          students: {
            some: { id: studentId }
          }
        },
        include: {
          course: true,
          _count: {
            select: { questions: true }
          }
        }
      });

      res.json({ success: true, exams });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Start exam session
  async startExam(req, res) {
    try {
      const { examId } = req.params;
      const { password } = req.body;
      const studentId = req.user.id;

      // Verify exam password
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(examId) },
        include: {
          questions: {
            include: {
              questionBank: {
                select: {
                  questionText: true,
                  questionType: true,
                  options: true,
                  imageUrl: true,
                  category: true,
                  difficulty: true
                }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      if (exam.password !== password) {
        return res.status(401).json({ error: 'Invalid exam password' });
      }

      // Check if student already has a result
      const existingResult = await prisma.examResult.findFirst({
        where: {
          studentId,
          examId: parseInt(examId)
        }
      });

      if (existingResult && existingResult.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Exam already completed' });
      }

      // Create or update exam result
      const examResult = await prisma.examResult.upsert({
        where: {
          studentId_examId: {
            studentId,
            examId: parseInt(examId)
          }
        },
        update: {
          status: 'IN_PROGRESS'
        },
        create: {
          studentId,
          examId: parseInt(examId),
          score: 0,
          status: 'IN_PROGRESS',
          submittedAt: new Date(),
          totalQuestions: exam.questions.length,
          correctAnswers: 0,
          percentage: 0,
          ipAddress: req.ip,
          deviceInfo: req.headers['user-agent']
        }
      });

      // Record attendance
      await prisma.attendance.create({
        data: {
          studentId,
          examId: parseInt(examId),
          status: 'present'
        }
      });

      // Return questions without correct answers
      const questionsForStudent = exam.questions.map(q => ({
        id: q.id,
        order: q.order,
        points: q.points,
        questionText: q.questionBank.questionText,
        questionType: q.questionBank.questionType,
        options: q.questionBank.options,
        imageUrl: q.questionBank.imageUrl,
        category: q.questionBank.category,
        difficulty: q.questionBank.difficulty
      }));

      res.json({
        success: true,
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          instructions: exam.instructions,
          duration: exam.duration,
          totalQuestions: exam.questions.length,
          endTime: exam.endTime
        },
        questions: questionsForStudent,
        examResultId: examResult.id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Submit exam answers
  async submitExam(req, res) {
    try {
      const { examId } = req.params;
      const { answers } = req.body; // Array of {questionId, answer}
      const studentId = req.user.id;

      // Get exam with questions and correct answers
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(examId) },
        include: {
          questions: {
            include: {
              questionBank: {
                select: {
                  correctAnswer: true
                }
              }
            }
          }
        }
      });

      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      const answerMap = new Map();
      answers.forEach(ans => {
        answerMap.set(ans.questionId, ans.answer);
      });

      exam.questions.forEach(question => {
        totalPoints += question.points;
        const studentAnswer = answerMap.get(question.id);
        
        if (studentAnswer === question.questionBank.correctAnswer) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      });

      const percentage = (earnedPoints / totalPoints) * 100;
      const score = earnedPoints;

      // Update exam result
      await prisma.examResult.update({
        where: {
          studentId_examId: {
            studentId,
            examId: parseInt(examId)
          }
        },
        data: {
          score,
          correctAnswers,
          percentage,
          status: 'COMPLETED',
          submittedAt: new Date(),
          answers: JSON.stringify(answers)
        }
      });

      res.json({
        success: true,
        result: {
          score,
          correctAnswers,
          totalQuestions: exam.questions.length,
          percentage: Math.round(percentage * 100) / 100,
          passed: percentage >= exam.passingScore
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

   async startExamSession(req, res) {
    try {
      const { examId } = req.params;
      const studentId = req.user.id;

      // Check if session already exists
      const existingSession = await prisma.examSession.findUnique({
        where: {
          studentId_examId: {
            studentId,
            examId: parseInt(examId)
          }
        }
      });

      if (existingSession && existingSession.isActive) {
        return res.status(400).json({ error: 'Exam session already active' });
      }

      const session = await prisma.examSession.create({
        data: {
          studentId,
          examId: parseInt(examId),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });

      res.json({ success: true, sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  // Question analytics for performance tracking
  async updateQuestionAnalytics(questionId, examId, isCorrect, timeSpent) {
    try {
      const analytics = await prisma.questionAnalytics.upsert({
        where: {
          questionId_examId: {
            questionId,
            examId
          }
        },
        update: {
          totalAttempts: { increment: 1 },
          correctAttempts: isCorrect ? { increment: 1 } : undefined,
          averageTime: {
            // Calculate new average time
            // This is a simplified calculation
            set: timeSpent
          }
        },
        create: {
          questionId,
          examId,
          totalAttempts: 1,
          correctAttempts: isCorrect ? 1 : 0,
          averageTime: timeSpent
        }
      });

      // Update difficulty rating based on performance
      const successRate = analytics.correctAttempts / analytics.totalAttempts;
      const difficultyRating = 1 - successRate; // 0 = easy, 1 = very hard

      await prisma.questionAnalytics.update({
        where: { id: analytics.id },
        data: { difficultyRating }
      });

    } catch (error) {
      console.error('Analytics update error:', error);
    }
  }


  // Exam proctoring features
  async proctoringCheck(req, res) {
    try {
      const { sessionId } = req.params;
      const { 
        tabSwitches, 
        fullscreenExits, 
        suspiciousActivity,
        faceDetection 
      } = req.body;

      const violations = {
        tabSwitches: tabSwitches || 0,
        fullscreenExits: fullscreenExits || 0,
        suspiciousActivity: suspiciousActivity || [],
        faceDetection: faceDetection || 'detected',
        timestamp: new Date()
      };

      await prisma.examSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          violations: JSON.stringify(violations)
        }
      });

      // Flag for manual review if violations exceed threshold
      const shouldFlag = tabSwitches > 3 || fullscreenExits > 2;

      res.json({ 
        success: true, 
        flagged: shouldFlag,
        message: shouldFlag ? 'Exam flagged for review' : 'Normal activity'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }



  
  // Bulk operations for exam management
  async bulkPublishExams(req, res) {
    try {
      const { examIds, startTime, endTime } = req.body;
      const examinerId = req.user.id;

      const exams = await prisma.exam.updateMany({
        where: {
          id: { in: examIds.map(id => parseInt(id)) },
          examinerId
        },
        data: {
          state: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date(),
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        }
      });

      res.json({ success: true, updatedCount: exams.count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  
  // Real-time exam monitoring
  async monitorExamSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { violations } = req.body;

      await prisma.examSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          violations: JSON.stringify(violations)
        }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  

  // Get student's exam history
  async getExamHistory(req, res) {
    try {
      const studentId = req.user.id;

      const results = await prisma.examResult.findMany({
        where: { studentId },
        include: {
          exam: {
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
          }
        },
        orderBy: { submittedAt: 'desc' }
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

   // Advanced analytics dashboard
  async getExamAnalytics(req, res) {
    try {
      const { examId } = req.params;
      const examinerId = req.user.id;

      // Verify examiner owns this exam
      const exam = await prisma.exam.findFirst({
        where: { id: parseInt(examId), examinerId }
      });

      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      // Get comprehensive analytics
      const [results, questionAnalytics, sessions] = await Promise.all([
        prisma.examResult.findMany({
          where: { examId: parseInt(examId) },
          include: {
            student: {
              select: {
                matricNo: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        prisma.questionAnalytics.findMany({
          where: { examId: parseInt(examId) },
          include: {
            question: {
              include: {
                questionBank: {
                  select: {
                    questionText: true,
                    category: true,
                    difficulty: true
                  }
                }
              }
            }
          }
        }),
        prisma.examSession.findMany({
          where: { examId: parseInt(examId) },
          include: {
            student: {
              select: {
                matricNo: true,
                firstName: true,
                lastName: true
              }
            }
          }
        })
      ]);

      // Calculate detailed statistics
      const totalStudents = results.length;
      const completedStudents = results.filter(r => r.status === 'COMPLETED').length;
      const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents;
      const passedStudents = results.filter(r => r.percentage >= exam.passingScore).length;
      
      // Score distribution
      const scoreRanges = {
        '90-100': results.filter(r => r.percentage >= 90).length,
        '80-89': results.filter(r => r.percentage >= 80 && r.percentage < 90).length,
        '70-79': results.filter(r => r.percentage >= 70 && r.percentage < 80).length,
        '60-69': results.filter(r => r.percentage >= 60 && r.percentage < 70).length,
        'Below 60': results.filter(r => r.percentage < 60).length
      };

      // Question difficulty analysis
      const questionDifficulty = questionAnalytics.map(qa => ({
        questionId: qa.questionId,
        questionText: qa.question.questionBank.questionText.substring(0, 100) + '...',
        category: qa.question.questionBank.category,
        totalAttempts: qa.totalAttempts,
        correctAttempts: qa.correctAttempts,
        successRate: qa.totalAttempts > 0 ? (qa.correctAttempts / qa.totalAttempts) * 100 : 0,
        averageTime: qa.averageTime,
        difficultyRating: qa.difficultyRating
      }));

      // Proctoring violations summary
      const violationsCount = sessions.filter(s => s.violations).length;
      const flaggedSessions = sessions.filter(s => {
        if (!s.violations) return false;
        const violations = JSON.parse(s.violations);
        return violations.tabSwitches > 3 || violations.fullscreenExits > 2;
      });

      res.json({
        success: true,
        analytics: {
          overview: {
            totalStudents,
            completedStudents,
            averageScore: Math.round(averageScore * 100) / 100,
            passedStudents,
            passRate: Math.round((passedStudents / totalStudents) * 100),
            completionRate: Math.round((completedStudents / totalStudents) * 100)
          },
          scoreDistribution: scoreRanges,
          questionAnalytics: questionDifficulty,
          proctoring: {
            totalSessions: sessions.length,
            violationsCount,
            flaggedSessions: flaggedSessions.length,
            flaggedStudents: flaggedSessions.map(s => s.student)
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

}
