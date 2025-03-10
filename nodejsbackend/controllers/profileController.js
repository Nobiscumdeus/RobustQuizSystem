const { prisma } = require('../database'); // Import prisma client
const jwt = require('jsonwebtoken');

// Get Profile (already implemented)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the userId from the decoded JWT
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        students: true,
        exams: true,
        courses: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user profile: ', err);
    res.status(500).json({ message: 'An error occurred while fetching the profile.' });
  }
};



// Edit Profile
const editProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, firstName, lastName, role } = req.body;

    // Validate required fields
 // Validate that at least one field is provided
 if (!username && !firstName  && !role) {
  return res.status(400).json({ message: 'At least one field is required for update.' });
}

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        firstName,
        role,
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating user profile: ', err);
    res.status(500).json({ message: 'An error occurred while updating the profile.' });
  }
};



// Edit Exam
const editExam = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { examId, title, date, duration } = req.body;

    // Validate required fields
    if (!examId && !title && !date && !duration) {
      return res.status(400).json({ message: 'Exam ID, Title, Date, and Duration are required.' });
    }

    // Check if the exam belongs to the user
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || exam.examinerId !== userId) {
      return res.status(404).json({ message: 'Exam not found or unauthorized.' });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title,
        date: new Date(date),  // Ensure the date is in a valid Date format
        duration,
      },
    });

    res.status(200).json(updatedExam);
  } catch (err) {
    console.error('Error updating exam: ', err);
    res.status(500).json({ message: 'An error occurred while updating the exam.' });
  }
};




// Delete Exam
const deleteExam = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { examId } = req.params;

    console.log('examId:', examId); // Log the examId

    // Convert examId to an integer if necessary
    const parsedExamId = parseInt(examId, 10);

    if (isNaN(parsedExamId)) {
      return res.status(400).json({ message: 'Invalid exam ID.' });
    }

    // Check if the exam belongs to the user
    const exam = await prisma.exam.findUnique({
      where: { id: parsedExamId },
    });

    if (!exam || exam.examinerId !== userId) {
      return res.status(404).json({ message: 'Exam not found or unauthorized.' });
    }

    await prisma.exam.delete({
      where: { id: parsedExamId },
    });

    res.status(200).json({ message: 'Exam deleted successfully.' });
  } catch (err) {
    console.error('Error deleting exam: ', err);
    res.status(500).json({ message: 'An error occurred while deleting the exam.' });
  }
};





// Edit Course
const editCourse = async (req, res) => {
  try {
    const userId = req.user.userId;  // The user making the request
    const { courseId, title, code } = req.body;

    // Validate required fields
    if (!courseId && !title && !code) {
      return res.status(400).json({ message: 'One of Course ID, Title, and Code is/are required.' });
    }

    // Ensure courseId is an integer
    const parsedCourseId = parseInt(courseId, 10);

    if (isNaN(parsedCourseId)) {
      return res.status(400).json({ message: 'Invalid course ID.' });
    }

    // Check if the course belongs to the user (examinerId matches userId)
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
    });

    if (!course || course.examinerId !== userId) {
      return res.status(404).json({ message: 'Course not found or unauthorized.' });
    }

    // Update the course details
    const updatedCourse = await prisma.course.update({
      where: { id: parsedCourseId },
      data: {
        title,
        code,
      },
    });

    res.status(200).json(updatedCourse);
  } catch (err) {
    console.error('Error updating course: ', err);
    res.status(500).json({ message: 'An error occurred while updating the course.' });
  }
};


//delete course 
const deleteCourse = async (req, res) => {
  try {
    const userId = req.user.userId;  // The user making the request
    const { courseId } = req.params;

    // Ensure courseId is an integer
    const parsedCourseId = parseInt(courseId, 10);

    if (isNaN(parsedCourseId)) {
      return res.status(400).json({ message: 'Invalid course ID.' });
    }

    // Check if the course belongs to the user (examinerId matches userId)
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId },
    });

    if (!course || course.examinerId !== userId) {
      return res.status(404).json({ message: 'Course not found or unauthorized.' });
    }

    // Delete all exams associated with the course
    await prisma.exam.deleteMany({
      where: { courseId: parsedCourseId },
    });

    // Now delete the course
    await prisma.course.delete({
      where: { id: parsedCourseId },
    });

    res.status(200).json({ message: 'Course and related exams deleted successfully.' });
  } catch (err) {
    console.error('Error deleting course: ', err);
    res.status(500).json({ message: 'An error occurred while deleting the course.' });
  }
};





// Edit a student's data
const editStudent = async (req, res) => {
  const { id } = req.params; // Get student ID from URL parameter
  const { firstName, lastName, matricNo } = req.body; // Get data to be updated

  try {
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update student data
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        matricNo,
      },
    });

    return res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({ message: "Failed to update student" });
  }
};


// Delete a student by ID
const deleteStudent = async (req, res) => {
  try {
    const userId = req.user.userId;  // The user making the request
    const { studentId } = req.params;

    // Ensure studentId is an integer
    const parsedStudentId = parseInt(studentId, 10);

    if (isNaN(parsedStudentId)) {
      return res.status(400).json({ message: 'Invalid student ID.' });
    }

    // Check if the student exists and if the examinerId matches the current user's ID
    const student = await prisma.student.findUnique({
      where: { id: parsedStudentId },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (student.examinerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this student.' });
    }

    // Delete any associated exam results
    await prisma.examResult.deleteMany({
      where: { studentId: parsedStudentId },
    });

    // Delete the student
    await prisma.student.delete({
      where: { id: parsedStudentId },
    });

    res.status(200).json({ message: 'Student and associated exam results deleted successfully.' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'An error occurred while deleting the student.' });
  }
};




module.exports = {
  getProfile,
  editProfile,
  editExam,
  deleteExam,
  editCourse,
  deleteCourse,
  editStudent,
  deleteStudent
};
