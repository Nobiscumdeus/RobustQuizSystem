const express = require('express');

const {searchAll} =require('../controllers/searchController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
router.get('/api/search/',authenticate,searchAll)



module.exports = router;



