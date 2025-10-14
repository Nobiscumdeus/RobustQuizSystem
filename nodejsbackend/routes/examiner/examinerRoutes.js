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
module.exports = router;




/*
const {ExaminerController, StudentController} = require('@controllers');
const {authenticate} =require('@middleware/auth');

const express = require('express');
const router = express.Router();


const examinerController =new ExaminerController();
const studentController=new StudentController();

router.use(authenticate);

router.post('/exams',examinerController.createExam);
router.post('/exams/:examId/questions', examinerController.addQuestionsToExam);
router.put('/exams/:examId/publish', examinerController.publishExam);
router.put('/exams/:examId/activate', examinerController.activateExam);
router.get('/exams/:examId/results', examinerController.getExamResults);




//Student router later
router.get('/exams', studentController.getAvailableExams);
router.post('/exams/:examId/start', studentController.startExam);
router.post('/exams/:examId/submit', studentController.submitExam);
router.get('/exam-history', studentController.getExamHistory);

module.exports=router ;

*/

