const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const session = require('express-session');
const userRoutes = require('./routes/userRoute');
const authRoutes = require('./routes/authRoutes');
const companyRouter= require('./routes/companyRouter');
const departmentRouter= require('./routes/departmentRouter');
const addressRouter= require('./routes/addressRouter');
const positionRouter= require('./routes/positionRouter');
const roleRouter= require('./routes/roleRouter');
const employmentStatusRouter= require('./routes/employmentStatusRouter');
const userProfileRouter= require('./routes/userProfileRouter');
const translateRouter= require('./routes/translateRouter');
const scheduleRouter= require('./routes/scheduleRouter');
const shiftRouter= require('./routes/shiftRouter');
const timeTrackingRouter= require('./routes/timeTrackingRouter');
const notificationsRoutes = require('./routes/notificationsRouter');
const cookieRouter = require('./routes/cookieRouter');
const timezoneMiddleware = require('./middlewares/timezoneMiddleware');
const cookieParser = require('cookie-parser');
const path = require('path');
const moment = require('moment-timezone');
const bodyParser = require('body-parser');
const Shift = require('./models/Shift');
const Userprofile = require('./models/Userprofile');



// Connect to database
connectDB();
//createRoles();

const app = express();

// Middleware
const server = http.createServer(app);
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add both your client and server origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
const io = socketIo(server, {
  cors: corsOptions,
});
app.use(bodyParser.json());
app.use(express.json());
app.use(cors(corsOptions));
app.use(session({
  secret:process.env.SESSION_SECRET ,
  secure: process.env.NODE_ENV === 'production',
  resave: false,
  saveUninitialized: true,
  cookie:{maxAge:1000 * 60 * 60}
}));
app.use(cookieParser());
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/time-tracking', timeTrackingRouter);
app.use('/api/cookie', cookieRouter);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('subscribe', ({userId,userPreferences}) => {
    socket.join(userId);
    const req = { body: { userId,userPreferences }, io};
    updateActiveTimes(req, io); // Initial update
    setupUpdateInterval(req, io); // Set up recurring updates
  });

  socket.on('unsubscribe', (userId) => {
    socket.leave(userId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // You might want to clear the interval here if you store it
  });
});



// Routes
app.use(timezoneMiddleware);


app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/translations', translateRouter );
app.use('/api/company', companyRouter);
app.use('/api/department', departmentRouter);
app.use('/api/address', addressRouter);
app.use('/api/position', positionRouter);
app.use('/api/role', roleRouter);
app.use('/api/employmentStatus', employmentStatusRouter);
app.use('/api/UserProfile', userProfileRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/shift', shiftRouter);
app.use('/api/notifications', notificationsRoutes);


const updateActiveTimes = async (req, io) => {
  try {
    
    const  timezone = JSON.parse(req.body.userPreferences).timezone;
    const localTime = moment().tz(timezone);
    const user = await Userprofile.findOne({ user: req.body.userId });
    const today = localTime.toDate();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const now = new Date();

    // Find active shifts for the user's department
    const activeShifts = await Shift.find({
      department: user.department,
      status: 'in-progress',
    }).populate('userprofile');

    // Find today's shifts for the user's department
    const todayShifts = await Shift.find({
      department: user.department,
      scheduledStartTime: { $gte: today, $lt: tomorrow },
      status: 'scheduled',
    }).populate('userprofile');

    // Process each active shift
    const updatedActiveShifts = await Promise.all(
      activeShifts.map(async (shift) => {
        const elapsedTime = (localTime.toDate() - shift.actualStartTime) / 1000; // in seconds
        shift.duration = elapsedTime / 3600; // convert to hours
        shift.pay =
          shift.userprofile && shift.userprofile.hourlyRate
            ? (shift.duration * shift.userprofile.hourlyRate).toFixed(2)
            : 0;

        // Calculate time left in shift
        const shiftTimeleft = (shift.scheduledEndTime - now) / 3600000; // in hours

        // Check if on break
        const lastBreak = shift.breaks[shift.breaks.length - 1];
        const isOnBreak = lastBreak && !lastBreak.endTime;

        // Save updated shift
        await shift.save();

        return {
          _id: shift._id,
          userprofile: {
            _id: shift.userprofile._id,
            firstName: shift.userprofile.firstName,
            lastName: shift.userprofile.lastName,
            avatar: shift.userprofile.avatar,
          },
          duration: shift.duration,
          pay: shift.pay,
          shiftTimeleft,
          isOnBreak,
          lastClockIn: shift.actualStartTime,
        };
      })
    );

    // Process each today's shift
    const updatedTodayShifts = await Promise.all(
      todayShifts.map(async (shift) => {
        const breakDuration = shift.breaks.reduce((total, breakObj) => total + breakObj.duration, 0);
        return {
          _id: shift._id,
          userprofile: {
            _id: shift.userprofile._id,
            firstName: shift.userprofile.firstName,
            lastName: shift.userprofile.lastName,
            avatar: shift.userprofile.avatar,
          },
          scheduledStartTime: shift.scheduledStartTime,
          scheduledEndTime: shift.scheduledEndTime,
          duration: shift.duration,
          breakDuration,
        };
      })
    );
    io.to(req.body.userId).emit('shiftUpdate', { activeShifts: updatedActiveShifts, todayShifts: updatedTodayShifts });
    return { activeShifts: updatedActiveShifts, todayShifts: updatedTodayShifts };
  } catch (error) {
    console.error('Error in updateActiveTimes:', error);
    throw error;
  }
};

const setupUpdateInterval = (req, io) => {
  setInterval(() => updateActiveTimes(req, io), 5000);
};


app.use(express.static(path.join(__dirname, '/client/dist')));
app.get('*', (req, res, next) => {
  const indexPath = path.join(__dirname, '/client/dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      next(err);
    }
  });
});

// Error handling middleware
app.use(errorHandler);


// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
