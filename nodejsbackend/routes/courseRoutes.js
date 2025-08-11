const express = require('express');
const courseController = require('../controllers/courseController'); // Assuming you saved the functions in courseController.js
const { authenticate } = require('../middlewares/auth');
const router = express.Router();



//router.post('/courses',authenticate,courseController.createCourse);
router.post('/courses',authenticate,courseController.createCourse);
router.get('/courses/:examinerId', authenticate,courseController.getCoursesByExaminer);
router.get('/courses-exams/:examinerId',authenticate, courseController.getCoursesAndExamsForRegistration);



router.get('/singlecourse/:courseId', authenticate, courseController.getCourseById);
router.get('/course/:courseId/edit', authenticate, courseController.getCourseForEdit);
router.put('/course/:courseId', authenticate, courseController.updateCourse);




router.post('/exams',authenticate, courseController.createExam);
router.get('/exams/:examinerId',authenticate, courseController.getExamsByExaminer);
router.get('/singleexam/:examId',authenticate, courseController.getExamById);
router.get('/exam/:examId/edit', authenticate,courseController.getExamForEdit);
router.put('/exam/:examId',authenticate, courseController.updateExam);

// New route for deleting an exam
router.post('/exam/:examId/students', authenticate, courseController.addStudentToExam);
router.delete('/exam/:examId/students/:studentId', authenticate, courseController.removeStudentFromExam);
router.post('/exam/:examId/questions/random', authenticate, courseController.addRandomQuestionsToExam);
router.delete('/exams/:examId', authenticate, courseController.deleteExam);



//....................................Newly added routes for getting students on board for exam .............
router.get('/exam/:examId/eligible-students', authenticate, courseController.getEligibleStudents);
router.get('/course/:courseId/questions', authenticate, courseController.getCourseQuestions);
router.post('/exam/:examId/questions', authenticate, courseController.addQuestionToExam);
router.delete('/exam/:examId/questions/:examQuestionId', authenticate, courseController.removeQuestionFromExam);


router.get('/exam/:examId/results', authenticate, courseController.getExamResults);
router.get('/exam/:examId/question-analytics', authenticate, courseController.getQuestionAnalytics);
router.get('/exam/:examId/attendances', authenticate, courseController.getExamAttendances);



//getting course and exams by an examiner route 
router.get('/courses-exams/examiner/:examinerId',authenticate,courseController.getCoursesAndExamsForRegistration)
//New route for deleting a course 
router.delete('/courses/:courseId',authenticate,courseController.deleteCourse);
//..............................Student routes..............................
router.get('/students/:examinerId',authenticate,courseController.getStudentsByExaminer);
router.get('/student/:studentId',authenticate,courseController.getStudentById);

router.get('/student/:studentId/edit',authenticate,courseController.getStudentForEdit);
router.put('/student/:studentId',authenticate,courseController.updateStudent);


router.get('/students/not-in-course/:courseId', authenticate, courseController.getStudentsNotInCourse);

router.post('/courses/:courseId/students', authenticate, courseController.addStudentsToCourse);

router.delete('/courses/:courseId/students/:studentId', authenticate, courseController.removeStudentFromCourse);


router.post('/exam/login', courseController.studentLogin);



module.exports=router;
