const express = require('express');
const examController = require('@controllers/examiner/examController');
//const studentExamController = require('@controllers/student/studentExamController')
const studentController  = require('@controllers/examiner/studentController');
const studentExamController = require('@controllers/student/studentExamController');
const { authenticate, examinerOnly } = require('@middlewares/auth');
const router = express.Router();

router.post('/exams', authenticate, examinerOnly, examController.createExam);
router.get('/exams/:examinerId', authenticate, examinerOnly, examController.getExamsByExaminer);
router.get('/singleexam/:examId', authenticate, examinerOnly, examController.getExamById);
router.get('/exam/:examId/edit', authenticate, examinerOnly, examController.getExamForEdit);

router.put('/exam/:examId', authenticate, examinerOnly, studentExamController.updateExam);


router.delete('/exams/:examId', authenticate, examinerOnly, examController.deleteExam);
router.post('/exam/:examId/students', authenticate, examinerOnly, examController.addStudentToExam);
router.delete('/exam/:examId/students/:studentId', authenticate, examinerOnly, examController.removeStudentFromExam);


router.get('/exam/:examId/eligible-students', authenticate, examinerOnly, studentController.getEligibleStudents);
router.get('/exam/:examId/results', authenticate, examinerOnly, examController.getExamResults);
router.get('/exam/:examId/question-analytics', authenticate, examinerOnly, examController.getQuestionAnalytics);
router.get('/exam/:examId/attendances', authenticate, examinerOnly, examController.getExamAttendances);
router.post('/exam/:examId/questions/random', authenticate, examinerOnly, examController.addRandomQuestionsToExam);

router.patch('/exam/:examId/publish', authenticate, examinerOnly, examController.publishExam);
router.patch('/exam/:examId/unpublish', authenticate, examinerOnly, examController.unpublishExam);

module.exports = router;



