const express = require('express');

const {searchAll} =require('../controllers/searchController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
router.get('/api/search/',authenticate,searchAll)



//router.get('/api/routes', authenticate,searchAll);


//Routes for the searching
//app.get('/api/search/',authenticate,searchAll);

module.exports = router;



