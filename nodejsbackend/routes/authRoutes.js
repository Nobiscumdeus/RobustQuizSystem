const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Existing routes for register, login, etc.
router.post('/register', authController.register);
router.post('/login', authController.login);

// New routes for forgot and reset password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
