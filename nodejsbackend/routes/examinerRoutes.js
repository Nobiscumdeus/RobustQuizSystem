import express from 'express';

const ExaminerController = require('../controllers/examinerController');
const authenticate =require('../middlewares/auth');


const router = express.Router();

const examinerController =new ExaminerController();
router.use(authenticate);

router.post('/exams',examinerController.createExam);
router.post('/exams/:examId/questions', examinerController.addQuestionsToExam);
router.put('/exams/:examId/publish', examinerController.publishExam);
router.put('/exams/:examId/activate', examinerController.activateExam);
router.get('/exams/:examId/results', examinerController.getExamResults);




//Student router later
router.get('/exams', examinerController.getAvailableExams);
router.post('/exams/:examId/start', examinerController.startExam);
router.post('/exams/:examId/submit', examinerController.submitExam);
router.get('/exam-history', examinerController.getExamHistory);

export default router;

