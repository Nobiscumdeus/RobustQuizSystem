const express = require('express');
const questionController = require('@controllers/examiner/questionAnswerController');
//console.log('Available functions:', Object.keys(questionController));
const examController = require('@controllers/examiner/examController');
const { upload} =require('@controllers/shared/imageUploadController')

//const multer = require('multer');
//const upload = multer({ dest: 'uploads/' });

const { authenticate, examinerOnly } = require('@middlewares/auth');
const router = express.Router();

//router.post('/questions',authenticate,examinerOnly,questionController.createQuestion);

router.get('/course/:courseId/questions', authenticate, examinerOnly, questionController.getCourseQuestions);


router.post('/exam/:examId/questions', authenticate, examinerOnly, examController.addQuestionToExam);


router.delete('/exam/:examId/questions/:examQuestionId', authenticate, examinerOnly, questionController.removeQuestionFromExam);


router.post('/questions', authenticate, examinerOnly, upload.single('image'), questionController.createQuestion);


module.exports = router;

/*
// routes/questionRoutes.js
const express = require('express');


const questionController = require('../../controllers/examiner/questionAnswerController');

//import { createExam, getExamsByCourse } from '@controllers';


const upload = require('../../utils/upload');

const router = express.Router();



// Create a new question
//router.post('/questions', upload.single('image'), questionController.createQuestion);
router.post('/questions', upload.single('image'), questionController.createQuestion);


// Get all questions for an exam
//router.get('/questions/:examId', questionController.getQuestionsByExam);

router.get('/questions/:examId',questionController.getCourseQuestions)
// In your questionAnswerRoutes.js
router.get('/courses/:courseId/questions', questionController.getCourseQuestions);

module.exports = router;

*/