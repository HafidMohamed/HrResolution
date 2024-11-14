const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeePossistionShiftSchema = new Schema({
position: { type: Schema.Types.ObjectId, ref: 'Position' },
employee: { type: Schema.Types.ObjectId, ref: 'Employee' },
shift: { type: Schema.Types.ObjectId, ref: 'Sift' },
  clockIN: Date,
  clockOut: Date,
});

const EmployeePossistionShift = mongoose.model('EmployeePossistionShift', employeePossistionShiftSchema);
module.exports = EmployeePossistionShift;

