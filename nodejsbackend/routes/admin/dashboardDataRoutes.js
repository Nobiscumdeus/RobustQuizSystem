const express = require('express');
const { authenticate} = require('@middlewares/auth');
//const dashboardDataController =require('../controllers/dashboardDataController')
const dashboardDataController  = require('@controllers/admin/dashboardDataController');

const router = express.Router();


router.get('/api/dashboard-data',dashboardDataController.dashboardData);



module.exports =router