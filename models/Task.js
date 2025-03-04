const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: String,
    title: String,
    description: String,
    createdBy: String,
    acceptedBy: String,
    status: {
        type: Number,
        enum: [0, 1],
        default: 0
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

