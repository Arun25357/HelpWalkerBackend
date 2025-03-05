const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Register a new user
router.post('/register', async (req, res) => {
    const { user_name, user_email, user_password, user_phone, user_address } = req.body;
    console.log('Request body:', req.body);
    
    if (!user_name || !user_email || !user_password || !user_phone || !user_address) {
        return res.status(400).send('All fields are required');
    }

    const newUser = new User({ user_name, user_email, user_password, user_phone, user_address });
    try {
        const savedUser = await newUser.save();
        res.status(201).send(savedUser);
    } catch (err) {
        console.error('Error during registration:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).send(`Validation Error: ${err.message}`);
        }
        if (err.code === 11000) {
            return res.status(400).send('Email already exists');
        }
        res.status(500).send('Internal Server Error');
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { user_email, user_password } = req.body;
    if (!user_email || !user_password) {
        return res.status(400).send('Email and password are required');
    }
    try {
        const user = await User.findOne({ user_email });
        if (!user) {
            return res.status(401).send('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(user_password, user.user_password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        // Generate the JWT token
        const token = jwt.sign(
            {
                user_id: user._id,           // user id
                email: user.user_email,     // user email
                phone: user.user_phone,     // user phone (optional)
                address: user.user_address, // user address (optional)
            },
            process.env.JWT_SECRET,  // Secret key (ensure it's defined in .env)
            { expiresIn: '3h' } // Token expiration time (optional)
        );

        // Send response with user data and token
        res.status(200).json({
            user: {
                _id: user._id,
                user_email: user.user_email,
                user_phone: user.user_phone,
                user_address: user.user_address,
            },
            token,  // Include the token in the response
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


// Logout a user
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to logout');
        }
        res.status(200).send('Logged out successfully');
    });
});


module.exports = router;
