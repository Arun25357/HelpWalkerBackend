const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this line
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/chat'); // เพิ่มการ import Chat model

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
router.get('/tasks/accepted', checkToken, async (req, res) => {
    const { createdBy } = req.query;

    try {
        const tasks = await Task.find({ createdBy, status: 'accepted' });
        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error fetching accepted tasks:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Create a new task (รวมโค้ดนี้จากที่แรก)
router.post('/add-tasks', checkToken, async (req, res) => {
    const { title, description, createdBy, reward, address, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'ต้องระบุพิกัด latitude และ longitude' });
    }

    try {
        const user = await User.findById(req.user.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newTask = new Task({
            title,
            description,
            createdBy: req.user.user_id,  // กำหนด createdBy จากข้อมูล user ที่เข้ามา
            reward,
            address,
            latitude,
            longitude,
            status: 'Pending'  // ตั้งค่า default เป็น 'Pending'
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
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.acceptedBy) {
            return res.status(400).json({ success: false, message: 'Task already accepted' });
        }

        task.acceptedBy = req.user.user_id;
        await task.save();

        // 📌 สร้างห้องแชทใหม่
        const newChat = new Chat({
            taskId: task._id,
            participants: [task.createdBy, req.user.user_id],
            messages: []
        });
        await newChat.save();

        res.status(200).json({ success: true, message: 'Task accepted and chat created', chatId: newChat._id });
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
