const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/User')

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send('User not found')
        }
        res.status(200).send(user)
    } catch (err) {
        res.status(500).send(err)
    }
})

// Create a new user
router.post('/', async (req, res) => {
    const { user_name, user_email, user_password, user_phone, user_address } = req.body
    if (!user_name || !user_email || !user_password || !user_phone || !user_address) {
        return res.status(400).send('All fields are required')
    }
    const newUser = new User({ user_name, user_email, user_password, user_phone, user_address })
    try {
        const savedUser = await newUser.save()
        res.status(201).send(savedUser)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send(`Validation Error: ${err.message}`)
        }
        if (err.code === 11000) {
            return res.status(400).send('Email already exists')
        }
        res.status(500).send('Internal Server Error')
    }
})

// Update a user
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!updatedUser) {
            return res.status(404).send('User not found')
        }
        res.status(200).send(updatedUser)
    } catch (err) {
        res.status(400).send(err)
    }
})

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        if (!deletedUser) {
            return res.status(404).send('User not found')
        }
        res.status(200).send('User deleted')
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router