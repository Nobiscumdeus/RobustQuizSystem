// Routes for user management

//These are routes for user-related management, like fetching user data.

const express = require('express');
const { getUserDetails } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Protected route: Get user details (accessible only for authorized users)
router.get('/me', authenticate, getUserDetails);

module.exports = router;
