const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new mongoose.Schema({
  username: {type: String,required: true,unique: true,trim: true,},
  email: {type: String,required: true,unique: true,trim: true,lowercase: true},
  password: {type: String,required: true,required: function() {
    return !this.googleId; // Password is required only if googleId is not present
  }},
  role: { type: Schema.Types.ObjectId, ref: 'Role' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date,
  googleId: String,
  isActive: { type: Boolean, default: true },
  refreshToken: String,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  twoFactorSecret: String,
  isTwoFactorEnabled: { type: Boolean, default: true },
  notifications:[{ type: Schema.Types.ObjectId, ref: 'Notification' }],
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true }
  }

}, {
  timestamps: true
});

// Hash the password before saving it to the database
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});



// Compare the provided password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;