
const express = require('express');
const studentExamController = require('@controllers/student/studentExamController');
const studentAuthController = require('@controllers/student/studentAuthController');
const { studentAuthenticate, studentOnly } = require('@middlewares/auth');
const router = express.Router();

router.post('/student/login', studentAuthController.studentLogin);
router.get('/student/exams/:matricNo', studentAuthenticate, studentOnly, studentExamController.getStudentExams);
router.post('/student/exam/:examId/validate', studentAuthenticate, studentOnly, studentExamController.validateExamAccess);
router.post('/session/:sessionId/start', studentAuthenticate, studentOnly, studentExamController.startExamSession);
router.get('/exam/:examId/session', studentAuthenticate, studentOnly, studentExamController.fetchExamSession);
router.get('/:id/questions', studentAuthenticate, studentOnly, studentExamController.fetchQuestionBatch);
router.put('/session/:sessionId/answer', studentAuthenticate, studentOnly, studentExamController.updateAnswer);
router.put('/session/:sessionId/answers/batch', studentAuthenticate, studentOnly, studentExamController.saveAnswerBatch);
router.post('/session/:sessionId/submit', studentAuthenticate, studentOnly, studentExamController.submitExam);
router.post('/session/:sessionId/auto-submit', studentAuthenticate, studentOnly, studentExamController.autoSubmitExam);
router.get('/session/:sessionId/time', studentAuthenticate, studentOnly, studentExamController.syncTimer);
router.post('/session/:sessionId/heartbeat', studentAuthenticate, studentOnly, studentExamController.sendHeartbeat);
router.post('/session/:sessionId/violation', studentAuthenticate, studentOnly, studentExamController.logViolation);
router.get('/session/:sessionId/answers', studentAuthenticate, studentOnly, studentExamController.getCurrentAnswers);
router.get('/session/:sessionId/violations', studentAuthenticate, studentOnly, studentExamController.getViolations);

module.exports = router;
/*
import express from 'express';

import { createExam, getExamsByCourse } from '@controllers';

const router = express.Router();

router.post('/', createExam);
router.get('/course/:courseId', getExamsByCourse);



export default router;

*/


