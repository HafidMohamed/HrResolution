const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dayShiftSchema = new Schema({
    description: String,
    day: Date,
    employeesShifts: [{
        userprofile: { type: Schema.Types.ObjectId, ref: 'Userprofile', required: true },
        shift: { type: Schema.Types.ObjectId, ref: 'Shift', required: true }
    }],
    department: { type: Schema.Types.ObjectId, ref: 'Department' },

});

const DayShift = mongoose.model('DayShift', dayShiftSchema);
module.exports = DayShift;