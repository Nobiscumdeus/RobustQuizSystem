
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


module.exports = router;