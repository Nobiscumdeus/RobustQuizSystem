const express = require('express');
require('module-alias/register');
const {searchAll} =require('@controllers/shared/searchController');
const { authenticate } = require('@middlewares/auth');

const router = express.Router();
router.get('/api/search/',authenticate,searchAll)



module.exports = router;



