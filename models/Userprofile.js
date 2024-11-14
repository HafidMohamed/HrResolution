const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: String,
  dateOfBirth: Date,
  nationalID: String,
  phone: String,
  address: { type: Schema.Types.ObjectId, ref: 'Address' },
  hireDate: Date,
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  position: { type: Schema.Types.ObjectId, ref: 'Position' },
  IBAN: {type: String,required: true,unique: true,trim: true},
  SSN: {type: String},
  SIN: {type: String,required: true,unique: true,trim: true},
  IN :  {type: String,required: true,unique: true,trim: true},
  familyStatus :  {type: String,required: true},
  nationality :  {type: String,required: true,trim: true},
  countryOfResidence :  {type: String,required: true,trim: true},
  cityOrigins :  {type: String,required: true,trim: true},
  authID : {type: String, unique: true,trim: true},
  Shifts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
  }],
  monthlyHoursWorked: {
    type: Number,
    default: 0,
  },
  monthlyPay: {
    type: Number,
    default: 0,
  },
  skills: [String],
  certifications: [{
    name: String,
    issueDate: Date,
    expiryDate: Date
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  currentShift: { type: Schema.Types.ObjectId, ref: 'Shift' },
  isClockingIn: { type: Boolean, default: false },
  lastClockIn: Date,
  lastClockOut: Date,
  totalHoursWorked: { type: Number, default: 0 },
  notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
  weeklyPerformance: [{
    week: { type: Number, required: true }, // Week number of the year
    year: { type: Number, required: true },
    averageRating: { type: Number, default: 0 },
    shiftsCompleted: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    punctualityScore: { type: Number, default: 0 },
    breakComplianceScore: { type: Number, default: 0 },
    hoursCompletedScore: { type: Number, default: 0 }
  }],
  currentMonthStats: {
    hoursWorked: { type: Number, default: 0 },
    earnedAmount: { type: Number, default: 0 },
    completedShifts: { type: Number, default: 0 }
  }

});
function generateRandomId(length) {
  return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1)).toString();
}

// Function to check if an ID already exists
async function isIdUnique(id) {
  const existingUserprofile = await Userprofile.findOne({ authID: id });
  return !existingUserprofile;
}

// Function to generate a unique User profile ID
/*async function generateUniqueUserprofileId(length = 4) {
  let id;
  let isUnique = false;
  
  while (!isUnique) {
    id = generateRandomId(length);
    isUnique = await isIdUnique(id);
  }
  
  return id;
}
userProfileSchema.pre('save', async function(next) {
  if (!this.authID) {
    this.authID = await generateUniqueUserprofileId();
  }
  next();
});*/

const Userprofile = mongoose.model('Userprofile', userProfileSchema);
module.exports = Userprofile;
