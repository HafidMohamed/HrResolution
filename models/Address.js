const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
 street: String,
 houseNumber: String,
 city: String,
 country: String,
 zip: String,
 createdAt: { type: Date, default: Date.now },
 updatedAt: { type: Date, default: Date.now },
});

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;