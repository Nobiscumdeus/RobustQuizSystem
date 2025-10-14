
const express = require('express');
const courseController = require('@controllers/examiner/courseController');
const { authenticate, studentAuthenticate, examinerOnly, studentOnly } = require('@middlewares/auth');
const router = express.Router();



// Course management only

router.post('/courses', authenticate, examinerOnly, courseController.createCourse);
router.get('/courses/:examinerId', authenticate, examinerOnly, courseController.getCoursesByExaminer);
router.get('/singlecourse/:courseId', authenticate, examinerOnly, courseController.getCourseById);
router.get('/course/:courseId/edit', authenticate, examinerOnly, courseController.getCourseForEdit);
router.get('/courses-exams/examiner/:examinerId', authenticate, examinerOnly, courseController.getCoursesAndExamsForRegistration);
router.put('/course/:courseId', authenticate, examinerOnly, courseController.updateCourse);
router.delete('/courses/:courseId', authenticate, examinerOnly, courseController.deleteCourse);
router.get('/students/not-in-course/:courseId', authenticate, examinerOnly, courseController.getStudentsNotInCourse);
router.post('/courses/:courseId/students', authenticate, examinerOnly, courseController.addStudentsToCourse);
router.delete('/courses/:courseId/students/:studentId', authenticate, examinerOnly, courseController.removeStudentFromCourse);

// Examiner routes (unchanged, using authenticate)
/*
router.post('/courses', authenticate, examinerOnly, courseController.createCourse);
router.get('/courses/:examinerId', authenticate, examinerOnly, courseController.getCoursesByExaminer);
router.get('/courses-exams/:examinerId', authenticate, examinerOnly, courseController.getCoursesAndExamsForRegistration);
router.get('/singlecourse/:courseId', authenticate, examinerOnly, courseController.getCourseById);
router.get('/course/:courseId/edit', authenticate, examinerOnly, courseController.getCourseForEdit);
router.put('/course/:courseId', authenticate, examinerOnly, courseController.updateCourse);
router.delete('/courses/:courseId', authenticate, examinerOnly, courseController.deleteCourse);
router.post('/exams', authenticate, examinerOnly, courseController.createExam);
router.get('/exams/:examinerId', authenticate, examinerOnly, courseController.getExamsByExaminer);
router.get('/singleexam/:examId', authenticate, examinerOnly, courseController.getExamById);
router.get('/exam/:examId/edit', authenticate, examinerOnly, courseController.getExamForEdit);
router.put('/exam/:examId', authenticate, examinerOnly, courseController.updateExam);
router.delete('/exams/:examId', authenticate, examinerOnly, courseController.deleteExam);
router.post('/exam/:examId/students', authenticate, examinerOnly, courseController.addStudentToExam);
router.delete('/exam/:examId/students/:studentId', authenticate, examinerOnly, courseController.removeStudentFromExam);
router.post('/exam/:examId/questions/random', authenticate, examinerOnly, courseController.addRandomQuestionsToExam);
router.get('/exam/:examId/eligible-students', authenticate, examinerOnly, courseController.getEligibleStudents);
router.get('/course/:courseId/questions', authenticate, examinerOnly, courseController.getCourseQuestions);
router.post('/exam/:examId/questions', authenticate, examinerOnly, courseController.addQuestionToExam);
router.delete('/exam/:examId/questions/:examQuestionId', authenticate, examinerOnly, courseController.removeQuestionFromExam);
router.get('/exam/:examId/results', authenticate, examinerOnly, courseController.getExamResults);
router.get('/exam/:examId/question-analytics', authenticate, examinerOnly, courseController.getQuestionAnalytics);
router.get('/exam/:examId/attendances', authenticate, examinerOnly, courseController.getExamAttendances);
router.get('/courses-exams/examiner/:examinerId', authenticate, examinerOnly, courseController.getCoursesAndExamsForRegistration);
router.get('/students/:examinerId', authenticate, examinerOnly, courseController.getStudentsByExaminer);
router.get('/student/:studentId', authenticate, examinerOnly, courseController.getStudentById);
router.get('/student/:studentId/edit', authenticate, examinerOnly, courseController.getStudentForEdit);
router.put('/student/:studentId', authenticate, examinerOnly, courseController.updateStudent);
router.get('/students/not-in-course/:courseId', authenticate, examinerOnly, courseController.getStudentsNotInCourse);
router.post('/courses/:courseId/students', authenticate, examinerOnly, courseController.addStudentsToCourse);
router.delete('/courses/:courseId/students/:studentId', authenticate, examinerOnly, courseController.removeStudentFromCourse);

router.get('/api/student/exams/:matricNo',studentAuthenticate,studentOnly,courseController.getStudentExams); // Unauthenticated


router.post('/api/student/login', courseController.studentLogin); // Unauthenticated
router.post('/api/student/exam/:examId/validate', studentAuthenticate, studentOnly, courseController.validateExamAccess);
router.post('/api/student/session/:sessionId/start', studentAuthenticate, studentOnly, courseController.startExamSession); // New route
router.get('/api/student/exam/:examId/session', studentAuthenticate, studentOnly, courseController.fetchExamSession);
router.get('/api/student/:id/questions', studentAuthenticate, studentOnly, courseController.fetchQuestionBatch);
router.put('/api/student/session/:sessionId/answer', studentAuthenticate, studentOnly, courseController.updateAnswer);
router.put('/api/student/session/:sessionId/answers/batch', studentAuthenticate, studentOnly, courseController.saveAnswerBatch);
router.post('/api/student/session/:sessionId/submit', studentAuthenticate, studentOnly, courseController.submitExam);
router.post('/api/student/session/:sessionId/auto-submit', studentAuthenticate, studentOnly, courseController.autoSubmitExam);
router.get('/api/student/session/:sessionId/time', studentAuthenticate, studentOnly, courseController.syncTimer);
router.post('/api/student/session/:sessionId/heartbeat', studentAuthenticate, studentOnly, courseController.sendHeartbeat);
router.post('/api/student/session/:sessionId/violation', studentAuthenticate, studentOnly, courseController.logViolation);
router.get('/api/student/session/:sessionId/answers', studentAuthenticate, studentOnly, courseController.getCurrentAnswers);
router.get('/api/student/session/:sessionId/violations', studentAuthenticate, studentOnly, courseController.getViolations);

*/
module.exports = router;