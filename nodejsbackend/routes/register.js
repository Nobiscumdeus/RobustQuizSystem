const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Adjust the path to your User model
const router = express.Router();

const app = express();

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password, email, role = 'user' } = req.body;  // Default role is 'user'

    // Input validation
    if (!username || !password || !email) {
        return res.status(400).json({ errors: { general: 'Username, password, and email are required.' } });
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ errors: { username: 'Username already taken. Please choose a different one.' } });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ errors: { email: 'Email already in use. Please use a different one.' } });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database, including the role
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            role, // Assign the role from the request (or default to 'user')
        });

        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ errors: { general: 'Error creating user. Please try again later.' } });
    }
});

module.exports = router;
