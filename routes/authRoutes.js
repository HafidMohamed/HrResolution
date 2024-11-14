const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const authController = require('../controllers/authController');
const Middleware = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwtUtils');
const speakeasy = require('speakeasy');
const { sendPasswordChangeEmail } = require('../services/emailService');
const Userprofile = require('../models/Userprofile');
const jwtUtils = require('../utils/jwtUtils');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', Middleware.authMiddleware, (req, res) => res.json(req.user));
//router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
/*router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('http://localhost:5173/dashboard');
    }
  );*/

  router.post('/google', async (req, res) => {
    const { email, name, picture, sub } = req.body;
    console.log(email, name, picture, sub);
    try {
      if (!email || !sub) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { googleId: sub },
                { email: email }
            ]
        }).populate('role');

        if (user) {
            // Update existing user if needed
            if (!user.googleId) {
                user.googleId = sub;
                user.isEmailVerified = true;
                await user.save();
            }
        } else {
            // Create new user
            const tempPassword = email.split('@')[0];
            user = new User({
                googleId: sub,
                email,
                username: name,
                password: tempPassword,
                isEmailVerified: true,
                isTwoFactorEnabled: false
            });
            await sendPasswordChangeEmail(email,tempPassword );
            await user.save();
        }
 
        // Generate tokens
        const token = jwtUtils.generateToken(user._id);
        const refreshToken = jwtUtils.generateRefreshToken({userId :user._id,rememberMe:true});

        // Update refresh token in database
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        user.isActive = true;
        await user.save();

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        console.log("finish",user);
        const userprofile = await Userprofile.findOne({ user: user._id })
    .select('authID');
        // Send response
        res.json({
            user: {
                userId: user._id,
                email: user.email,
                username: user.username,
                role:user.role,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                refreshToken: user.refreshToken,
                createdAt: user.createdAt,
                authID:userprofile.authID
              },
            token
        });

    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(401).json({ error: 'Google authentication failed' });
    }
});
 
router.post('/refresh-token', async (req, res) => {
  
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token is required' });
  }
  try {
    const user = await User.findOne({ refreshToken });

    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH, (err, decoded) => {
      if (err || user._id.toString() !== decoded.userId) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({token: accessToken });
    });
    
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});
  
  // Logout route
  router.post('/logout', async (req, res) => {
    const { token } = req.body;
  
  if (!token) {
    console.log('Logout attempt with no access token');
    return res.status(400).json({ message: 'Access token is required' });
  }

  try {
    // Log the received token (be careful with this in production)
    console.log('Received access token:', token);

    // Verify the token without checking expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    console.log('Decoded token:', decoded);

    let user;

    if (decoded.userId) {
      // Local authentication
      user = await User.findById(decoded.userId);
    } else if (decoded.sub) {
      // Google authentication
      user = await User.findOne({ googleId: decoded.sub });
    } else {
      console.log('Token does not contain user ID or sub');
      return res.status(400).json({ message: 'Invalid token format' });
    }
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      // If user is not found, we'll just clear the cookie and return success
      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Logged out successfully (user not found)' });
    }

    // Clear the refresh token if user exists
    if (user) {
    user.refreshToken = null;
    user.isActive=false;
    await user.save();
  } else {
    console.log('User not found for ID:', decoded.id || decoded.sub);
  }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');
    
    console.log('Logout successful for user:', user._id);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid token:', error.message);
      // If the token is invalid, we'll still clear the cookie
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Invalid access token' });
    }
    // For any other errors, send a 500 status
    res.status(500).json({ message: 'An error occurred during logout' });
  }

  });
  
  // Protected route example
  router.get('/protected', Middleware.authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.user.id });
  });
  router.get('/check-auth',Middleware.verifyRefreshToken, (req, res) => {
    res.status(200).json({ message: 'Token is valid', user: req.user });
  });

  router.get('/verify-email/:token', async (req, res) => {
    console.log(req.params.token);
    let user;
    try {
       user = await User.findOne({
        emailVerificationToken: req.params.token,
        emailVerificationExpires: { $gt: Date.now() }
      });
      console.log("12"+user.username);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }
      
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      return res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      return res.status(500).json({ message: 'Error verifying email' });
    }
  });
  router.post('/verify-2fa', async (req, res) => {
    try {
      const { email, code } = req.body; 
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(email, code);
      const isCodeValid = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1 // Allow 1 step before/after for time sync issues
      });
      if (!isCodeValid) {
        return res.status(400).json({ message: 'Invalid two-factor code' });
      }
      user.twoFactorSecret = undefined;
      await user.save();

      const id=user._id;
      const token =  jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('refreshToken', user.refreshToken, { httpOnly: true, sameSite: 'strict',maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ user, token });
        } catch (error) {
       res.status(500).json({ message: 'Error verifying 2FA' });
    }
  });
  router.post('/enable-2fa', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const secret = speakeasy.generateSecret();
      
      user.twoFactorSecret = secret.base32;
      user.isTwoFactorEnabled = true;
      await user.save();
      
       res.json({ secret: secret.otpauth_url });
    } catch (error) {
       res.status(500).json({ message: 'Error enabling 2FA' });
    }
  });




















module.exports = router;