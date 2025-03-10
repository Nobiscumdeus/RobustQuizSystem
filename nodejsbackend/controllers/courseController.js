const { prisma } = require('../database');  // Import the Prisma client

// Register new Course
exports.createCourse = async (req, res) => {
  const { title, code, description, examinerId } = req.body;

  try {
    // Input validation: Ensure title and examinerId are provided
    if (!title || !examinerId) {
      return res.status(400).json({ message: 'Course title and examiner ID are required' });
    }

    // Ensure the examinerId is a valid ID (check if it's a number)
    if (isNaN(examinerId)) {
      return res.status(400).json({ message: 'Invalid examiner ID' });
    }

    // Create a new course
    const newCourse = await prisma.course.create({
      data: {
        title,
        code: code || null, // Course code is optional, defaulting to null if not provided
        description: description || null, // Course description is optional, defaulting to null if not provided
        examinerId, // Associate the course with the examiner
      },
    });

    // Respond with the created course details
    return res.status(201).json({
      message: 'Course created successfully',
      course: newCourse,
    });

  } catch (err) {
    console.error('Error creating course:', err);
    
    // Handle Prisma specific errors
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Course already exists with the provided data.' });
    }
    
    // Catch-all error handling
    return res.status(500).json({
      message: 'Failed to create course. Please try again.',
      error: err.message,
    });
  }
};

// Get all Courses by Examiner
exports.getCoursesByExaminer = async (req, res) => {
  const { examinerId } = req.params;

  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }

    // Retrieve all courses associated with the examiner
    const courses = await prisma.course.findMany({
      where: {
        examinerId: parseInt(examinerId), // Ensure examinerId is an integer
      },
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this examiner' });
    }

    res.status(200).json({ courses });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve courses. Please try again.' });
  }
};

// Register new Exam
exports.createExam = async (req, res) => {
  const { title, date, password, duration, examinerId, courseId } = req.body;

  try {
    if (!title || !examinerId || !courseId || !date || !password || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new exam for the examiner, linked to a course
    const newExam = await prisma.exam.create({
      data: {
        title,
        date,
        password,
        duration,
        examinerId, // Associate the exam with the examiner
        courseId,   // Link the exam to the specified course
      },
    });

    res.status(201).json({
      message: 'Exam created successfully',
      exam: newExam,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create exam. Please try again.' });
  }
};

// Get all Exams by Examiner
exports.getExamsByExaminer = async (req, res) => {
  const { examinerId } = req.params;

  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }

    // Retrieve all exams associated with the examiner
    const exams = await prisma.exam.findMany({
      where: {
        examinerId: parseInt(examinerId), // Ensure examinerId is an integer
      },
    });

    if (exams.length === 0) {
      return res.status(404).json({ message: 'No exams found for this examiner' });
    }

    res.status(200).json({ exams });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve exams. Please try again.' });
  }
};

// Select Course and Exam for Student Registration (for the Admin/Examiner interface)
exports.getCoursesAndExamsForRegistration = async (req, res) => {
  const { examinerId } = req.params;

  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }

    // Get all courses and exams that belong to the examiner
    const courses = await prisma.course.findMany({
      where: { examinerId: parseInt(examinerId) },
    });

    const exams = await prisma.exam.findMany({
      where: { examinerId: parseInt(examinerId) },
    });

    if (courses.length === 0 || exams.length === 0) {
      return res.status(404).json({ message: 'No courses or exams found for this examiner' });
    }

    res.status(200).json({
      courses,
      exams,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve courses and exams for registration. Please try again.' });
  }
};
