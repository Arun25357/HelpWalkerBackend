const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true }, // เปลี่ยนเป็น ObjectId
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // เปลี่ยนเป็น ObjectId
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' }, // เพิ่มประเภทข้อความ
            read: { type: Boolean, default: false } // เพิ่มสถานะอ่าน
        }
    ]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
