const express = require('express');
const mongoose = require('mongoose');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const Chat = require('../models/chat');

// 📌 ดึงข้อความแชททั้งหมดตาม userId
router.get('/messages/:userId', async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.params.userId })
            .populate('messages.sender', 'name email')
            .lean();

        if (!chat) return res.status(404).json({ message: 'No chat found' });

        // 📌 อัปเดตเฉพาะข้อความที่ยังไม่ได้อ่าน
        await Chat.updateOne(
            { userId: req.params.userId, "messages.read": false },
            { $set: { "messages.$[].read": true } }
        );

        res.json(chat.messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 📌 ส่งข้อความใหม่ พร้อมตรวจสอบค่าข้อมูล
router.post(
    '/messages',
    [
        body('userId').isMongoId().withMessage('Invalid userId'),
        body('sender').isMongoId().withMessage('Invalid sender'),
        body('text').notEmpty().withMessage('Message text cannot be empty'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, sender, text, messageType } = req.body;

        try {
            let chat = await Chat.findOne({ userId });

            if (!chat) {
                chat = new Chat({ userId, messages: [] });
            }

            chat.messages.push({ 
                sender, 
                text, 
                timestamp: new Date(),
                messageType: messageType || 'text'
            });

            await chat.save();

            res.status(201).json({ message: 'Message sent successfully', chat });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to send message' });
        }
    }
);

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