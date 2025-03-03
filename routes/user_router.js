const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/User')

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send(err)
    }
})

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required')
    }
    const newUser = new User({ name, email, password })
    try {
        const savedUser = await newUser.save()
        res.status(201).send(savedUser)
    } catch (err) {
        res.status(400).send(err)
    }
})

// Login a user
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user || user.password !== req.body.password) {
            return res.status(401).send('Invalid credentials')
        }
        res.status(200).send(user)
    } catch (err) {
        res.status(500).send(err)
    }
})

// Logout a user
router.post('/logout', (req, res) => {
    // Assuming you are using sessions
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to logout')
        }
        res.status(200).send('Logged out successfully')
    })
})

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
    const newUser = new User(req.body)
    try {
        const savedUser = await newUser.save()
        res.status(201).send(savedUser)
    } catch (err) {
        res.status(400).send(err)
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