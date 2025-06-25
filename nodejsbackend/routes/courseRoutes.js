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
router.delete('/exams/:examId', authenticate, courseController.deleteExam);

//New route for deleting a course 
router.delete('/courses/:courseId',authenticate,courseController.deleteCourse);
//..............................Student routes..............................
router.get('/students/:examinerId',authenticate,courseController.getStudentsByExaminer);
router.get('/student/:studentId',authenticate,courseController.getStudentById);

router.get('/student/:studentId/edit',authenticate,courseController.getStudentForEdit);
router.put('/student/:studentId',authenticate,courseController.updateStudent);

module.exports=router;
