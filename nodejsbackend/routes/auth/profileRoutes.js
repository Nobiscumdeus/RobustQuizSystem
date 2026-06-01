const express = require('express');
const router = express.Router();

const { authenticate } = require('@middlewares/auth');
const { upload } = require('@controllers/shared/imageUploadController');
const {
	getProfile,
	updateProfile,
	changePassword,
	uploadAvatar,
	buildProfileStatsResponse
} = require('@controllers/auth/profileController'); 

router.get('/profile',authenticate,getProfile);
router.put('/profile',authenticate,updateProfile);
router.put('/profile/password', authenticate, changePassword);
router.post('/profile/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.get('/profile/stats', authenticate, buildProfileStatsResponse);

module.exports = router;