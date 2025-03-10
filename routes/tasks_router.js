const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Middleware to check token
const checkToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Create a new task
router.post('/add-tasks', checkToken, async (req, res) => {
    const { title, description, acceptedBy, status } = req.body;

    try {
        const user = await User.findById(req.user.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        const newTask = new Task({
            title,
            description,
            createdBy: req.user.user_id,
            acceptedBy,
            status,
        });

        const savedTask = await newTask.save();
        return res.status(201).json({ success: true, message: 'Task created successfully', task: savedTask });

    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch tasks by user ID
router.get('/user-tasks/:userId', checkToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const tasks = await Task.find({ createdBy: userId });
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ success: false, message: 'No tasks found for this user' });
        }
        res.status(200).json({ success: true, tasks });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Get all tasks
router.get('/get-allTasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).send(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Get a single task by ID
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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


// Accept a task
router.post('/accept-task/:id', checkToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.acceptedBy) {
            return res.status(400).json({ success: false, message: 'Task already accepted' });
        }

        task.acceptedBy = req.user.user_id;
        const updatedTask = await task.save();

        res.status(200).json({ success: true, message: 'Task accepted successfully', task: updatedTask });
    } catch (err) {
        console.error('Error accepting task:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Accept all tasks
router.post('/accept-task/all', checkToken, async (req, res) => {
    try {
        const tasks = await Task.find({ acceptedBy: null });
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ success: false, message: 'No tasks available to accept' });
        }

        const updatedTasks = await Promise.all(tasks.map(async (task) => {
            task.acceptedBy = req.user.user_id;
            return await task.save();
        }));

        res.status(200).json({ success: true, message: 'All tasks accepted successfully', tasks: updatedTasks });
    } catch (err) {
        console.error('Error accepting all tasks:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;

