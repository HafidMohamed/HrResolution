const Userprofile = require('../models/Userprofile');
const authService = require('../services/authService');
const { send2FACode } = require('../services/emailService');
const speakeasy = require('speakeasy');


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser(username, email, password);
    if (result.error) {
      // If there's an error, send it to the frontend
      return res.status(400).json({ message: result.error });
    }
    res.status(201).json({ message: 'User registered successfully',
      user: result.user,
      token: result.token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
   
    const { email, password,rememberMe } = req.body;
    const { user, token } = await authService.loginUser(email, password,rememberMe);
    
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }
    if (user.isTwoFactorEnabled) {
      const tempSecret = speakeasy.generateSecret();
      user.twoFactorSecret = tempSecret.base32;
      await user.save();
      
      await send2FACode(user.email, speakeasy.totp({
        secret: tempSecret.base32,
        encoding: 'base32'
      }));
      return res.json({ message: '2FA code sent to your email', requiresTwoFactor: true });
    }
    const userprofile = await Userprofile.findOne({ user: user._id })
    .select('authID');
    res.json({ user : {
      userId: user._id,
      username: user.username,
      email: user.email,
      role:user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      createdAt: user.createdAt,
      refreshToken: user.refreshToken,
      authID:userprofile.authID
    } , token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
