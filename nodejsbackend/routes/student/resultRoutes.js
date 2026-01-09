
const express = require('express');
const studentResultController = require('@controllers/student/studentResultsController');
const studentAuthController = require('@controllers/student/studentAuthController');
const { studentAuthenticate, studentOnly } = require('@middlewares/auth');
const router = express.Router();


router.get('/student/results', studentAuthenticate, studentOnly, studentResultController.getStudentResults);
router.get('/student/results/:examId', studentAuthenticate, studentOnly, studentResultController.getExamResultDetails);
router.get('/student/performance', studentAuthenticate, studentOnly, studentResultController.getPerformanceStats);


module.exports = router;