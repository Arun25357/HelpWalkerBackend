const express = require('express');
const Chat = require('../models/chat');
const router = express.Router();

// ดึงแชททั้งหมดของผู้ใช้
router.get('/:userId', async (req, res) => {
    try {
        const chats = await Chat.find({
            $or: [{ user1: req.params.userId }, { user2: req.params.userId }]
        });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ส่งข้อความใหม่
router.post('/send', async (req, res) => {
    const { chatId, sender, text } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        chat.messages.push({ sender, text });
        await chat.save();

        res.json({ success: true, message: 'Message sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
