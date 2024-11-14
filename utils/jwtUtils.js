const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {expiresIn: '1h'  });
};
exports.generateRefreshToken = ({userId,rememberMe}) => {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign({ userId }, process.env.JWT_REFRESH, { expiresIn });
};
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("re",decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
exports.generateEmailToken = () => {
  return crypto.randomBytes(64).toString('hex');
};