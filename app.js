var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// เชื่อมต่อ MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');  // ตรวจสอบว่าเชื่อมต่อ MongoDB สำเร็จหรือไม่
})
.catch(err => {
    console.error('Could not connect to MongoDB', err);  // ถ้าเกิดข้อผิดพลาดในการเชื่อมต่อ
});

var indexRouter = require('./routes/index');
var tasksRouter = require('./routes/tasks_router');
const users = require('./routes/user_router');
const authRouter = require('./routes/auth_router');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({
  origin: process.env.API_URL.split(','),  // ระบุแหล่งที่มาของ frontend จาก environment
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', users);
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Start the server
const PORT = process.env.PORT || 3001;  // ตั้งค่าพอร์ตให้เป็น 3001 หรือพอร์ตที่กำหนดใน environment
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);  // ตรวจสอบว่าเซิร์ฟเวอร์เปิดแล้ว
});

module.exports = app;