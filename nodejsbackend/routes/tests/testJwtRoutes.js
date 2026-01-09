const express = require('express');
const router = express.Router();

const jwtTestController =  require("@controllers/tests/testJwtController");


router.get('/test-jwt',jwtTestController.testJWT);

