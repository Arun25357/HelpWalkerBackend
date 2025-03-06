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

// Create a new task
router.post('/add-tasks', async (req, res) => {
    const { title, description, acceptedBy, status } = req.body;

    // ดึง token จาก Header
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        // ถอดรหัส token
        const decoded = verifyToken(token);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        console.log('Decoded Token:', decoded);

        // ตรวจสอบว่า user มีอยู่ในระบบ
        const user = await User.findById(decoded.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        // สร้าง Task ใหม่ (เปลี่ยน user_id → createdBy)
        const newTask = new Task({
            title,
            description,
            createdBy: decoded.user_id, // ✅ ใช้ createdBy แทน user_id
            acceptedBy,
            status,
        });

        // บันทึกลงฐานข้อมูล
        const savedTask = await newTask.save();

        return res.status(201).json({ success: true, message: 'Task created successfully', task: savedTask });

    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch tasks by user ID
router.get('/user-tasks/:userId', async (req, res) => {
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

module.exports = router;
