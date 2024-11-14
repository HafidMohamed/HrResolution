const User = require('../models/User');
const jwtUtils = require('../utils/jwtUtils');
const { sendVerificationEmail } = require('../services/emailService');

exports.saveByEmailAndRole = async (email,role) => {
  const existingEmail= await User.findOne({ email });
  if (existingEmail) {
    throw new Error('Email already exists, Change Email or recover your account');
  }
  const tempCeridantials = email.split('@')[0]; 
  const verificationToken = jwtUtils.generateEmailToken();
  console.log(verificationToken);
  const user = new User({ username:tempCeridantials, email, password:tempCeridantials ,role,
    emailVerificationToken:verificationToken,
    emailVerificationExpires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 24 hours
  });
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);
console.log(user)

  return user ; 
};