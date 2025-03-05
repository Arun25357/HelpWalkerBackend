const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ควรใช้ createdBy
    status: { type: String, default: 'pending' },
  
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
