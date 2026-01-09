const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('@database'); // Import prisma client
const nodemailer = require('nodemailer'); // To send emails
const crypto = require('crypto'); // For generating tokens
require('dotenv').config();
//const tokenUtils=require('../../utils/auth')
const tokenUtils = require('@utils/auth')


exports.register = async (req, res) => {
  const { username, email, password, firstName } = req.body;

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

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        role: 'examiner',
      },
    });

    // Generate tokens
    const tokens = tokenUtils.generateTokens(newUser);

    // ✅ Set ACCESS token as HTTP-only cookie
    res.cookie('admin_token', tokens.token, { // tokens.token = access token
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // ✅ Set REFRESH token as HTTP-only cookie
    res.cookie('admin_refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // ✅ Respond WITHOUT token in JSON
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      // NO token property here!
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};


 exports.login = async(req,res) => {
  const { email, password } = req.body;
  try{
    console.log('\n=== LOGIN DEBUG START ===');
    console.log('Login attempt for email:', email);

    const user = await prisma.user.findFirst({
      where:{email},
    });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    console.log('User found:', { 
      id: user.id, 
      email: user.email,
      role: user.role 
    });

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message:' Invalid credentials'});
    }

    console.log('✅ Password correct, generating tokens...');
    
    const tokens = await tokenUtils.generateTokens(user);
    console.log('Tokens generated:', {
      accessTokenLength: tokens.accessToken?.length,
      refreshTokenLength: tokens.refreshToken?.length
    });

    // Decode token to see what's in it
    const decodedAccess = jwt.decode(tokens.accessToken);
    console.log('Access token payload:', decodedAccess);

    // Set cookies
    res.cookie('admin_token', tokens.accessToken,{
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:'strict',
      maxAge:1 * 60 * 60 * 1000
    });

    res.cookie('admin_refreshToken', tokens.refreshToken,{
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:'strict',
      maxAge: 2 * 24 * 60 * 60 * 1000
    });

    console.log('✅ Cookies set successfully');
    console.log('=== LOGIN DEBUG END ===\n');

    res.json({
      user:{
        id:user.userId,
        username:user.username,
        role:user.role
      }
    });

  }catch(err){
    console.error('❌ Login error:', err);
    res.status(500).json({ message:'Login failed', error: err.message });
  }
}


exports.refreshToken = async (req, res) => {
  try {
    // 1. Get refresh token from cookie (use correct cookie name)
    const refreshToken = req.cookies.admin_refreshToken; // Changed from 'refreshToken'
    if (!refreshToken) throw new Error('No refresh token provided');
    
    // 2. Verify refresh token (use tokenUtils method)
    const decoded = tokenUtils.verifyRefreshToken(refreshToken); // Fixed: tokenUtils.
    
    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
      }
    });
    
    if (!user) throw new Error('User not found');
    
    // 4. Generate new tokens
    const tokens = tokenUtils.generateTokens(user);
    
    // 5. Update ACCESS token cookie (admin_token - 15min)
    res.cookie('admin_token', tokens.token, { // tokens.token = access token
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    // 6. Update REFRESH token cookie (admin_refreshToken - 7 days)
    res.cookie('admin_refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // 7. Return user data only (NO token in JSON)
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
      // NO token property here!
    });
    
  } catch (error) {
    // Clear both cookies on error
    res.clearCookie('admin_token');
    res.clearCookie('admin_refreshToken');
    res.status(401).json({ message: error.message });
  }
};

exports.logout = (req,res) =>{
  //Clear the cookies
  res.clearCookie('admin_token');
  res.clearCookie('admin_refreshToken');

    // Optionally clear other related cookies
  res.clearCookie('connect.sid'); // If using express-session
  res.json({ 
    message: 'Logged out successfully',
    loggedOut: true 
  });
}

// Function to send email for password reset
exports.sendResetEmail = async (email, token) => {
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


exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body; // Remove email

  try {
    // Get user from authenticated request (from middleware)
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }, // From authenticate() middleware
    });

    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    // Hash and update new password
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