const mongoose = require('mongoose');
const DayShift = require('./dayShift');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    type: { type: String, enum: ['day','week', 'month'], required: true },
    startDate: Date,
    endDate: Date,
    dayShift:[{type: Schema.Types.ObjectId, ref: 'DayShift'}],
    department: { type: Schema.Types.ObjectId, ref: 'Department' },

});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;