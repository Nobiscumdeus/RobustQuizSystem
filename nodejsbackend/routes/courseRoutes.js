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


/* // New route for uploading bulk questions
/*
// Get question bank for examiner
GET /api/questions/bank
// Add question to bank
POST /api/questions/bank
// Update question in bank
PUT /api/questions/bank/:id




---------------------------

// Get available questions for exam
GET /api/exams/:examId/available-questions
// Add questions to exam
POST /api/exams/:examId/questions
// Remove question from exam
DELETE /api/exams/:examId/questions/:questionId

------------------------------





// Publish exam (students can see it)
POST /api/exams/:examId/publish
// Activate exam (students can take it)
POST /api/exams/:examId/activate
// End exam
POST /api/exams/:examId/end
// Get exam status
GET /api/exams/:examId/status


------------------------------



// Get available exams for student
GET /api/student/exams
// Start exam attempt
POST /api/exams/:examId/start
// Submit answers
POST /api/exams/:examId/submit
// Get exam questions (for active attempt)
GET /api/exams/:examId/questions


-----------------------------

// Get live exam statistics
GET /api/exams/:examId/live-stats
// Get student progress
GET /api/exams/:examId/student-progress


*/



module.exports=router;
