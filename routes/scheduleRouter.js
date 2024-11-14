const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Department = require('../models/Department');
const { verifyToken } = require('../utils/jwtUtils');
const Address = require('../models/Address');
const moment = require('moment-timezone');
const Shift = require('../models/Shift');  // Adjust the path if necessary
const DayShift = require('../models/dayShift');  // Make sure this model is also defined
const Schedule = require('../models/Schedule');  // Make sure this model is also defined
const UserProfile = require('../models/Userprofile');
const NotificationService = require('../services/notificationService');
const { sendScheduleEmail } = require('../services/emailService');
const { TranslationService } = require('./translateRouter'); // Adjust the path as needed
const User = require('../models/User');




router.put('/updateSchedule', verifyToken, async (req, res, next) => {
  try {
    const updatedData = req.body.updatedFormData;
    const employeeScheduleNotifications = {};
    const timezone = req.userTimezone;     
    const user=req.body.updatedFormData.user;
    console.log('Processing shift:', JSON.stringify(updatedData, null, 2));

    const schedule = await Schedule.findById(updatedData.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    const updatedDayShifts = [];
    const dayShiftPromises = [];
    const updatedShiftIds = new Set();


    for (const [date, shifts] of Object.entries(updatedData.schedule)) {
      if (date === 'dayShiftId') continue;

      const dayShiftId = shifts.employeeShiftId;
      const dayShiftPromise = DayShift.findById(dayShiftId).then(async (dayShift) => {
        if (!dayShift) {
          dayShift = new DayShift({ day: new Date(date), employeesShifts: [] });
        }

        const updatedEmployeeShifts = [];
        const shiftPromises = [];

        for (const [positionId, employeeShifts] of Object.entries(shifts)) {
          if (positionId === 'employeeShiftId') continue;

          if (Array.isArray(employeeShifts)) {
            employeeShifts.forEach((employeeShift) => {
              if (employeeShift.shiftId) {
                updatedShiftIds.add(employeeShift.shiftId);
              }
              const shiftPromise = processEmployeeShift(employeeShift, positionId, schedule,user, employeeScheduleNotifications).then(result => {
                updatedEmployeeShifts.push(result);
              });
              shiftPromises.push(shiftPromise);
            });
          }
        }

        await Promise.all(shiftPromises);

        // Remove shifts that are no longer in the updated schedule
        const removedShifts = dayShift.employeesShifts.filter(
          es => !updatedEmployeeShifts.some(ues => ues.shift.toString() === es.shift.toString())
        );

        await Promise.all(removedShifts.map(removedShift => processRemovedShift(removedShift,user, employeeScheduleNotifications, updatedData)));

        dayShift.employeesShifts = updatedEmployeeShifts;
        await dayShift.save();
        updatedDayShifts.push(dayShift._id);

        return dayShift;
      });

      dayShiftPromises.push(dayShiftPromise);
    }

    await Promise.all(dayShiftPromises);

    // Update schedule with new dayShifts
    schedule.dayShift = updatedDayShifts;
    await schedule.save();
    
    // Send notifications in parallel
    for (const [userId, notificationData] of Object.entries(employeeScheduleNotifications)) {
      notificationData.type = "Your schedule has been updated";
    }

    // Send notifications in parallel
    await Promise.all(Object.entries(employeeScheduleNotifications).map(([userId, notificationData]) => 
      sendNotification( notificationData, schedule, timezone)
    ));

    res.json({ 
      message: 'Schedule updated successfully', 
      schedule
    });
  } catch (error) {
    console.error('Error in /updateSchedule route:', error);
    res.status(500).json({ message: 'Error updating schedule', error: error.message });
  }
});

async function processEmployeeShift(employeeShift, positionId, schedule,user, employeeScheduleNotifications) {
  const employeeId = employeeShift.id;

  if (!employeeScheduleNotifications[employeeId]) {
    employeeScheduleNotifications[employeeId] = {
      userId: employeeShift.userId,
      autherEmail: user.email,
      firstName: '',
      userEmail: employeeShift.email,
      changes: []
    };
  }

  let shift;
  if (employeeShift.shiftId) {
    // Update existing shift
    shift = await Shift.findById(employeeShift.shiftId);
    if (shift) {
      const originalStartTime = shift.scheduledStartTime;
      const originalEndTime = shift.scheduledEndTime;

      Object.assign(shift, {
        userprofile: employeeId,
        position: positionId,
        date: employeeShift.date,
        scheduledStartTime: employeeShift.startTime,
        scheduledEndTime: employeeShift.endTime,
        duration: (new Date(employeeShift.endTime) - new Date(employeeShift.startTime)) / (1000 * 60 * 60)
      });

      await shift.save();

      if (originalStartTime !== shift.scheduledStartTime || originalEndTime !== shift.scheduledEndTime) {
        employeeScheduleNotifications[employeeId].changes.push({
          type: 'update',
          date: shift.date,
          oldStartTime: originalStartTime,
          oldEndTime: originalEndTime,
          newStartTime: shift.scheduledStartTime,
          newEndTime: shift.scheduledEndTime,
          position: positionId
        });
      }
    }
  } else {
    // Create new shift
    shift = new Shift({
      userprofile: employeeId,
      position: positionId,
      date: employeeShift.date,
      scheduledStartTime: employeeShift.startTime,
      scheduledEndTime: employeeShift.endTime,
      duration: (new Date(employeeShift.endTime) - new Date(employeeShift.startTime)) / (1000 * 60 * 60),
      department: schedule.department
    });
    await shift.save();

    employeeScheduleNotifications[employeeId].changes.push({
      type: 'new',
      date: shift.date,
      startTime: shift.scheduledStartTime,
      endTime: shift.scheduledEndTime,
      position: positionId
    });
  }

  // Update UserProfile
  const userProfile = await UserProfile.findByIdAndUpdate(
    employeeId,
    { $addToSet: { Shifts: shift._id } },
    { new: true, useFindAndModify: false }
  );
  employeeScheduleNotifications[employeeId].firstName = userProfile.firstName;

  return {
    userprofile: employeeId,
    shift: shift._id
  };
}

async function processRemovedShift(removedShift, employeeScheduleNotifications, updatedData) {
  const shift = await Shift.findById(removedShift.shift);
  await Shift.findByIdAndDelete(removedShift.shift);
  await UserProfile.findByIdAndUpdate(
    removedShift.userprofile,
    { $pull: { Shifts: removedShift.shift } }
  );

  const userProfile = await UserProfile.findById(removedShift.userprofile).populate('user');
  const employeeId = userProfile._id;

  if (!employeeScheduleNotifications[employeeId]) {
    employeeScheduleNotifications[employeeId] = {
      userId: removedShift.userId,
      userEmail: userProfile.user.email,
      autherEmail: updatedData.user.email,
      firstName: userProfile.firstName,
      changes: []
    };
  }

  employeeScheduleNotifications[employeeId].changes.push({
    type: 'remove',
    date: shift.date,
    startTime: shift.scheduledStartTime,
    endTime: shift.scheduledEndTime,
    position: shift.position
  });
}

async function translateContent( targetLang) {
  const translationKeys = {
    subject: 'Schedule Update',
    greeting: 'Hi',
    introduction: 'Your new schedule has been created. Here are your shifts:',
    shiftsHeader: 'Shift details:',
    changed: 'Changed from',
    removed: 'Removed shift',
    new: 'New shift',
    questions: 'If you have questions, contact the scheduler at',
    thankYou: 'Thank you for your understanding.'
  };

  try {
      await TranslationService.readTranslations();
  
      const translations = await TranslationService.getTranslations(targetLang, Object.keys(translationKeys));
  
      for (const [key, value] of Object.entries(translationKeys)) {
        if (!translations[key]) {
          translations[key] = await TranslationService.translateAndSave(value, 'en', targetLang, key);
        }
      }
  
  

    // Return the translated content
    return {
      subject: translations.subject,
      greeting: translations.greeting,
      introduction: translations.introduction,
      shiftsHeader: translations.shiftsHeader,
      changed: translations.changed,
      removed: translations.removed,
      new: translations.new,
      questions: translations.questions,
      thankYou: translations.thankYou
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

async function generateEmailContent(data, targetLang = 'en') {
  const { firstName, changes, autherEmail } = data.notifications;

  const translations = await translateContent( targetLang);

  let content = `${translations.subject}

${translations.greeting} ${firstName},

${translations.introduction}

${translations.shiftsHeader}

`;

  changes.forEach(change => {
    const date = new Date(change.date);
    const formattedDate = date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    
    const formatTime = (timeString) => {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    switch (change.type) {
      case 'update':
        content += `${formattedDate}: ${translations.changed} ${formatTime(change.oldStartTime)}-${formatTime(change.oldEndTime)} to ${formatTime(change.newStartTime)}-${formatTime(change.newEndTime)}\n`;
        break;
      case 'remove':
        content += `${formattedDate}: ${translations.removed} ${formatTime(change.startTime)}-${formatTime(change.endTime)}\n`;
        break;
      case 'new':
        content += `${formattedDate}: ${translations.new} ${formatTime(change.startTime)}-${formatTime(change.endTime)}\n`;
        break;
    }
  });

  content += `
${translations.questions} ${autherEmail}.

${translations.thankYou}`;

  return content;
}

async function sendNotification( notificationData, schedule, timezone) {
  try {
    const scheduleType = schedule.type;
    const user=await User.findById(notificationData.userId).select('preferences');

    // Get user's preferred language (you'll need to implement this)
    
    const notificationContent = await generateEmailContent({
      notifications: notificationData,
      id: schedule._id,
      type: notificationData.type || "Your new schedule has been created",
      timezone
    }, user.preferences.language);

    await sendScheduleEmail(scheduleType, notificationData,user.preferences.language);

    console.log('Creating notification for user:', notificationData.userId);
    await NotificationService.createNotification({
      userId: notificationData.userId,
      type: 'Schedule Creation',
      content: notificationContent,
      relatedEntity: { type: 'Schedule', id: schedule._id },
      timezone
    });
    console.log('Notification created successfully');
  } catch (error) {
    console.error('Error creating notification for user:', notificationData.userId, error);
  }
}
  router.post('/saveSchedule', verifyToken, async (req, res, next) => {
    try {
      const { company, department, schedule, period,user } = req.body.formData;
      const timezone = req.userTimezone;
      console.log('User timezone:', timezone);
      
      const savedIds = { shifts: [], dayShifts: [], schedule: null };
      const employeeScheduleNotifications = {};
  console.log(JSON.stringify(schedule, null, 2));
      // Step 1: Save shifts and create day shifts (in parallel)
      const shiftSavingPromises = Object.entries(schedule).flatMap(([date, shifts]) =>
        Object.entries(shifts).flatMap(([positionId, employeeShifts]) =>
          employeeShifts.map(async (employeeShift) => {
            const startDate = moment.utc(employeeShift.startTime).tz(timezone);
            const endDate = moment.utc(employeeShift.endTime).tz(timezone);
            
            // Calculate duration using moment's diff method
            const durationInHours = endDate.diff(startDate, 'hours', true);
  console.log(startDate,endDate);
            const shift = new Shift({
              userprofile: employeeShift.id,
              position: positionId,
              date: employeeShift.date,
              scheduledStartTime: startDate.toDate(),
              scheduledEndTime: endDate.toDate(),
              duration: durationInHours,
              expectedHours:durationInHours,
              department: department
            });
  
            const savedShift = await shift.save();
            console.log(savedShift);

            await UserProfile.findByIdAndUpdate(
              employeeShift.id,
              { $push: { Shifts: savedShift._id } },
              { new: true, useFindAndModify: false }
            );
  
            if (!employeeScheduleNotifications[employeeShift.id]) {
              employeeScheduleNotifications[employeeShift.id] = {
                userId: employeeShift.userId,
                userEmail: employeeShift.email,
                firstName: employeeShift.name.split(' ')[0],
                autherEmail:user.email,
                changes: []
              };
            }
  
            employeeScheduleNotifications[employeeShift.id].changes.push({
              type: 'new',
              date: shift.date,
              startTime: shift.scheduledStartTime,
              endTime: shift.scheduledEndTime,
              position: positionId
            });
  
            return {
              date,
              positionId,
              savedShift,
              employeeId: employeeShift.id
            };
          })
        )
      );
  
      const savedShiftsResults = await Promise.all(shiftSavingPromises);
      const savedShifts = savedShiftsResults.reduce((acc, { date, positionId, savedShift }) => {
        if (!acc[date]) acc[date] = {};
        if (!acc[date][positionId]) acc[date][positionId] = [];
        acc[date][positionId].push(savedShift);
        savedIds.shifts.push(savedShift._id);
        return acc;
      }, {});
  
      // Step 2: Create DayShifts (in parallel)
      const dayShiftCreationPromises = Object.entries(savedShifts).map(async ([date, shifts]) => {
        const employeesShifts = Object.values(shifts).flat().map(shift => ({
          userprofile: shift.userprofile,
          shift: shift._id
        }));
  
        const dayShift = new DayShift({
          day: new Date(date),
          employeesShifts
        });
  
        const savedDayShift = await dayShift.save();
        savedIds.dayShifts.push(savedDayShift._id);
        return savedDayShift;
      });
  
      const savedDayShifts = await Promise.all(dayShiftCreationPromises);
  
      // Step 3: Create Schedule
      const scheduleStartDate = new Date(Object.keys(schedule)[0]);
      const scheduleEndDate = new Date(Object.keys(schedule)[Object.keys(schedule).length - 1]);
  
      const newSchedule = new Schedule({
        type: period,
        startDate: scheduleStartDate,
        endDate: scheduleEndDate,
        dayShift: savedDayShifts.map(ds => ds._id),
        company: company,
        department: department
      });
  
      const savedSchedule = await newSchedule.save();
      savedIds.schedule = savedSchedule._id;
  
      // Step 4: Update Department and send notifications (in parallel)
      const updateDepartmentPromise = Department.findByIdAndUpdate(
        department,
        { $push: { schedules: savedSchedule._id } },
        { new: true, useFindAndModify: false }
      );
  
      for (const [userId, notificationData] of Object.entries(employeeScheduleNotifications)) {
        notificationData.type = "Your new schedule has been created";
      }
  
      // Send notifications in parallel
      await Promise.all(Object.entries(employeeScheduleNotifications).map(([userId, notificationData]) => 
        sendNotification( notificationData, savedSchedule, timezone)
      ));
  
      await Promise.all([updateDepartmentPromise]);
  
      return res.status(200).json({ message: 'Schedule saved successfully', schedule: savedSchedule });
    } catch (error) {
      console.error('Error in saveSchedule:', error);
      
      // Rollback: Delete all saved documents
      await Shift.deleteMany({ _id: { $in: savedIds.shifts } });
      await DayShift.deleteMany({ _id: { $in: savedIds.dayShifts } });
      if (savedIds.schedule) {
        await Schedule.findByIdAndDelete(savedIds.schedule);
      }
      
      // Remove shift references from UserProfiles
      await UserProfile.updateMany(
        { Shifts: { $in: savedIds.shifts } },
        { $pull: { Shifts: { $in: savedIds.shifts } } }
      );
  
      res.status(500).json({ message: 'Error saving schedule', error: error.message });
    }
  });
  
  // Express route handler
  router.post('/getSchedules',verifyToken, async (req, res, next) => {
    try {
      console.log(req.body.formData.department);
      const data  = await Department.findById(req.body.formData.department).populate({
        path: 'schedules',
        populate: {
          path: 'dayShift',
          populate: {
            path: 'employeesShifts',
            populate: [
              { path: 'userprofile' },
              { 
                path: 'shift',
                populate: { 
                  path: 'position' }
              }
            ]
          }
        }
      });
      console.log(data);
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  // New route: Get list of schedules
router.post('/getDepartmentSchedule', verifyToken, async (req, res, next) => {
  try {
    const schedule  = await Schedule.findById(req.body.scheduleId).populate({
        path: 'dayShift',
        populate: {
          path: 'employeesShifts',
          populate: [
            { path: 'userprofile' ,
              populate: { 
                path: 'user' }
             },
            { 
              path: 'shift',
              populate: { 
                path: 'position' }
            }
          ]
        }
      
    });
    res.json({schedule});
  } catch (error) {
    console.error('Error in /listSchedules route:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
});
router.post('/getDepartmentSchedules', verifyToken, async (req, res, next) => {
  try {
    const schedules = await Schedule.find({department: req.body.formData.department})
      .sort({ startDate: -1 });
    res.json({schedules:schedules});
  } catch (error) {
    console.error('Error in /listSchedules route:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
});

// New route: Delete schedule
router.delete('/deleteDepartmentSchedule/:id', verifyToken, async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const schedule = await Schedule.findById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Delete associated dayShifts and shifts
    for (const dayShiftId of schedule.dayShift) {
      const dayShift = await DayShift.findById(dayShiftId);
      if (dayShift) {
        for (const employeeShift of dayShift.employeesShifts) {
          await Shift.findByIdAndDelete(employeeShift.shift);
          await UserProfile.findByIdAndUpdate(
            employeeShift.userprofile,
            { $pull: { Shifts: employeeShift.shift } }
          );
        }
        await DayShift.findByIdAndDelete(dayShiftId);
      }
    }

    // Remove schedule reference from department
    await Department.findByIdAndUpdate(
      schedule.department,
      { $pull: { schedules: scheduleId } }
    );

    // Delete the schedule
    await Schedule.findByIdAndDelete(scheduleId);

    res.json({ message: 'Schedule and associated data deleted successfully' });
  } catch (error) {
    console.error('Error in /deleteSchedule route:', error);
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
});

// New route: Update schedule

module.exports = router;