const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Position = require('../models/Position');
const Department = require('../models/Department');
const { verifyToken } = require('../utils/jwtUtils');

// Validation middleware

const validatePosition = [
    // Validate 'Position name' field
    body('formData.name')
      .notEmpty().withMessage('Position name is required')
      .trim(),

    body('formData.description')
      .notEmpty().withMessage('Position description is required')
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

// Get all Positions
router.get('/', async (req, res, next) => {
  try {
    const positions  = await Position.find();
    res.json(positions);
  } catch (error) {
    next(error);
  }
});

router.post('/getPositions',verifyToken, async (req, res, next) => {
  try {
    const data  = await Department.findById(req.body.formData.department).populate('position');
    console.log(data);
    res.json(data);
  } catch (error) {
    next(error);
  }
});


// Get a single Position by ID
router.get('/:id', async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      const error = new Error('Position not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(position);
  } catch (error) {
    next(error);
  }
});

// Create a new Position
router.post('/create',verifyToken, validatePosition, checkValidationResult, async (req, res, next) => {
  try {
    const { formData } = req.body;
    let position;
    let message;

    if (formData._id) {
      // Update existing position
      position = await Position.findByIdAndUpdate(formData._id, formData, { new: true, runValidators: true });
      if (!position) {
        return res.status(404).json({ message: "Position not found" });
      }
      message = "Position updated successfully";
    } else {
      // Create new position
      position = new Position(formData);
      await position.save();
      
      // Update the department to include the new position
      const updatedDepartment = await Department.findByIdAndUpdate(
        formData.department,
        { $addToSet: { position: position._id } },
        { new: true, useFindAndModify: false }
      );

      if (!updatedDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      message = "Position created and added to department successfully";
    }

    res.status(200).json({
      position: position,
      message: message
    });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: error.message });  }
});
router.post('/', validatePosition, checkValidationResult, async (req, res, next) => {
  try {
    const position = new Position(req.body);
    const newPosition = await position.save();
    res.status(201).json(newPosition);
  } catch (error) {
    next(error);
  }
});

// Update a Position
router.patch('/:id', validatePosition, checkValidationResult, async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      const error = new Error('Position not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(position, req.body);
    const updatedPosition = await position.save();
    res.json(updatedPosition);
  } catch (error) {
    next(error);
  }
});

// Delete a Position
router.delete('/:id', async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      const error = new Error('Position not found');
      error.statusCode = 404;
      throw error;
    }

    await Position.findByIdAndDelete(req.params.id);
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;