
const {ExaminerController, StudentController} = require('../controllers/examinerController');
const {authenticate} =require('../middlewares/auth');

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

