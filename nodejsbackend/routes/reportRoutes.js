const express =require('express');
const router=express.Router()
const reportController=require('../controllers/reportsController')
const {authenticate} =require('../middlewares/auth')

// Get report data (for preview)
router.get('/reports/data', authenticate, reportController.getReportData);

// Generate report file
router.get('/reports/generate', authenticate, reportController.generateReport);

module.exports = router;