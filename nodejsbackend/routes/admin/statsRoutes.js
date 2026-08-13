const express = require('express');


const { getUserStats} = require('@controllers/admin/statsController');
const { authenticate } = require('@middlewares/auth');

const router = express.Router();


router.get('/stats',authenticate,getUserStats);



module.exports=router;
