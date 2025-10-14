// Routes for user management

//These are routes for user-related management, like fetching user data.

const express = require('express');
require('module-alias/register');
const { getUserDetails } = require('@controllers');
const { authenticate, authorize } = require('@middlewares');

const router = express.Router();

// Protected route: Get user details (accessible only for authorized users)
router.get('/me', authenticate, getUserDetails);

module.exports = router;
