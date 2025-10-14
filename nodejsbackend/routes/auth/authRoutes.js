const express = require('express');
const router = express.Router();
const authController = require('@controllers/auth/authController');


// Define routes and map them to controller functions
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh',authController.refreshToken);


module.exports = router;
