const express = require('express');
const studentController = require('@controllers/examiner/studentController');
const { authenticate, examinerOnly } = require('@middlewares/auth');
const router = express.Router();

router.get('/students/:examinerId', authenticate, examinerOnly, studentController.getStudentsByExaminer);
router.get('/student/:studentId', authenticate, examinerOnly, studentController.getStudentById);
router.get('/student/:studentId/edit', authenticate, examinerOnly, studentController.getStudentForEdit);
router.put('/student/:studentId', authenticate, examinerOnly, studentController.updateStudent);

module.exports = router;

/*

const express=require('express')

const { authenticate } = require('@middlewares'); // Import authenticate middleware

const studentController =require('@controllers'); //Importing student controller 

const router = express.Router();


router.post('/', registerStudent);
router.get('/:examinerId', getStudentsByExaminer);

router.post('/students',authenticate,studentController.createStudent)


router.post('/student-register',authenticate,studentController.registerStudent);


router.delete('/students/:studentId',authenticate, studentController.deleteStudent);



module.exports=router;

*/
