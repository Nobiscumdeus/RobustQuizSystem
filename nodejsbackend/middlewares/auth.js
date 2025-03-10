const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token

  console.log('Authorization Header:', req.header('Authorization')); // Log the full Authorization header

  if (!token) {
    console.error('No token provided in Authorization header.');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode JWT using secret key
    console.log('Decoded Token:', decoded); // Log the decoded token

    req.user = decoded; // Attach decoded user data to the request object

    console.log('User from JWT:', req.user); // Log req.user here after decoding the token

    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error('Error verifying token:', err); // Log the error encountered during token verification
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};
