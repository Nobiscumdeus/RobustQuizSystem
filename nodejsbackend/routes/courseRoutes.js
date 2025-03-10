import express from 'express';
import { createCourse, getCourses } from '../controllers/courseController';

const router = express.Router();

router.post('/', createCourse);
router.get('/', getCourses);

export default router;
