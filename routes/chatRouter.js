const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');

// ดึงข้อความแชททั้งหมดตาม taskId
router.get('/messages/:taskId', async (req, res) => {
    try {
        const chat = await Chat.findOne({ taskId: req.params.taskId })
            .populate('messages.sender', 'name email') // ดึงข้อมูล sender ถ้ามี ref
            .lean(); // ลดภาระการใช้ Mongoose

        if (!chat) return res.status(404).json({ message: 'No chat found' });

        // อัปเดตสถานะว่าอ่านแล้ว
        await Chat.updateOne(
            { taskId: req.params.taskId },
            { $set: { "messages.$[].read": true } } // อัปเดตทุกข้อความเป็นอ่านแล้ว
        );

        res.json(chat.messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ส่งข้อความใหม่
router.post('/messages', async (req, res) => {
    const { taskId, sender, text, messageType } = req.body;

    // ตรวจสอบค่าที่จำเป็น
    if (!taskId || !sender || !text) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let chat = await Chat.findOne({ taskId });

        if (!chat) {
            chat = new Chat({ taskId, messages: [] });
        }

        chat.messages.push({ 
            sender, 
            text, 
            timestamp: new Date(),
            messageType: messageType || 'text' // กำหนดค่า default เป็น text
        });

        await chat.save();

        res.status(201).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// ลบข้อความแชททั้งหมดของ taskId
router.delete('/messages/:taskId', async (req, res) => {
    try {
        const chat = await Chat.findOneAndDelete({ taskId: req.params.taskId });

        if (!chat) return res.status(404).json({ message: 'No chat found' });

        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete chat' });
    }
});

module.exports = router;
