const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

// School routes
router.post('/schools', schoolController.create);
router.get('/schools', schoolController.getAll);

module.exports = router;