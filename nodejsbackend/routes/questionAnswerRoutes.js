// routes/questionRoutes.js
const express = require('express');
const questionController = require('../controllers/questionAnswerController');
const upload = require('../utils/upload');

const router = express.Router();



// Create a new question
router.post('/questions', upload.single('image'), questionController.createQuestion);

// Get all questions for an exam
router.get('/questions/:examId', questionController.getQuestionsByExam);


module.exports = router;