const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('@database'); // Import prisma client

exports.studentLogin = async (req, res) => {
  console.log("🛠 Raw body received:", req.body);
  const { matricNo } = req.body;

  if (!matricNo) {
    return res.status(400).json({ 
      message: 'Matric number is required',
      debug: { receivedMatricNo: !!matricNo }
    });
  }

  console.log('🚀 Student login attempt:', { matricNo });
  const overallStartTime = Date.now();

  try {
    // Step 1: Find and authenticate student
    const student = await prisma.student.findUnique({
      where: { matricNo },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNo: true,
        email: true,
        isActive: true
      }
    });

    if (!student) {
      console.log('❌ Student not found with matricNo:', matricNo);
      return res.status(401).json({ 
        message: 'Invalid matric number'
      });
    }

    if (!student.isActive) {
      console.log('❌ Student account inactive:', student.id);
      return res.status(401).json({ 
        message: 'Account is inactive'
      });
    }

    // Step 2: Get available exams - using the junction table approach
    console.log('🔍 Starting availableExams query...');
    const currentTime = new Date();
    
    const availableExams = await prisma.exam.findMany({
      where: {
        course: {
          courseStudents: {
            some: { studentId: student.id }
          }
        },
        // Simplified conditions - just check if published/active
        OR: [
          { state: 'PUBLISHED' },
          { state: 'ACTIVE' }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        startTime: true,
        endTime: true,
        maxAttempts: true,
        state: true,
        instructions: true,
        course: { 
          select: { 
            id: true, 
            title: true, 
            code: true 
          } 
        },
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        results: {
          where: { studentId: student.id },
          select: { 
            id: true, 
            status: true, 
            score: true,
            createdAt: true
          }
        }
      }
    });
    
    console.log('📊 Query result: Found', availableExams.length, 'exams');

    // Step 3: Process exam data
    const examsWithStatus = availableExams.map((exam) => {
      const attemptsTaken = exam.results.length;
      
      // Calculate time remaining
      let timeRemaining = null;
      if (exam.endTime) {
        const timeDiff = new Date(exam.endTime) - currentTime;
        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          timeRemaining = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
        }
      }

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        course: exam.course,
        examiner: exam.examiner,
        attemptsTaken,
        maxAttempts: exam.maxAttempts,
        canTakeExam: attemptsTaken < exam.maxAttempts,
        timeRemaining,
        lastAttempt: attemptsTaken > 0 ? exam.results[exam.results.length - 1] : null,
        startTime: exam.startTime ? exam.startTime.toISOString() : null,
        endTime: exam.endTime ? exam.endTime.toISOString() : null,
        instructions: exam.instructions
      };
    });

    // Step 4: Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({ 
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      { 
        studentId: student.id, 
        matricNo: student.matricNo,
        firstName: student.firstName,
        lastName: student.lastName,
        type: 'student_dashboard'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Student login successful:', {
      studentId: student.id,
      matricNo: student.matricNo,
      availableExams: examsWithStatus.length
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      student,
      availableExams: examsWithStatus,
      serverTime: currentTime.toISOString()
    });

  } catch (err) {
    console.error('💥 Student login error:', {
      message: err.message,
      matricNo,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


