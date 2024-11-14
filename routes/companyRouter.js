const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const User = require('../models/User');
const Userprofile = require('../models/Userprofile');
const { verifyToken } = require('../utils/jwtUtils');
const Address = require('../models/Address');
const { isValidPhoneNumber } = require('libphonenumber-js');



const validateCompany = [
    // Validate 'Company name' field
    body('formData.name')
      .notEmpty().withMessage('Company name is required')
      .trim(),
    body('formData.email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('formData.description')
      .notEmpty().withMessage('Company description is required')
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

// Get all Companys
router.get('/', async (req, res, next) => {
  try {
    const companies  = await Company.find();
    res.json(companies);
  } catch (error) {
    next(error);
  }
});
router.post('/getCompanies',verifyToken, async (req, res, next) => {
  try {
    const userprofile = await Userprofile.findOne({ user:req.body.user.userId}).populate('company');

    let data;
    const userrRole=req.body.user.role.name;
    switch (userrRole) {
      case 'Owner':
      case 'Admin': {
        const companies = await Company.find({ _id: { $ne: userprofile.company._id } });
        data = {
          companies
        };
        break;
      }
      case 'Customer_Company_Owner': {
        const companies = userprofile.company;
        data = {
          companies
        };
        break;
      }
      default: {
          throw new Error('Invalid user role');
      }
    }
        
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid Action' });  }
});

// Get a single Company by ID
router.get('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      const error = new Error('Company not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
});

// Create a new Company
router.post('/', validateCompany, checkValidationResult, async (req, res, next) => {
  try {
    const company = new Company(req.body);
    const newCompany = await company.save();
    res.status(201).json(newCompany);
  } catch (error) {
    next(error);
  }
});
// Create a new Company
router.post('/create',verifyToken, validateCompany, checkValidationResult, async (req, res, next) => {

  try {
    console.log(req.body.formData);
    const {
      name,
      email,
      description,
      phone,
      address,  
    } = req.body.formData;
    const nddress= new Address(address);
    await nddress.save();
    const company = new Company({
      name,
      email,
      description,
      phone,
      nddress});
     await company.save();
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
});

// Update a Company
router.patch('/:id', validateCompany, checkValidationResult, async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      const error = new Error('Company not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(company, req.body);
    const updatedCompany = await company.save();
    res.json(updatedCompany);
  } catch (error) {
    next(error);
  }
});

// Delete a Company
router.delete('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      const error = new Error('Company not found');
      error.statusCode = 404;
      throw error;
    }

    await company.remove();
    res.json({ message: 'Company deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;