const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employmentStatusSchema = new Schema({
  name: String,
  description: String
});

const EmploymentStatus = mongoose.model('EmploymentStatus', employmentStatusSchema);
module.exports = EmploymentStatus;