const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Department routes
router.post('/departments', departmentController.create);
router.get('/schools/:schoolId/departments', departmentController.getBySchool);

module.exports = router;