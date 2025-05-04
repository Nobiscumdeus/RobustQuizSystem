const express = require('express');

const { upload, uploadImage } = require('../controllers/imageUploadController');

const router = express.Router();


//Endpoint for image upload 
router.post('/upload',upload.single('image'),uploadImage);


module.exports = router;