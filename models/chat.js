const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    taskId: String,
    user1: String,
    user2: String,
    messages: [
        {
            sender: String,
            text: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
