const express=require('express')
//import { registerStudent, getStudentsByExaminer } from '../controllers/studentController';
//const authenticate=require('./middlewares/auth')
const { authenticate } = require('../middlewares/auth'); // Import authenticate middleware

const studentController =require('../controllers/studentController'); //Importing student controller 

const router = express.Router();

/*
router.post('/', registerStudent);
router.get('/:examinerId', getStudentsByExaminer);
*/

router.post('/student-register',authenticate,studentController.registerStudent);

module.exports=router;
