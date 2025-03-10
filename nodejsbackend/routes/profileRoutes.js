const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getProfile,
  editProfile,
  editExam,
  deleteExam,
  editCourse,
  deleteCourse,
  editStudent,
  deleteStudent
  
} = require('../controllers/profileController');  // Ensure this import is correct

// Profile Routes
// Profile Routes
router.get('/profile', authenticate, getProfile); // Get user profile
router.put('/profile', authenticate, editProfile); // Edit user profile

// Exam Routes
router.put('/profile/exams/:examId', authenticate, editExam); // Edit exam


router.delete('/profile/exams/:examId', authenticate, deleteExam); // Delete exam

// Course Routes
router.put('/profile/courses/:courseId', authenticate, editCourse); // Edit course
router.delete('/profile/courses/:courseId', authenticate, deleteCourse); // Delete course

// Student Routes
router.put('/profile/students/:studentId', authenticate, editStudent); // Edit course
router.delete('/profile/students/:studentId', authenticate, deleteStudent); // Delete course



module.exports = router;
