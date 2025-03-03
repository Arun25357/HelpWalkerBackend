const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/User')

router.get('/', async (req, res) => {
    User.find((err, users) => {
        if (err) {
            res.status(500).send(err)
        }
        res.status(200).send(users)
    })
})