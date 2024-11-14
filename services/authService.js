const User = require('../models/User');
const jwtUtils = require('../utils/jwtUtils');
const { sendVerificationEmail } = require('../services/emailService');
const speakeasy = require('speakeasy');

exports.registerUser = async (username, email, password) => {
  const existingUsername = await User.findOne({ username });
  const existingEmail= await User.findOne({ email });

  if(existingEmail && existingUsername ){
    throw new Error('This account is already exists');
  }
  if (existingUsername) {
    throw new Error('Username already exists');
  }
  if (existingEmail) {
    throw new Error('Email already exists, Change Email or recover your account');
  }
  
  const verificationToken = jwtUtils.generateEmailToken();
  console.log(verificationToken);
  const user = new User({ username, email, password ,
    emailVerificationToken:verificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);
console.log(user)
  const token = jwtUtils.generateToken(user._id);
  return { user, token }; 
};

exports.loginUser = async (email, password,rememberMe) => {
  const user = await User.findOne({ email })
  .populate('role')
  .exec();

  if (!user) {
    throw new Error('Invalid username or password');
  }

  if (!(await user.comparePassword(password))) {
    throw new Error('Invalid username or password');
  }
  const token = jwtUtils.generateToken(user._id);
  const refreshToken = jwtUtils.generateRefreshToken({userId :user._id,rememberMe});


  user.refreshToken = refreshToken;
  await user.save();

  return { user, token };
};

exports.verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });
  
  if (!user) throw new Error('Invalid or expired verification token');
  
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }
  
  if (!user.isEmailVerified) {
    throw new Error('Please verify your email before logging in');
  }
  
  if (user.isTwoFactorEnabled) {
    const twoFactorCode = speakeasy.totp({
      secret: user.twoFactorSecret,
      encoding: 'base32'
    });
    await emailService.sendTwoFactorCode(user.email, twoFactorCode);
    return { requireTwoFactor: true, userId: user._id };
  }
  
  const accessToken = tokenUtils.generateToken({ userId: user._id }, process.env.JWT_SECRET, '15m');
  const refreshToken = tokenUtils.generateToken({ userId: user._id }, process.env.REFRESH_SECRET, '7d');
  
  user.refreshToken = refreshToken;
  await user.save();
  
  return { accessToken, refreshToken };
};

exports.verifyTwoFactor = async (userId, code) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const isCodeValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1 // Allow 1 step before/after for time sync issues
  });
  
  if (!isCodeValid) throw new Error('Invalid two-factor code');
  
  const accessToken = tokenUtils.generateToken({ userId: user._id }, process.env.JWT_SECRET, '15m');
  const refreshToken = tokenUtils.generateToken({ userId: user._id }, process.env.JWT_REFRESH, '7d');
  
  user.refreshToken = refreshToken;
  await user.save();
  
  return { accessToken, refreshToken };
};

exports.logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};