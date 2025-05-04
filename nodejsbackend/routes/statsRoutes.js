const express = require('express');
const { getUserStats } = require('../controllers/statsController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();


router.get('/api/stats',authenticate,getUserStats);



module.exports=router;
