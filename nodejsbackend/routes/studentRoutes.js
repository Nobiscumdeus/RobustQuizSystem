import express from 'express';
import { registerStudent, getStudentsByExaminer } from '../controllers/studentController';

const router = express.Router();

router.post('/', registerStudent);
router.get('/:examinerId', getStudentsByExaminer);

export default router;
