const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const EmploymentStatus = require('../models/EmploymentStatus');


// Validation middleware

const validateEmploymentStatus = [
    // Validate 'EmploymentStatus name' field
    body('name')
      .notEmpty().withMessage('EmploymentStatus name is required')
      .trim(),

    body('description')
      .notEmpty().withMessage('EmploymentStatus description is required')
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

// Get all EmploymentStatuss
router.get('/', async (req, res, next) => {
  try {
    const EmploymentStatuss  = await EmploymentStatus.find();
    res.json(EmploymentStatuss);
  } catch (error) {
    next(error);
  }
});

// Get a single EmploymentStatus by ID
router.get('/:id', async (req, res, next) => {
  try {
    const employmentStatus = await EmploymentStatus.findById(req.params.id);
    if (!employmentStatus) {
      const error = new Error('EmploymentStatus not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(employmentStatus);
  } catch (error) {
    next(error);
  }
});

// Create a new EmploymentStatus
router.post('/', validateEmploymentStatus, checkValidationResult, async (req, res, next) => {
  try {
    const employmentStatus = new EmploymentStatus(req.body);
    const newEmploymentStatus = await employmentStatus.save();
    res.status(201).json(newEmploymentStatus);
  } catch (error) {
    next(error);
  }
});

// Update a EmploymentStatus
router.patch('/:id', validateEmploymentStatus, checkValidationResult, async (req, res, next) => {
  try {
    const employmentStatus = await EmploymentStatus.findById(req.params.id);
    if (!employmentStatus) {
      const error = new Error('EmploymentStatus not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(employmentStatus, req.body);
    const updatedEmploymentStatus = await employmentStatus.save();
    res.json(updatedEmploymentStatus);
  } catch (error) {
    next(error);
  }
});

// Delete a EmploymentStatus
router.delete('/:id', async (req, res, next) => {
  try {
    const employmentStatus = await EmploymentStatus.findById(req.params.id);
    if (!employmentStatus) {
      const error = new Error('EmploymentStatus not found');
      error.statusCode = 404;
      throw error;
    }

    await employmentStatus.remove();
    res.json({ message: 'EmploymentStatus deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;