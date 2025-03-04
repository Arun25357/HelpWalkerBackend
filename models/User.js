const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true,
        unique: true,
        index: true
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

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
    if (this.isModified('user_password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10)
            this.user_password = await bcrypt.hash(this.user_password, salt)
            next()
        } catch (err) {
            next(err)
        }
    } else {
        next()
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User