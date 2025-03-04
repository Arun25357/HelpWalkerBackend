const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    id: String,
    taskId: String,
    user1: String,
    user2: String,
    messages: [
        {
            sender: String,
            text: String,
            timestamp: Date
        }
    ]
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
