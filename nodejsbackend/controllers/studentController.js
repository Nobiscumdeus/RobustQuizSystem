//import prisma from '../database'
const { prisma } = require('../database'); // Import prisma client
//const { prisma } = require('../database'); // Import prisma client

exports.registerStudent = async (req, res) => {
  const { students, courseId, examId } = req.body;
  const examinerId = req.user.userId;

  // Log req.user to verify the user details
  console.log('Authenticated User:', req.user);
  console.log('Examiner ID:', examinerId); // Log the examiner ID for debugging

  const parsedExamId = parseInt(examId, 10);

  const parsedCourseId=parseInt(courseId,10)

  if (!parsedExamId || isNaN(parsedExamId)) {
    return res.status(400).json({ message: 'Invalid exam ID' });
  }

  if (!parsedCourseId || isNaN(parsedCourseId)) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  try {
    // Check if the current user is an examiner
    const examiner = await prisma.user.findUnique({
      where: { id: examinerId },
    });

    // Log examiner data to check if role is correct
    console.log('Examiner from DB:', examiner);

    if (!examiner) {
      return res.status(403).json({ message: 'Ooops!!! Not authorized to register students' });
    }

    // Check if the exam exists
    const examExists = await prisma.exam.findUnique({
      where: { id: parsedCourseId },
    });

    if (!examExists) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const createdStudents = await Promise.all(
      students.map(async (student) => {
        const existingStudent = await prisma.student.findUnique({
          where: { matricNo: student.matricNo },
        });

        if (existingStudent) {
          console.log(`Student with matricNo ${student.matricNo} already exists`);
          return null;
        }

        return await prisma.student.create({
          data: {
            matricNo: student.matricNo,
            firstName: student.firstName,
            lastName: student.lastName,
            examinerId: examinerId,
          },
        });
      })
    );

    const validCreatedStudents = createdStudents.filter(student => student !== null);

    if (validCreatedStudents.length === 0) {
      return res.status(400).json({ message: 'No new students were registered' });
    }

    const studentIds = validCreatedStudents.map(student => student.id);

    await prisma.exam.update({
      where: { id: parsedExamId },
      data: {
        students: {
          connect: studentIds.map(id => ({ id })),
        },
      },
    });

    res.status(200).json({
      message: `${validCreatedStudents.length} students registered successfully!`,
      students: validCreatedStudents,
      examinerId,
    });
  } catch (err) {
    console.error('Error occurred:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Failed to register students', error: err.message });
  }
};
