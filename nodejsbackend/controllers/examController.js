
const { prisma } = require('../database'); // Import prisma client
// Create a new exam


export const createExam = async (req, res) => {
  // DEBUG: Log the raw request body first
  console.log('Raw request body:', JSON.stringify(req.body, null, 2));
  
  // Process the data with careful logging
  try {
    // Format proctoringSettings if it exists
    let proctoringSettings = null;
    if (req.body.proctoringSettings) {
      try {
        proctoringSettings = typeof req.body.proctoringSettings === 'string' 
          ? JSON.parse(req.body.proctoringSettings) 
          : req.body.proctoringSettings;
        console.log('Processed proctoringSettings:', proctoringSettings);
      } catch (e) {
        console.error('Error parsing proctoringSettings:', e);
        // Default to empty object if parsing fails
        proctoringSettings = {};
      }
    }
    
    // Create the exam data with proper type conversion
    const examData = {
      title: req.body.title,
      date: new Date(req.body.date),
      password: req.body.password,
      duration: parseInt(req.body.duration) || 0,
      examinerId: parseInt(req.body.examinerId) || 0,
      courseId: parseInt(req.body.courseId) || 0,
      
      // New fields with careful type handling and logging
      description: req.body.description || null,
      instructions: req.body.instructions || null,
      isPublished: req.body.isPublished === true || req.body.isPublished === 'true',
      startTime: req.body.startTime ? new Date(req.body.startTime) : null,
      endTime: req.body.endTime ? new Date(req.body.endTime) : null,
      maxAttempts: req.body.maxAttempts ? parseInt(req.body.maxAttempts) : 1,
      passingScore: req.body.passingScore ? parseFloat(req.body.passingScore) : 60.0,
      proctoringSettings: proctoringSettings
    };
    
    // Log the processed data that will be sent to Prisma
    console.log('Processed exam data for Prisma:', JSON.stringify(examData, null, 2));

    // Create the exam with the processed data
    const exam = await prisma.exam.create({
      data: examData
    });

    // Log the result from Prisma to confirm what was saved
    console.log('Prisma result:', JSON.stringify(exam, null, 2));

    return res.status(201).json({
      success: true,
      exam
    });
  } catch (error) {
    console.error('Creation error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Always include detailed error info
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      code: error.code
    };
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Duplicate exam',
        details: errorDetails
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Related record not found',
        details: errorDetails 
      });
    }
    
    // For unknown field errors
    if (error.message.includes('Unknown field')) {
      return res.status(400).json({
        error: 'Schema mismatch - field not found in database schema',
        details: errorDetails
      });
    }

    return res.status(500).json({
      error: 'Exam creation failed',
      details: errorDetails
    });
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
