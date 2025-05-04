const jwt = require('jsonwebtoken');



exports.authenticate = (req, res, next) => {
  // 1. Get and validate Authorization header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // 2. Extract token (more robust check)
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid Authorization header format' });
  }
  const token = tokenParts[1];

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // Changed to JWT_ACCESS_SECRET
    
    // 4. Attach user data (with selective fields)
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
      // Don't attach sensitive fields!
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

