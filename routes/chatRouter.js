const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Chat = require('../models/chat');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // นำเข้ามาใช้งาน
const Task = require('../models/Task');  // นำเข้ามาใช้งาน

// Middleware to verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Middleware to check token
const checkToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // ดึง token จาก Authorization header
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;  // เก็บข้อมูลผู้ใช้ที่ได้รับการยืนยันจาก token

        // ตรวจสอบว่า user_id ที่ได้จาก token มีอยู่ในระบบหรือไม่
        const user = await User.findById(req.user.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ตรวจสอบว่า taskId ที่ส่งมามีอยู่ในฐานข้อมูลหรือไม่
        const taskId = req.params.taskId;  // ดึง taskId จากพารามิเตอร์ใน URL
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        next();  // ส่งต่อไปยัง route handler หากทุกอย่างถูกต้อง
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Example route to fetch messages for a task
router.get('/chat/messages/:taskId', checkToken, async (req, res) => {
    try {
        const chat = await Chat.findOne({ taskId: req.params.taskId })
            .populate('messages.sender', 'name email')
            .lean();
        
        if (!chat) {
            return res.status(404).json({ message: 'No chat found for this taskId' });
        }

        res.json(chat.messages);  // ส่งกลับข้อมูลข้อความที่พบ
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Route สำหรับส่งข้อความ
// ตัวอย่าง route สำหรับ POST ข้อความใหม่
router.post('/chat/messages', checkToken, async (req, res) => {
    try {
        const { userId, sender, taskId, text, messageType } = req.body;
        const newMessage = new Message({ userId, sender, taskId, text, messageType });

        await newMessage.save();

        // ส่งคืนข้อมูลที่จำเป็น
        const chat = await Chat.findOne({ taskId: taskId });
        chat.messages.push(newMessage);
        await chat.save();

        res.status(200).json({ chat });  // ส่งกลับข้อมูล chat ที่อัพเดต
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});



router.get('/user-chats/:userId', async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.params.userId })
            .populate('participants', 'user_name')
            .populate('taskId', 'title')
            .lean();


        if (!chat) return res.status(404).json({ message: 'No chat found' });

        // 📌 อัปเดตเฉพาะข้อความที่ยังไม่ได้อ่าน
        await Chat.updateOne(
            { 
                userId: req.params.userId, 
                "messages.read": false 
            },
            { 
                $set: { "messages.$[elem].read": true } 
            },
            {
                arrayFilters: [
                    { "elem.read": false } // อัปเดตเฉพาะข้อความที่มี read: false
                ]
            }
        );

        res.json(chat.messages);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/send-message', async (req, res) => {
    const { chatId, sender, text, messageType } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        chat.messages.push({ sender, text, messageType: messageType || 'text' });
        await chat.save();

        res.status(201).json({ message: 'Message sent successfully', chat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});



// 📌 ลบข้อความแชททั้งหมดของ userId
router.delete('/messages/:userId', async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.params.userId });

        if (!chat) return res.status(404).json({ message: 'No chat found' });

        await Chat.deleteOne({ userId: req.params.userId });

        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete chat' });
    }
});

module.exports = router;
