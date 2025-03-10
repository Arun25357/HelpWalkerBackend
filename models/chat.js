const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // เก็บ user ทั้งสองคน
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
            read: { type: Boolean, default: false }
        }
    ]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
