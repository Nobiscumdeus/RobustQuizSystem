
const { prisma } = require('../database'); // Import prisma client
// Create a new exam
export const createExam = async (req, res) => {
  const { title, date, password, duration, examinerId, courseId } = req.body;

  try {
    const exam = await prisma.exam.create({
      data: {
        title,
        date,
        password,
        duration,
        examinerId,
        courseId,
      },
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Error creating exam.' });
  }
};

// Get all exams by course
export const getExamsByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const exams = await prisma.exam.findMany({
      where: { courseId: parseInt(courseId) },
    });

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exams.' });
  }
};
