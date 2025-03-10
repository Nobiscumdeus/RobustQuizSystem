const express = require('express');
const questionController = require('../controllers/questionController');
const upload = require('../utils/upload');

const router = express.Router();

// Create a new question with image upload
router.post('/question', upload.single('image'), questionController.createQuestion);

module.exports = router;