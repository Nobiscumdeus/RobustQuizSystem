const express = require('express');
require('module-alias/register');
const { upload, uploadImage } = require('@controllers/shared/imageUploadController');

const router = express.Router();


//Endpoint for image upload 
router.post('/upload',upload.single('image'),uploadImage);


module.exports = router;