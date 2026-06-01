const express = require('express');
const { authenticate, examinerOnly } = require('@middlewares/auth');
const analyticsController = require('@controllers/admin/analyticsController');

const router = express.Router();

router.get('/analytics', authenticate, examinerOnly, analyticsController.analyticsData);
router.get('/analytics/participation', authenticate, examinerOnly, analyticsController.participationData);
router.get('/analytics/performance', authenticate, examinerOnly, analyticsController.performanceData);
router.get('/analytics/distribution', authenticate, examinerOnly, analyticsController.distributionData);
router.get('/analytics/devices', authenticate, examinerOnly, analyticsController.deviceUsageData);


module.exports = router;