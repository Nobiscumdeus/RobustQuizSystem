import express from 'express';

import { createExam, getExamsByCourse } from '../controllers/examController';

const router = express.Router();

router.post('/', createExam);
router.get('/course/:courseId', getExamsByCourse);



export default router;


