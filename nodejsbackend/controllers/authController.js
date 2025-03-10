const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../database'); // Import prisma client
const nodemailer = require('nodemailer'); // To send emails
const crypto = require('crypto'); // For generating tokens
require('dotenv').config();

// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username,role:user.role }, // Include only the essential fields
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
};

// Register function
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
    const token = generateToken(newUser); // Generate the token right after user creation

    // Remove password from the response
    const { password: _, ...userWithoutPassword } = newUser;

    // Respond with user details excluding the password and include the token
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token, // Include the token in the response
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
    const token = generateToken(user);
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
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
