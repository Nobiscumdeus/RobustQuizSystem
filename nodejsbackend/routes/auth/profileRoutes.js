const express = require('express');
const router = express.Router();

const { authenticate } = require('@middlewares/auth');
const { getProfile, updateProfile } = require('@controllers/auth/profileController'); 

router.get('/profile',authenticate,getProfile);
router.put('/profile',authenticate,updateProfile);

module.exports = router;