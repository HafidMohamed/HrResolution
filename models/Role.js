const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: {type: String,required: true,unique: true,trim: true,},
  permissions: [String],
  description: String
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;