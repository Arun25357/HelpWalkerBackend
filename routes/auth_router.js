const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcrypt');

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
        res.status(200).send(user);
    } catch (err) {
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

// Create a new task
router.post('/tasks', async (req, res) => {
    const { title, description, createdBy, acceptedBy, status } = req.body;
    if (!title || !description || !createdBy) {
        return res.status(400).send('Title, description, and createdBy are required');
    }
    try {
        const newTask = new Task({ title, description, createdBy, acceptedBy, status });
        const savedTask = await newTask.save();
        res.status(201).send(savedTask);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).send(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Get a single task by ID
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send(task);
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Update a task
router.put('/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTask) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send(updatedTask);
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send('Task deleted successfully');
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
