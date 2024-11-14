const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = (req, res, next) => {
  console.log("1"+req.body);
  const {token }= req.body;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    console.log("1"+decoded);
  } catch (error) {
    res.status(403).json({ error: 'Failed to authenticate token' });
  }
};
exports.verifyToken = (req, res, next) => {
  //const token = req.header('x-auth-token');
  const token = req.body;
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(400).json({ message: 'Invalid token' });
  }
};
exports.verify = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const tokenValue = tokenParts[1];
    const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(400).json({ message: 'Invalid token' });
  }
};

exports.verifyRefreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken; // Assuming the refresh token is sent in a cookie

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No refresh token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH);

    // Check if the token exists in the database
    const storedToken = await User.findOne({ refreshToken: token, _id : decoded.userId });

    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Token is valid, attach the user info to the request
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token expired', code: 'REFRESH_TOKEN_EXPIRED' });
    }
    res.status(400).json({ message: 'Invalid refresh token' });
  }
};

