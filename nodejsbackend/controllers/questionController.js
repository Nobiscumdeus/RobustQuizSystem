const { prisma } = require('../database'); // Import prisma client
const jwt = require('jsonwebtoken');
const upload=require('../utils/upload')


const prisma = require('../prisma/client');
const upload = require('../utils/upload');

// Create a new question with image upload
const createQuestion = async (req, res) => {
  const { examId, questionText, questionType, options, correctAnswer, category, tags, difficulty } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Get the uploaded file path

  try {
    const question = await prisma.question.create({
      data: {
        examId: parseInt(examId),
        questionText,
        questionType,
        options: JSON.parse(options), // Ensure options is an array
        correctAnswer,
        imageUrl,
        category,
        tags: JSON.parse(tags), // Ensure tags is an array
        difficulty,
      },
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



  
  const getExamQuestions = async (req, res) => {
    try {
      const { examId } = req.params;
  
      // Fetch all questions for the specified exam
      const questions = await prisma.question.findMany({
        where: { examId: parseInt(examId, 10) },
      });
  
      if (!questions.length) {
        return res.status(404).json({ message: "No questions found for this exam" });
      }
  
      res.status(200).json(questions);
    } catch (err) {
      console.error("Error fetching questions: ", err);
      res.status(500).json({ message: "Error fetching questions" });
    }
  };

  

  const updateQuestion = async (req, res) => {
    try {
      const { questionId } = req.params;
      const { questionText, questionType, options, correctAnswer, imageUrl, category, tags, difficulty } = req.body;
  
      // Fetch the existing question
      const existingQuestion = await prisma.question.findUnique({
        where: { id: parseInt(questionId, 10) },
      });
  
      if (!existingQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
  
      // Update the question with new data
      const updatedQuestion = await prisma.question.update({
        where: { id: parseInt(questionId, 10) },
        data: {
          questionText: questionText || existingQuestion.questionText,
          questionType: questionType || existingQuestion.questionType,
          options: options || existingQuestion.options,
          correctAnswer: correctAnswer || existingQuestion.correctAnswer,
          imageUrl: imageUrl || existingQuestion.imageUrl,
          category: category || existingQuestion.category,
          tags: tags || existingQuestion.tags,
          difficulty: difficulty || existingQuestion.difficulty,
        },
      });
  
      res.status(200).json(updatedQuestion);
    } catch (err) {
      console.error("Error updating question: ", err);
      res.status(500).json({ message: "Error updating question" });
    }
  };

  
  const deleteQuestion = async (req, res) => {
    try {
      const { questionId } = req.params;
  
      // Fetch the question
      const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId, 10) },
      });
  
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
  
      // Delete the question
      await prisma.question.delete({
        where: { id: parseInt(questionId, 10) },
      });
  
      res.status(200).json({ message: "Question deleted successfully" });
    } catch (err) {
      console.error("Error deleting question: ", err);
      res.status(500).json({ message: "Error deleting question" });
    }
  };

  

  const uploadBulkQuestions = async (req, res) => {
    try {
      // Placeholder: Implement bulk upload logic here
      const file = req.file; // Assuming using multer or a similar middleware for file upload
  
      // Parse the file and extract question data
  
      // Bulk create questions using prisma
  
      res.status(200).json({ message: "Bulk questions uploaded successfully" });
    } catch (err) {
      console.error("Error uploading bulk questions: ", err);
      res.status(500).json({ message: "Error uploading bulk questions" });
    }
  };

  

  module.exports = {
    createQuestion,
    getExamQuestions,
    updateQuestion,
    deleteQuestion,
    uploadBulkQuestions,
  };
