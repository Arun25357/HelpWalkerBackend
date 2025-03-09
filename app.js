require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ Could not connect to MongoDB', err));

// Import Routes
const indexRouter = require('./routes/index');
const tasksRouter = require('./routes/tasks_router');
const usersRouter = require('./routes/user_router');
const authRouter = require('./routes/auth_router');
const chatRouter = require('./routes/chat_router');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use(cors({
  origin: process.env.API_URL ? process.env.API_URL.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);
app.use('/chats', chatRouter);

// WebSocket - Handle Chat
const Chat = require('./models/chat');
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`📌 User joined chat: ${chatId}`);
    });

    socket.on('sendMessage', async ({ chatId, sender, text }) => {
        try {
            const chat = await Chat.findById(chatId);
            if (!chat) return;

            const newMessage = { sender, text, timestamp: new Date() };
            chat.messages.push(newMessage);
            await chat.save();

            io.to(chatId).emit('receiveMessage', newMessage);
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ message: err.message, error: req.app.get('env') === 'development' ? err : {} });
});

// Start the Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

module.exports = { app, io };
