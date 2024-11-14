const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Validation middleware

const validateUser = [
    // Validate 'username' field
    body('username')
      .notEmpty().withMessage('Username is required')
      .isAlphanumeric().withMessage('Username must contain only letters and numbers')
      .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
      .trim(),
  
    // Validate 'email' field
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be a valid email address')
      .normalizeEmail(),
  
    // Validate 'password' field
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character')
      .trim(),
  ];
// Middleware to check for validation errors
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all Users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get a single User by ID
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create a new User
router.post('/', validateUser, checkValidationResult, async (req, res, next) => {
  try {
    const user = new User(req.body);
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// Update a User
router.patch('/:id', validateUser, checkValidationResult, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(user, req.body);
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete a User
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await user.remove();
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;