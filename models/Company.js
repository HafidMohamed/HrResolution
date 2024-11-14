const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
  name: {type: String,required: true,unique: true,trim: true},
  description: {type: String,required: true,trim: true},
  phone: {type: String,required: true,unique: true,trim: true},
  email: {type: String,required: true,unique: true,trim: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  address: { type: Schema.Types.ObjectId, ref: 'Address' },
  department: [{ type: Schema.Types.ObjectId, ref: 'Department' }], 
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;