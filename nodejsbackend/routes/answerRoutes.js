const express = require('express');
const answerController = require('../controllers/answerController');

const router = express.Router();

// Create an answer
router.post('/answer', answerController.createAnswer);

// Get all answers for a question
router.get('answer/:questionId', answerController.getAnswersByQuestion);

module.exports = router;