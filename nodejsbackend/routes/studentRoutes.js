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

router.post('/students',authenticate,studentController.createStudent)


router.post('/student-register',authenticate,studentController.registerStudent);


router.delete('/students/:studentId',authenticate, studentController.deleteStudent);



module.exports=router;
