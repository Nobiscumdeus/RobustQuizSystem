const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const authenticate = (req, res, next) => {
  console.log('\n=== AUTH MIDDLEWARE DEBUG START ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('All cookies:', JSON.stringify(req.cookies, null, 2));
  
  const token = req.cookies.admin_token || req.cookies.user_token;
  console.log('Token found:', !!token);
  
  if (!token) {
    console.log('ERROR: No token found in cookies');
    return res.status(401).json({ 
      message: 'Authentication cookie missing. Please login again.' 
    });
  }

  console.log('Token length:', token.length);
  console.log('Token first 50 chars:', token.substring(0, 50) + '...');
  
  try {
    console.log('JWT_SECRET exists:', !!process.env.JWT_ACCESS_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_ACCESS_SECRET?.length);
    
    // Try to decode without verification first
    const decodedWithoutVerify = jwt.decode(token);
    console.log('Decoded token (without verify):', decodedWithoutVerify);
    
    // Now try verification
    console.log('Attempting JWT verification...');
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    console.log('✅ JWT Verification SUCCESS');
    console.log('Decoded payload:', decoded);
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    
    console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
    next();
    
  } catch (err) {
    console.error('❌ JWT Verification FAILED:', err.name);
    console.error('Error message:', err.message);
    console.error('Token that failed:', token);
    
    // Check if it's a signature issue
    if (err.message.includes('signature')) {
      console.error('SIGNATURE MISMATCH - Possible issues:');
      console.error('1. Wrong JWT secret being used');
      console.error('2. Token was tampered with');
      console.error('3. Different secret used for signing vs verifying');
    }
    
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please login again.'
      : 'Invalid authentication cookie.';
      
    res.status(401).json({
      message,
      error: err.name,
      details: err.message
    });
    
    console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
  }
};

// Student Authentication (Cookie-based)
const studentAuthenticate = async (req, res, next) => {
  // Read from cookie instead of Authorization header
  const token = req.cookies.student_token;
  
  if (!token) {
    console.error("❌ No student auth cookie found");
    return res.status(401).json({ 
      message: "Student session expired. Please login again." 
    });
  }

  try {
    // For students - uses JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debug logging
    console.log("✅ Student token verified:", {
      studentId: decoded.studentId,
      expires: new Date(decoded.exp * 1000).toISOString()
    });

    // Validate student exists and is active
    const student = await prisma.student.findUnique({
      where: { id: decoded.studentId },
      select: { 
        id: true, 
        matricNo: true, 
        isActive: true,
        firstName: true,
        lastName: true 
      }
    });

    if (!student || !student.isActive) {
      return res.status(401).json({ 
        message: 'Invalid or inactive student account' 
      });
    }

    // Attach student data
    req.student = {
      studentId: decoded.studentId,
      matricNo: decoded.matricNo || student.matricNo,
      firstName: student.firstName,
      lastName: student.lastName
    };
    
    next();
  } catch (err) {
    console.error("❌ Student JWT verification failed:", {
      reason: err.message,
      errorType: err.name,
      expectedSecret: process.env.JWT_SECRET ? "set" : "missing"
    });
    
    const message = err.name === 'TokenExpiredError' 
      ? 'Student session expired. Please login again.' 
      : 'Invalid student session.';
      
    res.status(401).json({
      message,
      error: err.name
    });
  }
};

// Examiner Only - unchanged
const examinerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'examiner') {
    return res.status(403).json({ error: 'Examiner access required' });
  }
  next();
};

// Student Only - unchanged
const studentOnly = (req, res, next) => {
  if (!req.student || !req.student.studentId) {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};

module.exports = {
  authenticate,
  studentAuthenticate,
  examinerOnly,
  studentOnly
};

