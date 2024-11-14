const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  name: String,
  description: {type: String,required: true,trim: true},
  phone: {type: String,required: true,unique: true,trim: true},
  email: {type: String,required: true,unique: true,trim: true},
  preferredSchedulingPeriod: {type: String,trim: true},
  address: { type: Schema.Types.ObjectId, ref: 'Address' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  position: [{ type: Schema.Types.ObjectId, ref: 'Position' }],
  userprofile: [{ type: Schema.Types.ObjectId, ref: 'Userprofile' }],
  schedules: [{ type: Schema.Types.ObjectId, ref: 'Schedule' }],

});

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;