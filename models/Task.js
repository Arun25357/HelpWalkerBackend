const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    address: { type: String, required: true }, // เพิ่มฟิลด์ที่อยู่
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    reward: { type: String }, // เพิ่มของตอบแทน (ถ้ามี)
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
