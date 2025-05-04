const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../database'); // Import prisma client
const nodemailer = require('nodemailer'); // To send emails
const crypto = require('crypto'); // For generating tokens
require('dotenv').config();

//const { generateToken} =require('../utils/auth');
//const { generateTokens,verifyRefreshToken} =require('../utils/auth')
const tokenUtils=require('../utils/auth')



// Register function

exports.register = async (req, res) => {
  const { username, email, password, firstName } = req.body;  // Include firstName as optional

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required!' });
    }

    // Check if the username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) return res.status(400).json({ message: 'Username or Email is already taken' });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with optional firstName field
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,  // Set firstName to null if not provided
        role: 'examiner',  // Assuming role defaults to 'student'
      },
    });

    // Generate the JWT token for the user
    //const token = generateToken(newUser); // Generate the token right after user creation
    const tokens=tokenUtils.generateTokens(newUser);

    // Remove password from the response
    const { password: _, ...userWithoutPassword } = newUser;

    // Respond with user details excluding the password and include the token
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
     // token, // Include the token in the response
      token:tokens.accesToken,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};


// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
   // const token = generateToken(user);
   const tokens=tokenUtils.generateTokens(user);
   
   //Setting refresh token as HTTP-ONLY cookie 
   res.cookie('refreshToken',tokens.refreshToken,{
    httpOnly:true,
    secure:process.env.NODE_ENV ==='production',
    sameSite:'strict', 
    maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days

   })


    //res.json({ token });
    res.json({
      token:tokens.token,
      user:{
        id:user.id,
        username:user.username,
        role:user.role
      }
    })

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};


//Refresh tokens 
exports.refreshToken = async (req, res) => {
  try {
    // 1. Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new Error('No refresh token provided');
    
    // 2. Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
       // isActive: true  // Example of additional security check
      }
    });


    
    if (!user) throw new Error('User not found');
    //if (!user.isActive) throw new Error('User account is disabled');
    
    
    // 4. Generate new tokens
    const tokens = tokenUtils.generateTokens(user);
    
    // 5. Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
   // res.json({ accessToken: tokens.accessToken });
   res.json({ 
    token:tokens.token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }

   });
    
  } catch (error) {
    //Clear invalid refresh token 
    res.clearCookie('refreshToken');
    res.status(401).json({ message: error.message });
  }
};







// Logout function
exports.logout = (req, res) => {
  // Token removal handled on the frontend; nothing to process here.
  res.json({ message: 'Logged out successfully' });
};

// Function to send email for password reset
const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('Failed to send reset email');
  }
};

// Forgot password function
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Generate a token for password reset
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour from now
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiration: user.resetTokenExpiration },
    });

    // Send email with the reset token
    await sendResetEmail(email, token);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Forgot password failed' });
  }
};

// Change password function
exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Password change failed' });
  }
};
