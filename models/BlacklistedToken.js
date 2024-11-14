const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' } // Automatically remove after 1 hour
});

const BlacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema);