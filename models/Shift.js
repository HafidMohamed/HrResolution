const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftSchema = new Schema({
  userprofile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Userprofile',
        
      },
      position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position',
        
      },
      scheduledStartTime:  Date,
      scheduledEndTime: Date,
      actualStartTime: Date,
      actualEndTime: Date,
      date: { type: Date, required: true },
      duration: { type: Number, default: 0 },
      clockIns: [{
        time: Date,
        location: {
          type: { type: String, default: 'Point' },
          coordinates: [Number]
        }
      }],
      clockOuts: [{
        time: Date,
        location: {
          type: { type: String, default: 'Point' },
          coordinates: [Number]
        }
      }],
      breaks: [{
        startTime: Date,
        endTime: Date,
        duration: Number,
        type: { type: String, enum: ['lunch', 'short', 'other'], default: 'short' }
      }],
      break: String,
      pay: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'absent'],
        default: 'scheduled'
      },
      notes: String,
      department: { type: Schema.Types.ObjectId, ref: 'Department' },
      performance: {
        punctuality: { type: Number, min: 0, max: 5, default: 5 }, // Rating for arriving on time
        breakCompliance: { type: Number, min: 0, max: 5, default: 5 }, // Rating for proper break management
        hoursCompleted: { type: Number, min: 0, max: 5, default: 5 }, // Rating for completing scheduled hours
        overall: { type: Number, min: 0, max: 5, default: 5 } // Overall shift rating
      },
      overtimeMinutes: { type: Number, default: 0 },
      expectedHours: { type: Number, required: true },
      actualHours: { type: Number },
      breakMinutesUsed: { type: Number, default: 0 },
      

});

const Shift = mongoose.model('Shift', shiftSchema);
module.exports = Shift;