const { prisma } = require('../database'); // Import prisma client
const jwt = require('jsonwebtoken');
const upload=require('../utils/upload')


const prisma = require('../prisma/client');
const upload = require('../utils/upload');


  // 1. CREATE QUESTION FOR COURSE (Question Bank)
const createQuestion = async (req, res) => {
 try {
   const {
     courseId,
     questionText,
     questionType,
     options,
     correctAnswer,
     imageUrl,
     category,
     tags,
     difficulty,
     points
   } = req.body;

   // Validate required fields
   /*
   if (!courseId || !questionText || !questionType || !correctAnswer || !category) {
     return res.status(400).json({
       error: 'Missing required fields: courseId, questionText, questionType, correctAnswer, category'
     });
   }
*/
   // Get examiner ID from auth middleware
   const examinerId = req.user?.id || 1;

   // Verify course exists and belongs to examiner
   const course = await prisma.course.findFirst({
     where: {
       id: parseInt(courseId),
       examinerId: examinerId
     }
   });

   if (!course) {
     return res.status(404).json({
       error: 'Course not found or you do not have permission to add questions to this course'
     });
   }

   // Create question
   const question = await prisma.question.create({
     data: {
       course: {
         connect: { id: parseInt(courseId) }
       },
       questionText,
       questionType,
       options: options || [],
       correctAnswer,
       imageUrl,
       category,
       tags: tags || [],
       difficulty: difficulty || 'medium',
       points: points || 1.0,
       examinerId
     },
     include: {
       course: {
         select: { title: true, code: true }
       },
       examiner: {
         select: { firstName: true, lastName: true }
       }
     }
   });

   res.status(201).json({
     success: true,
     message: 'Question created successfully',
     question
   });

 } catch (error) {
   console.error('Error creating question:', error);
   res.status(500).json({
     error: 'Failed to create question',
     details: error.message
   });
 }
};
// 2. GET ALL QUESTIONS FOR A COURSE (Question Bank)
const getCourseQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { 
      difficulty, 
      category, 
      questionType,
      page = 1, 
      limit = 20,
      search
    } = req.query;

    // Build filter conditions
    const where = {
      courseId: parseInt(courseId)
    };

    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;
    if (questionType) where.questionType = questionType;
    if (search) {
      where.questionText = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get questions with pagination
    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          course: {
            select: { title: true, code: true }
          },
          examiner: {
            select: { firstName: true, lastName: true }
          },
          _count: {
            select: {
              examQuestions: true // Count how many exams use this question
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.question.count({ where })
    ]);

    res.json({
      success: true,
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching course questions:', error);
    res.status(500).json({
      error: 'Failed to fetch questions',
      details: error.message
    });
  }
};

// 3. ADD QUESTIONS TO EXAM (Assemble from Question Bank)
const addQuestionsToExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questionIds, autoSelect } = req.body;

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: { course: true }
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    let selectedQuestions = [];

    if (autoSelect) {
      // Auto-select questions based on criteria
      const { count = 10, difficulty, category, mixed = false } = autoSelect;
      
      if (mixed) {
        // Mixed difficulty selection
        const easyCount = Math.floor(count * 0.4);
        const mediumCount = Math.floor(count * 0.4);
        const hardCount = count - easyCount - mediumCount;

        const [easy, medium, hard] = await Promise.all([
          prisma.question.findMany({
            where: { courseId: exam.courseId, difficulty: 'easy' },
            take: easyCount,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.question.findMany({
            where: { courseId: exam.courseId, difficulty: 'medium' },
            take: mediumCount,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.question.findMany({
            where: { courseId: exam.courseId, difficulty: 'hard' },
            take: hardCount,
            orderBy: { createdAt: 'desc' }
          })
        ]);

        selectedQuestions = [...easy, ...medium, ...hard];
      } else {
        // Single criteria selection
        const where = { courseId: exam.courseId };
        if (difficulty) where.difficulty = difficulty;
        if (category) where.category = category;

        selectedQuestions = await prisma.question.findMany({
          where,
          take: count,
          orderBy: { createdAt: 'desc' }
        });
      }
    } else if (questionIds && questionIds.length > 0) {
      // Manual selection
      selectedQuestions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          courseId: exam.courseId // Ensure questions belong to exam's course
        }
      });
    } else {
      return res.status(400).json({
        error: 'Either provide questionIds or autoSelect criteria'
      });
    }

    if (selectedQuestions.length === 0) {
      return res.status(400).json({
        error: 'No questions found matching the criteria'
      });
    }

    // Remove existing questions from exam (if any)
    await prisma.examQuestion.deleteMany({
      where: { examId: parseInt(examId) }
    });

    // Add selected questions to exam
    const examQuestions = selectedQuestions.map((question, index) => ({
      examId: parseInt(examId),
      questionId: question.id,
      order: index + 1,
      points: question.points
    }));

    await prisma.examQuestion.createMany({
      data: examQuestions
    });

    // Update exam state to READY
    await prisma.exam.update({
      where: { id: parseInt(examId) },
      data: { state: 'READY' }
    });

    res.json({
      success: true,
      message: `${selectedQuestions.length} questions added to exam successfully`,
      questionsAdded: selectedQuestions.length,
      examState: 'READY'
    });

  } catch (error) {
    console.error('Error adding questions to exam:', error);
    res.status(500).json({
      error: 'Failed to add questions to exam',
      details: error.message
    });
  }
};

// 4. GET EXAM QUESTIONS (For exam preview/management)
const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId: parseInt(examId) },
      include: {
        question: {
          include: {
            course: {
              select: { title: true, code: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      questions: examQuestions,
      totalQuestions: examQuestions.length,
      totalPoints: examQuestions.reduce((sum, eq) => sum + eq.points, 0)
    });

  } catch (error) {
    console.error('Error fetching exam questions:', error);
    res.status(500).json({
      error: 'Failed to fetch exam questions',
      details: error.message
    });
  }
};

// 5. UPDATE QUESTION IN COURSE QUESTION BANK
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.examinerId;

    const question = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: updateData,
      include: {
        course: {
          select: { title: true, code: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Question updated successfully',
      question
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      error: 'Failed to update question',
      details: error.message
    });
  }
};

// 6. DELETE QUESTION FROM COURSE QUESTION BANK
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Check if question is used in any active exams
    const examUsage = await prisma.examQuestion.findMany({
      where: { questionId: parseInt(questionId) },
      include: {
        exam: {
          select: { id: true, title: true, state: true }
        }
      }
    });

    const activeExams = examUsage.filter(eq => 
      ['PUBLISHED', 'ACTIVE'].includes(eq.exam.state)
    );

    if (activeExams.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete question. It is used in active exams.',
        activeExams: activeExams.map(eq => eq.exam)
      });
    }

    // Delete the question (and related exam questions due to FK constraints)
    await prisma.question.delete({
      where: { id: parseInt(questionId) }
    });

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      error: 'Failed to delete question',
      details: error.message
    });
  }
};

module.exports = {
  createQuestion,
  getCourseQuestions,
  addQuestionsToExam,
  getExamQuestions,
  updateQuestion,
  deleteQuestion
};