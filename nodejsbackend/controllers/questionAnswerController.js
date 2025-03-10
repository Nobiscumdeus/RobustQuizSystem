const { prisma } = require('../database'); // Import prisma client
const jwt = require('jsonwebtoken');
const upload = require('../utils/upload');

// Create a new question
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

// Get all questions for an exam
const getQuestionsByExam = async (req, res) => {
  const { examId } = req.params;

  try {
    const questions = await prisma.question.findMany({
      where: { examId: parseInt(examId) },
    });
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByExam,
};