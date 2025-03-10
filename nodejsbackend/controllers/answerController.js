const prisma = require('../prisma/client');

// Create an answer for a question
const createAnswer = async (req, res) => {
  const { questionId, content, isCorrect } = req.body;

  try {
    const answer = await prisma.answer.create({
      data: {
        questionId: parseInt(questionId),
        content,
        isCorrect,
      },
    });
    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all answers for a question
const getAnswersByQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    const answers = await prisma.answer.findMany({
      where: { questionId: parseInt(questionId) },
    });
    res.status(200).json(answers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createAnswer,
  getAnswersByQuestion,
};