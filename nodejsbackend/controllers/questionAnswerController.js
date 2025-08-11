const { prisma } = require('../database'); // Import prisma client
const jwt = require('jsonwebtoken');
const upload = require('../utils/upload');

// Create a new question
/*
const createQuestion = async (req, res) => {
  const {
    examId,
    questionText,
    questionType,
    options,
    correctAnswer,
    category,
    tags,
    difficulty,
  } = req.body;

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Handle image upload

  try {
    // Validate required fields
    if (!examId || !questionText || !questionType || !correctAnswer) {
      throw new Error('Missing required fields: examId, questionText, questionType, or correctAnswer');
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        examId: parseInt(examId),
        questionText,
        questionType,
        options: questionType === 'MULTIPLE_CHOICE' ? JSON.parse(options) : undefined,
        correctAnswer,
        imageUrl,
        category,
        tags: JSON.parse(tags || '[]'),
        difficulty,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(400).json({ error: error.message });
  }
};
*/
const createQuestion = async (req, res) => {
  try {
    console.log('📝 Creating question with body:', req.body);
    console.log('📁 File uploaded:', req.file ? req.file.filename : 'No file');

    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      courseId,
      difficulty,
      category,
      tags,
      points
    } = req.body;

    // ✅ Validate required fields (removed examId - not needed for question bank)
    if (!questionText || !questionType || !correctAnswer || !courseId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['questionText', 'questionType', 'correctAnswer', 'courseId']
      });
    }

    // Parse options safely
    let parsedOptions = [];
    if (options) {
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (error) {
        return res.status(400).json({ error: 'Invalid options format' });
      }
    }

    // Parse tags safely
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        parsedTags = [];
      }
    }

    // Convert courseId to integer
    const courseIdInt = parseInt(courseId);

    // ✅ Verify course exists and user has access (should get examiner from auth)
    const course = await prisma.course.findFirst({
      where: { 
        id: courseIdInt,
        // examinerId: req.user.id // Uncomment when auth is implemented
      }
    });

    if (!course) {
      return res.status(400).json({ error: 'Course not found or access denied' });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // ✅ Create question in the course question bank (no exam attachment)
    const question = await prisma.question.create({
      data: {
        questionText,
        questionType,
        options: parsedOptions,
        correctAnswer,
        imageUrl,
        category: category || 'SCIENCE',
        difficulty: difficulty || 'easy',
        tags: parsedTags,
        points: points ? parseFloat(points) : 1.0,
        courseId: courseIdInt,
        examinerId: 1, // TODO: Get from req.user.id when auth is implemented
      },
      include: {
        course: { 
          select: { 
            title: true, 
            code: true 
          } 
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Question added to course question bank successfully',
      data: question
    });

  } catch (error) {
    console.error('❌ Error creating question:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

// ✅ NEW: Controller to add questions from course bank to specific exam
const addQuestionsToExam = async (req, res) => {
  try {
    const { examId, questionIds } = req.body;

    if (!examId || !questionIds || !Array.isArray(questionIds)) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['examId', 'questionIds (array)']
      });
    }

    const examIdInt = parseInt(examId);

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examIdInt },
      include: { course: true }
    });

    if (!exam) {
      return res.status(400).json({ error: 'Exam not found' });
    }

    // Verify all questions belong to the same course as the exam
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds.map(id => parseInt(id)) },
        courseId: exam.courseId
      }
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({ 
        error: 'Some questions not found or don\'t belong to this course' 
      });
    }

    // Get current max order for this exam
    const maxOrder = await prisma.examQuestion.findFirst({
      where: { examId: examIdInt },
      orderBy: { order: 'desc' }
    });

    const startOrder = maxOrder ? maxOrder.order + 1 : 1;

    // Create exam-question relationships
    const examQuestions = await prisma.examQuestion.createMany({
      data: questionIds.map((questionId, index) => ({
        examId: examIdInt,
        questionId: parseInt(questionId),
        order: startOrder + index,
        points: 1.0
      })),
      skipDuplicates: true
    });

    res.status(201).json({
      success: true,
      message: `${examQuestions.count} questions added to exam`,
      data: {
        examId: examIdInt,
        questionsAdded: examQuestions.count
      }
    });

  } catch (error) {
    console.error('❌ Error adding questions to exam:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

// ✅ NEW: Get all questions from a course (question bank)
const getCourseQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, difficulty, category, search } = req.query;

    const courseIdInt = parseInt(courseId);
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Build where clause
    const whereClause = {
      courseId: courseIdInt
    };

    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.questionText = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get questions with pagination
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          course: {
            select: {
              title: true,
              code: true
            }
          },
          examQuestions: {
            include: {
              exam: {
                select: {
                  title: true,
                  id: true
                }
              }
            }
          }
        },
        skip: (pageInt - 1) * limitInt,
        take: limitInt,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.question.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page: pageInt,
          limit: limitInt,
          total,
          pages: Math.ceil(total / limitInt)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching course questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

// ✅ NEW: Remove question from exam (but keep in course bank)
const removeQuestionFromExam = async (req, res) => {
  try {
    const { examId, questionId } = req.params;

    await prisma.examQuestion.delete({
      where: {
        examId_questionId: {
          examId: parseInt(examId),
          questionId: parseInt(questionId)
        }
      }
    });

    res.json({
      success: true,
      message: 'Question removed from exam (still available in course bank)'
    });

  } catch (error) {
    console.error('❌ Error removing question from exam:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

module.exports = {
  createQuestion,
  addQuestionsToExam,
  getCourseQuestions,
  removeQuestionFromExam
};