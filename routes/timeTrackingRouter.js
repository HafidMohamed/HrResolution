const express = require('express');
const Userprofile = require('../models/Userprofile');
const Shift = require('../models/Shift');
const router = express.Router();
const moment = require('moment-timezone');
const { verifyToken } = require('../utils/jwtUtils');

// Helper function to calculate shift performance
const calculateShiftPerformance = (shift, scheduledStart, scheduledEnd) => {
  const punctuality = calculatePunctualityScore(shift.actualStartTime, scheduledStart);
  const breakCompliance = calculateBreakComplianceScore(shift.breaks, shift.break);
  const hoursCompleted = calculateHoursCompletedScore(shift.duration, 
    (scheduledEnd - scheduledStart) / (1000 * 60 * 60));

  return {
    punctuality,
    breakCompliance,
    hoursCompleted,
    overall: ((punctuality + breakCompliance + hoursCompleted) / 3).toFixed(2)
  };
};

// Helper functions for performance calculations
const calculatePunctualityScore = (actualStart, scheduledStart) => {
  const diffMinutes = Math.abs(moment(actualStart).diff(moment(scheduledStart), 'minutes'));
  if (diffMinutes <= 5) return 5;
  if (diffMinutes <= 10) return 4;
  if (diffMinutes <= 15) return 3;
  if (diffMinutes <= 20) return 2;
  return 1;
};

const calculateBreakComplianceScore = (breaks, totalBreakTime) => {
  if (!breaks || breaks.length === 0) return 5;
  const totalBreakMinutes = breaks.reduce((sum, breakItem) => {
    return sum + (breakItem.duration || 0);
  }, 0);
  
  const compliance = Math.abs(totalBreakMinutes - totalBreakTime);
  if (compliance <= 5) return 5;
  if (compliance <= 10) return 4;
  if (compliance <= 15) return 3;
  if (compliance <= 20) return 2;
  return 1;
};

const calculateHoursCompletedScore = (actual, expected) => {
  const completion = (actual / expected) * 100;
  if (completion >= 98) return 5;
  if (completion >= 95) return 4;
  if (completion >= 90) return 3;
  if (completion >= 85) return 2;
  return 1;
};

// Updated clock-in route
router.post('/clock-in', async (req, res) => {
  try {
    const { authID, location } = req.body;
    const userProfile = await Userprofile.findOne({ authID })
      .select('firstName lastName upcomingShift');

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userProfile.isClockingIn) {
      return res.status(400).json({ message: 'User is already clocked in' });
    }

    const userTimezone = req.cookies.userPreferences?.timezone || 'UTC';
    const now = moment().tz(userTimezone);
    const todayStart = now.clone().startOf('day');
    const todayEnd = now.clone().endOf('day');

    let shift = await Shift.findOne({
      userprofile: userProfile._id,
      scheduledStartTime: {
        $gte: todayStart.toDate(),
        $lt: todayEnd.toDate()
      }
    });

    if (shift) {
      shift.status = 'in-progress';
      shift.actualStartTime = now.toDate();
      shift.clockIns = shift.clockIns || [];
      shift.clockIns.push({ time: now.toDate(), location });
    } else {
      shift = new Shift({
        userprofile: userProfile._id,
        date: now.toDate(),
        status: 'in-progress',
        actualStartTime: now.toDate(),
        scheduledStartTime: now.toDate(),
        scheduledEndTime: now.add(8, 'hours').toDate(), // Default 8-hour shift
        clockIns: [{ time: now.toDate(), location }]
      });
    }

    await shift.save();

    userProfile.currentShift = shift._id;
    userProfile.isClockingIn = true;
    userProfile.lastClockIn = now.toDate();
    await userProfile.save();

    // Update monthly stats
    await updateMonthlyStats(userProfile._id);

    res.status(200).json({ message: 'Clocked in successfully', shift, userProfile });
  } catch (error) {
    console.error('Clock-in error:', error);
    res.status(500).json({ message: 'Error clocking in', error: error.message });
  }
});

// Updated clock-out route
router.post('/clock-out', async (req, res) => {
  try {
    const { authID, location } = req.body;
    const userProfile = await Userprofile.findOne({ authID }).populate({
      path: 'currentShift',
      populate: { path: 'position' }
    });

    if (!userProfile || !userProfile.currentShift) {
      return res.status(400).json({ message: 'No active shift found' });
    }

    const shift = await Shift.findById(userProfile.currentShift._id);
    const clockOutTime = new Date();

    shift.clockOuts = shift.clockOuts || [];
    shift.clockOuts.push({ time: clockOutTime, location });
    shift.status = 'completed';
    shift.actualEndTime = clockOutTime;

    // Calculate duration and pay
    const duration = (clockOutTime - shift.actualStartTime) / (1000 * 60 * 60);
    shift.duration = duration;
    
    if (shift.position?.hourlyRate) {
      shift.pay = duration * shift.position.hourlyRate;
    }

    // Calculate performance metrics
    const performance = calculateShiftPerformance(
      shift,
      shift.scheduledStartTime,
      shift.scheduledEndTime
    );
    
    shift.performance = performance;

    await shift.save();

    // Update user profile
    userProfile.isClockingIn = false;
    userProfile.lastClockOut = clockOutTime;
    userProfile.totalHoursWorked += duration;
    userProfile.currentShift = null;

    // Update weekly performance
    const currentWeek = moment().isoWeek();
    const currentYear = moment().year();
    
    let weeklyPerf = userProfile.weeklyPerformance.find(
      wp => wp.week === currentWeek && wp.year === currentYear
    );

    if (!weeklyPerf) {
      userProfile.weeklyPerformance.push({
        week: currentWeek,
        year: currentYear,
        averageRating: performance.overall,
        shiftsCompleted: 1,
        totalHours: duration,
        punctualityScore: performance.punctuality,
        breakComplianceScore: performance.breakCompliance,
        hoursCompletedScore: performance.hoursCompleted
      });
    } else {
      weeklyPerf.shiftsCompleted += 1;
      weeklyPerf.totalHours += duration;
      weeklyPerf.punctualityScore = 
        (weeklyPerf.punctualityScore * (weeklyPerf.shiftsCompleted - 1) + performance.punctuality) / weeklyPerf.shiftsCompleted;
      weeklyPerf.breakComplianceScore = 
        (weeklyPerf.breakComplianceScore * (weeklyPerf.shiftsCompleted - 1) + performance.breakCompliance) / weeklyPerf.shiftsCompleted;
      weeklyPerf.hoursCompletedScore = 
        (weeklyPerf.hoursCompletedScore * (weeklyPerf.shiftsCompleted - 1) + performance.hoursCompleted) / weeklyPerf.shiftsCompleted;
      weeklyPerf.averageRating = 
        (weeklyPerf.punctualityScore + weeklyPerf.breakComplianceScore + weeklyPerf.hoursCompletedScore) / 3;
    }

    await userProfile.save();
    await updateMonthlyStats(userProfile._id);

    res.status(200).json({ 
      message: 'Clocked out successfully', 
      shift,
      performance
    });
  } catch (error) {
    console.error('Clock-out error:', error);
    res.status(500).json({ message: 'Error clocking out', error: error.message });
  }
});

// Helper function to update monthly stats
async function updateMonthlyStats(userProfileId) {
  const startOfMonth = moment().startOf('month').toDate();
  const endOfMonth = moment().endOf('month').toDate();

  const monthShifts = await Shift.find({
    userprofile: userProfileId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
    status: 'completed'
  });

  const stats = monthShifts.reduce((acc, shift) => ({
    hoursWorked: acc.hoursWorked + (shift.duration || 0),
    earnedAmount: acc.earnedAmount + (shift.pay || 0),
    completedShifts: acc.completedShifts + 1
  }), { hoursWorked: 0, earnedAmount: 0, completedShifts: 0 });

  await Userprofile.findByIdAndUpdate(userProfileId, {
    'currentMonthStats': stats
  });
}

// Updated break routes remain mostly the same but with performance tracking
router.post('/start-break', async (req, res) => {
  try {
    const { authID, breakType } = req.body;
    const userProfile = await Userprofile.findOne({ authID }).populate('currentShift');
    
    if (!userProfile || !userProfile.currentShift) {
      return res.status(400).json({ message: 'No active shift found' });
    }

    const shift = userProfile.currentShift;
    const breakStartTime = new Date();
    
    shift.breaks = shift.breaks || [];
    shift.breaks.push({ startTime: breakStartTime, type: breakType });
    await shift.save();

    res.status(200).json({ message: 'Break started successfully', breakStartTime });
  } catch (error) {
    res.status(500).json({ message: 'Error starting break', error: error.message });
  }
});

router.post('/end-break', async (req, res) => {
  try {
    const { authID } = req.body;
    const userProfile = await Userprofile.findOne({ authID }).populate('currentShift');
    
    if (!userProfile || !userProfile.currentShift) {
      return res.status(400).json({ message: 'No active shift found' });
    }

    const shift = userProfile.currentShift;
    const currentBreak = shift.breaks[shift.breaks.length - 1];
    
    if (!currentBreak || currentBreak.endTime) {
      return res.status(400).json({ message: 'No active break found' });
    }

    const breakEndTime = new Date();
    currentBreak.endTime = breakEndTime;
    currentBreak.duration = (breakEndTime - currentBreak.startTime) / (1000 * 60);
    shift.breakMinutesUsed = (shift.breakMinutesUsed || 0) + currentBreak.duration;
    
    await shift.save();

    res.status(200).json({ 
      message: 'Break ended successfully', 
      breakEndTime,
      totalBreakTime: shift.breakMinutesUsed 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error ending break', error: error.message });
  }
});

module.exports = router;