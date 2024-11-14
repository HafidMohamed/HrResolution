const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Address = require('../models/Address');

// Validation middleware

const validateAddress =  [
    // Validate 'street' field
    body('street')
      .notEmpty().withMessage('Street is required')
      .isString().withMessage('Street must be a valid string')
      .isLength({ min: 3 }).withMessage('Street must be at least 3 characters long')
      .trim(),
  
    // Validate 'houseNumber' field
    body('houseNumber')
      .notEmpty().withMessage('House number is required')
      .isAlphanumeric().withMessage('House number must be alphanumeric')
      .trim(),
  
    // Validate 'city' field
    body('city')
      .notEmpty().withMessage('City is required')
      .isString().withMessage('City must be a valid string')
      .isLength({ min: 2 }).withMessage('City must be at least 2 characters long')
      .trim(),
  
    // Validate 'country' field
    body('country')
      .notEmpty().withMessage('Country is required')
      .isString().withMessage('Country must be a valid string')
      .isLength({ min: 2 }).withMessage('Country must be at least 2 characters long')
      .trim(),
  
    // Validate 'zip' field
    body('zip')
      .notEmpty().withMessage('ZIP code is required')
      .isPostalCode('any').withMessage('ZIP code must be a valid postal code')
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

// Get all Address
router.get('/', async (req, res, next) => {
  try {
    const addresses = await Address.find();
    res.json(addresses);
  } catch (error) {
    next(error);
  }
});

// Get a single Address by ID
router.get('/:id', async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(address);
  } catch (error) {
    next(error);
  }
});

// Create a new Address
router.post('/', validateAddress, checkValidationResult, async (req, res, next) => {
  try {
    const address = new Address(req.body);
    const newAddress = await address.save();
    res.status(201).json(newAddress);
  } catch (error) {
    next(error);
  }
});

// Update a Address
router.patch('/:id', validateAddress, checkValidationResult, async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(address, req.body);
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    next(error);
  }
});

// Delete a Address
router.delete('/:id', async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }

    await address.remove();
    res.json({ message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;