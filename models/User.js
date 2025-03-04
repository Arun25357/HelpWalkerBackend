const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true,
        unique: true
    },
    user_password: {
        type: String,
        required: true
    },
    user_phone: {
        type: Number,
        required: true
    },
    user_address: {
        type: String,
        required: true
    }
    // ...other fields...
})

const User = mongoose.model('User', userSchema)

module.exports = User