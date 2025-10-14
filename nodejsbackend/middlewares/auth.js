

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User/Examiner Authentication (for regular users with roles)
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid Authorization header format' });
  }
  const token = tokenParts[1];

  try {
    // For regular users - uses JWT_ACCESS_SECRET
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.name);
    
    const message = err.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';
      
    res.status(401).json({
      message,
      error: err.name
    });
  }
};

// Student Authentication (separate system for students)
const studentAuthenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
   // const authHeader = req.headers["authorization"];
  const tokenA = authHeader && authHeader.split(" ")[1];

  if (!tokenA) {
    console.error("❌ No token provided");
    return res.status(401).json({ message: "Token missing" });
  }


  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid Authorization header format' });
  }
  const token = tokenParts[1];

  try {
    // For students - uses JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET );
     // 👇 Debug expiry time
    console.log("Student token expires at:", new Date(decoded.exp * 1000));
    console.log("Current time:", new Date());
    console.log("✅ Token verified:", {
    studentId: decoded.studentId,
    exp: new Date(decoded.exp * 1000).toISOString()
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
      return res.status(401).json({ message: 'Invalid or inactive student account' });
    }

    // Attach student data (NOT user data)
    req.student = {
      studentId: decoded.studentId,
      matricNo: decoded.matricNo || student.matricNo,
      firstName: student.firstName,
      lastName: student.lastName
    };
    
    next();
  } catch (err) {
    console.error('Student JWT Verification Error:', err.name);
      console.error("❌ JWT verification failed:", {
    reason: err.message,
    tokenStart: token?.slice(0, 15),
    tokenEnd: token?.slice(-10),
    expectedSecret: process.env.JWT_SECRET ? "set" : "missing"
  });
    const message = err.name === 'TokenExpiredError' ? 'Student token expired' : 'Invalid student token';
    res.status(401).json({
      message,
      error: err.name
    });
  }
};

// Examiner Only - checks req.user.role (from authenticate middleware)
const examinerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'examiner') {
    return res.status(403).json({ error: 'Examiner access required' });
  }
  next();
};

// Student Only - checks req.student (from studentAuthenticate middleware)
const studentOnly = (req, res, next) => {
  if (!req.student || !req.student.studentId) {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};

// Export all functions
module.exports = {
  authenticate,
  studentAuthenticate,
  examinerOnly,
  studentOnly
};