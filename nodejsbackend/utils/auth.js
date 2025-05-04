const jwt=require('jsonwebtoken')
require('dotenv').config()


/*
// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username,role:user.role }, // Include only the essential fields
    process.env.JWT_SECRET || 'your_jwt_secret',
   // { expiresIn: '2m' }
   { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN}
  );
};


const verifyToken=(token)=>{
    return jwt.verify(token,process.env.JWT_SECRET);
}

module.exports={generateToken,verifyToken}
*/


const tokenUtils = {
  // Generate access token
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
  },

  // Generate refresh token
  generateRefreshToken: (user) => {
    return jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '2d' }
    );
  },

  // Verify refresh token
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },

  // Generate both tokens (fixed the 'this' issue)
  generateTokens: (user) => {
    return {
      //accessToken: tokenUtils.generateAccessToken(user), // Changed from this to tokenUtils
      token:tokenUtils.generateAccessToken(user),
      refreshToken: tokenUtils.generateRefreshToken(user) // Changed from this to tokenUtils
    };
  }
};

module.exports = tokenUtils;