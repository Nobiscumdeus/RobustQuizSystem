//import prisma from '../database'
const { prisma } = require('@database'); // Import prisma client
//const { prisma } = require('../database'); // Import prisma client



exports.registerStudent = async (req, res) => {
  const { students, courseId, examId } = req.body;
  const examinerId = req.user.userId;

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
      return res.status(403).json({ message: 'Not authorized to register students' });
    }

    // Check if the exam exists
    const examExists = await prisma.exam.findUnique({
      where: { id: parsedExamId },
    });

    if (!examExists) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if the course exists
    const courseExists = await prisma.course.findUnique({
      where: { id: parsedCourseId },
    });

    if (!courseExists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create students
    const createdStudents = await Promise.all(
      students.map(async (student) => {
        const existingStudent = await prisma.student.findUnique({
          where: { matricNo: student.matricNo },
        });

        if (existingStudent) {
          console.log(`Student with matricNo ${student.matricNo} already exists`);
          return existingStudent; // Return existing student instead of null
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

    const validStudents = createdStudents.filter(student => student !== null);

    if (validStudents.length === 0) {
      return res.status(400).json({ message: 'No students to register' });
    }

    const studentIds = validStudents.map(student => student.id);

    // ✅ FIX: Connect students to both exam and course using proper relationships
    await Promise.all([
      // Connect to exam (existing relationship works)
      prisma.exam.update({
        where: { id: parsedExamId },
        data: {
          students: {
            connect: studentIds.map(id => ({ id })),
          },
        },
      }),
      
      // ✅ FIX: Connect to course using the new CourseStudent join table
      ...studentIds.map(studentId => 
        prisma.courseStudent.upsert({
          where: {
            courseId_studentId: {
              courseId: parsedCourseId,
              studentId: studentId,
            },
          },
          update: {}, // Do nothing if already exists
          create: {
            courseId: parsedCourseId,
            studentId: studentId,
          },
        })
      ),
    ]);

    res.status(200).json({
      message: `${validStudents.length} students registered successfully for both course and exam!`,
      students: validStudents,
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


exports.getStudentById = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const studentIdInt = parseInt(studentId);
    
    if (isNaN(studentIdInt)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // Find the student with proper relationships
    const student = await prisma.student.findUnique({
      where: { id: studentIdInt },
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        // ✅ FIX: Use courseStudents for proper many-to-many relationship
        courseStudents: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
                semester: true,
                creditHours: true,
                isActive: true,
                examiner: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: {
            enrolledAt: 'desc'
          }
        },
        results: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                date: true,
                course: {
                  select: {
                    code: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        attendances: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                date: true,
                course: {
                  select: {
                    code: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        },
        // ✅ ADD: Get exam sessions for activity tracking
        examSessions: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            isActive: true,
            exam: {
              select: {
                title: true,
                course: {
                  select: {
                    code: true
                  }
                }
              }
            }
          },
          orderBy: {
            startedAt: 'desc'
          },
          take: 5
        }
      }
    });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if requesting examiner has access to this student
    if (student.examinerId !== requestingExaminerId) {
      return res.status(403).json({
        message: 'Access denied: You are not authorized to view this student'
      });
    }

    // ✅ Transform the data for easier frontend consumption
    const transformedStudent = {
      ...student,
      // Transform courseStudents to courses for backward compatibility
      courses: student.courseStudents.map(cs => ({
        ...cs.course,
        enrolledAt: cs.enrolledAt
      })),
      // Add computed statistics
      stats: {
        totalCourses: student.courseStudents.length,
        totalExams: student.results.length,
        averageScore: student.results.length > 0 
          ? (student.results.reduce((sum, result) => sum + result.score, 0) / student.results.length).toFixed(2)
          : 0,
        recentActivity: student.examSessions.filter(session => session.isActive).length > 0 ? 'Active' : 'Inactive'
      }
    };

    // Remove the courseStudents from response to avoid confusion
    delete transformedStudent.courseStudents;

    // Return the student data
    res.status(200).json({
      message: 'Student retrieved successfully',
      student: transformedStudent
    });

  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({
      message: 'Failed to fetch student',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getStudentForEdit = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Find the student with minimal data needed for editing
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: {
        id: true,
        matricNo: true,
        firstName: true,
        lastName: true,
        examinerId: true,
        email: true,
        phone: true,
        department: true,
        level: true,
        isActive: true
      }
    });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if requesting examiner has access to this student
    if (student.examinerId !== requestingExaminerId) {
      return res.status(403).json({ 
        message: 'Access denied: You are not authorized to edit this student' 
      });
    }

    // Return the student data for editing
    res.status(200).json({
      message: 'Student data retrieved for editing',
      student
    });

  } catch (err) {
    console.error('Error fetching student for edit:', err);
    res.status(500).json({
      message: 'Failed to fetch student data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const requestingExaminerId = req.user.userId;

  console.log('Received update payload:', req.body);

  try {
    // Validate parameters
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Check if student exists and belongs to examiner
    const existingStudent = await prisma.student.findUnique({
      where: {
        id: parseInt(studentId),
        examinerId: parseInt(requestingExaminerId)
      }
    });

    if (!existingStudent) {
      return res.status(404).json({ 
        message: 'Student not found or not owned by this examiner' 
      });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'matricNo'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        requiredFields
      });
    }

    // Check if matricNo is being changed and if so, ensure it's unique
    if (req.body.matricNo !== existingStudent.matricNo) {
      const existingMatricNo = await prisma.student.findUnique({
        where: { matricNo: req.body.matricNo }
      });

      if (existingMatricNo) {
        return res.status(400).json({
          message: 'Matric number already exists',
          field: 'matricNo'
        });
      }
    }

    // Prepare update data with defaults
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      matricNo: req.body.matricNo,
      email: req.body.email || null,
      phone: req.body.phone || null,
      department: req.body.department || null,
      level: req.body.level || null,
      isActive: req.body.isActive !== false,
      lastActive: req.body.lastActive || existingStudent.lastActive
    };

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(studentId) },
      data: updateData,
      include: {
        examiner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        courses: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (err) {
    console.error('Error updating student:', {
      message: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({
      message: 'Failed to update student',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      validationErrors: err.meta // Prisma validation errors
    });
  }
};



exports.getStudentsByExaminer = async (req, res) => {
  const examinerId = req.user.userId;
  
  try {
    if (!examinerId) {
      return res.status(400).json({ message: 'Examiner ID is required' });
    }
    
    // Retrieve all students associated with the examiner WITH course enrollment info
    const students = await prisma.student.findMany({
      where: {
        examinerId: parseInt(examinerId),
      },
      include: {
        courseStudents: {
          include: {
            course: true // Include course details if needed
          }
        },
        _count: {
          select: {
            courseStudents: true // This will give you the count of enrolled courses
          }
        }
      }
    });
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for this examiner' });
    }
    
    res.status(200).json({ students });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve students. Please try again.' });
  }
};



exports.getEligibleStudents=async (req,res)=>{
  const { examId } =req.params;
  const examinerId =req.user.userId


  try{
    
    const exam =await prisma.exam.findUnique({
      where:{
        id:parseInt(examId),
        examinerId:parseInt(examinerId)
      },select:{
        id:true,
        courseId:true,
        title:true
      }
    });

    if(!exam){
      return res.status(404).json({
        message:'Exam not found or you do not have permission to access it '
      })
    }
    //Get all students enrolled in the course
    const eligibleStudents =await prisma.courseStudent.findMany({
      where:{
        courseId:exam.courseId
      },include:{
        student:{
          select:{
            id:true,
            firstName:true,
            lastName:true,
             matricNo: true,
            email: true,
            phone: true,
            department: true,
            level: true,
            isActive: true,
            lastActive: true
          }
        }
      },
      orderBy:{
        enrolledAt:'desc'
      }
    });

    //Response format
    const students =eligibleStudents.map(cs=>({
      ...cs.student,
      enrolledAt:cs.enrolledAt,
      hasAttempted:false //....................Logic to check exam result will be added here later

    }));
    res.status(200).json({
      students,
      examInfo:{
        id:exam.id,
        title:exam.title,
        courseId:exam.courseId
      },
      total:students.length,
      activeStudents:students.filter(s=>s.isActive).length
    })
  }catch(err){
    console.error(err);
    res.status(500).json({
      message:'Failed to retrieve eligible students',
      error:process.env.NODE_ENV === 'development' ? err.message :undefined
    })
  }
}
