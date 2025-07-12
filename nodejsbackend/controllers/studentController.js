//import prisma from '../database'
const { prisma } = require('../database'); // Import prisma client
//const { prisma } = require('../database'); // Import prisma client

/*
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
*/
exports.registerStudent = async (req, res) => {
  const { students, courseId, examId } = req.body;
  const examinerId = req.user.userId;

  // Log req.user to verify the user details
  console.log('Authenticated User:', req.user);
  console.log('Examiner ID:', examinerId);

  const parsedExamId = parseInt(examId, 10);
  const parsedCourseId = parseInt(courseId, 10);

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

    console.log('Examiner from DB:', examiner);

    if (!examiner) {
      return res.status(403).json({ message: 'Ooops!!! Not authorized to register students' });
    }

    // ✅ FIX: Check if the exam exists (was using wrong ID)
    const examExists = await prisma.exam.findUnique({
      where: { id: parsedExamId }, // Changed from parsedCourseId
    });

    if (!examExists) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // ✅ FIX: Check if the course exists (was missing)
    const courseExists = await prisma.course.findUnique({
      where: { id: parsedCourseId },
    });

    if (!courseExists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // ✅ FIX: Verify the exam belongs to the course (optional but recommended)
    if (examExists.courseId !== parsedCourseId) {
      return res.status(400).json({ message: 'Exam does not belong to the specified course' });
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

    // ✅ FIX: Connect students to BOTH exam AND course
    await Promise.all([
      // Connect to exam
      prisma.exam.update({
        where: { id: parsedExamId },
        data: {
          students: {
            connect: studentIds.map(id => ({ id })),
          },
        },
      }),
      // Connect to course (THIS WAS MISSING!)
      prisma.course.update({
        where: { id: parsedCourseId },
        data: {
          students: {
            connect: studentIds.map(id => ({ id })),
          },
        },
      }),
    ]);

    res.status(200).json({
      message: `${validCreatedStudents.length} students registered successfully for both course and exam!`,
      students: validCreatedStudents,
      examinerId,
    });
  } catch (err) {
    console.error('Error occurred:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Failed to register students', error: err.message });
  }
};



exports.deleteStudent=async(req,res)=>{
  const studentId =parseInt(req.params.studentId)

  try{
    //Check if the student exits 
    const student =await prisma.student.findUnique({
      where : { id: studentId}
    })

      if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get the user ID from the JWT token to verify authorization
    const requestUserId = parseInt(req.user.userId); // Assuming you have auth middleware
    

        // You might need to adjust this logic based on your specific authorization rules
        /*
    const requesterRole = req.user.role;
    if (requesterRole !== 'admin' && requesterRole !== 'instructor') {
      return res.status(403).json({ error: 'Not authorized to delete students' });
    }
    
    */
   await prisma.student.delete({
    where: { id:studentId}
   })

   res.status(200).json({ message : 'Student deleted successfully '})


  }catch(error){
      console.error('Student deletion error:', error);
    res.status(500).json({
      error: 'Error deleting student',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}


exports.createStudent=async(req,res)=>{

  try{
     const { matricNo, firstName, lastName, examinerId } = req.body;

      // Basic validation
    if (!matricNo || !firstName || !lastName || !examinerId) {
      return res.status(400).json({ 
        error: 'All fields are required: matricNo, firstName, lastName, examinerId' 
      });
    }

       // Validate matriculation number format (4-10 digits)
    if (!/^\d{4,10}$/.test(matricNo)) {
      return res.status(400).json({ 
        error: 'Matriculation Number should be between 4 and 10 digits' 
      });
    }

   // Check if student with this matric number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { matricNo }
    });


       if (existingStudent) {
      return res.status(400).json({ 
        error: 'Student with this matriculation number already exists' 
      });
    }

    
    // Verify examiner exists
    const examiner = await prisma.user.findUnique({
      where: { id: parseInt(examinerId) }
    });

        if (!examiner) {
      return res.status(400).json({ 
        error: 'Examiner not found' 
      });
    }


    //create new student 
    const newStudent = await prisma.student.create({
      data:{
        matricNo,
        firstName,
        lastName,
        examinerId:parseInt(examinerId)
      },
      include:{
        examiner:{
          select:{
            id:true,
            firstName:true,
            lastName:true,
            email:true
          }
        }
      }
    });

    res.status(201).json({
      message:'Student created successfully',
      student:newStudent
    })

  }catch(error){
     console.error('Error creating student:', error);

        // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Student with this matriculation number already exists' 
      });
    }

    res.status(500).json({
      error:'Internal server error'
    })
  }
}


// Get all students (optional - for listing)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      students,
      count: students.length
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get student by matric number (optional - for searching)
exports.getStudentByMatric = async (req, res) => {
  try {
    const { matricNo } = req.params;

    const student = await prisma.student.findUnique({
      where: { matricNo },
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        exams: true
      }
    });

    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found' 
      });
    }

    res.status(200).json({ student });

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

