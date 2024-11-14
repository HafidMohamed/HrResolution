const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Role = require('../models/Role');

// Validation middleware

const validateRole = [
    // Validate 'Role name' field
    body('name')
      .notEmpty().withMessage('Role name is required')
      .trim(),

    body('description')
      .notEmpty().withMessage('Role description is required')
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

// Get all Roles
router.get('/', async (req, res, next) => {
  try {
    const roles  = await Role.find();
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

// Get a single Role by ID
router.get('/:id', async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(role);
  } catch (error) {
    next(error);
  }
});

// Create a new Role
router.post('/', validateRole, checkValidationResult, async (req, res, next) => {
  try {
    const role = new Role(req.body);
    const newRole = await role.save();
    res.status(201).json(newRole);
  } catch (error) {
    next(error);
  }
});

// Update a Role
router.patch('/:id', validateRole, checkValidationResult, async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(role, req.body);
    const updatedRole = await role.save();
    res.json(updatedRole);
  } catch (error) {
    next(error);
  }
});

// Delete a Role
router.delete('/:id', async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }

    await role.remove();
    res.json({ message: 'Role deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;