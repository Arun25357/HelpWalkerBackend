const express = require('express');
const mongoose = require('mongoose');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const Chat = require('../models/chat');

router.get('/user-chats/:userId', async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.params.userId })
            .populate('participants', 'user_name')
            .populate('taskId', 'title')
            .lean();

        res.json(chats);
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