const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Department = require('../models/Department');
const { verifyToken } = require('../utils/jwtUtils');
const Address = require('../models/Address');
const Userprofile = require('../models/Userprofile');
const Schedule = require('../models/Schedule');



// Validation middleware

const validateDepartment = [
    // Validate 'Department name' field
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

// Get all Departments
router.get('/', async (req, res, next) => {
  try {
    const departments  = await Department.find();
    res.json(departments);
  } catch (error) {
    next(error);
  }
});
router.post('/getCompanyDepartments', async (req, res, next) => {
  try {
    const data  = await Company.findById(req.body.formData.company).populate('department');
    res.json(data);
  } catch (error) {
    next(error);
  }
});
router.post('/getDepartmentData',verifyToken, async (req, res, next) => {
  try {
    console.log(req.body.formData);

    const userprofile = await Userprofile.findOne({ user:req.body.formData.user.userId}).populate('company department');
    /*find({ user: { $ne: req.body.formData.user.userId } ,
      departmment: req.body.formData.department}).populate({
        path: 'user',
      select: ['_id','username','email','isActive','isEmailVerified'],
      populate: {
        path: 'role'
      }
     }).populate('position');*/
    let data;
    const userrRole=req.body.formData.user.role.name;
    switch (userrRole) {
      case 'Owner':
      case 'Admin': {
        const department = await Department.findOne({ _id: { $ne: userprofile.department._id },
          _id: req.body.formData.department
        }).populate({ path: 'userprofile' ,
          populate: { 
            path: 'user' }
         })
        .populate('position');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to beginning of the day for accurate comparison

        const latestSchedule = await Schedule.findOne({ 
          department: req.body.formData.department 
        }).sort('-endDate');

        let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Start from the beginning of the current day

    if (latestSchedule && latestSchedule.endDate > startDate) {
      // If there's a latest schedule and it ends in the future, start the new schedule from the day after
      startDate = new Date(latestSchedule.endDate);
      startDate.setDate(startDate.getDate() + 1);
    }
        
        data = {
          department,
          startDate
        };
        break;
      }
      case 'customer_company_owner': {
        const campany = Company.findById({ _id: userprofile.company._id }).populate('department');
        
        data = {
          campany
        };
        break;
      }
      case 'Department_Manager': {
        const department = userprofile.department;
        
        data = {
          department
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
router.post('/getDepartments',verifyToken, async (req, res, next) => {
  try {
    const userprofile = await Userprofile.findOne({ user:req.body.user.userId}).populate({path: 'company',
      populate: {
        path: 'department'}});

    let data;
    const userrRole=req.body.user.role.name;
    switch (userrRole) {
      case 'Owner':
      case 'Admin': {
        const companies = await Company.find({ _id: { $ne: userprofile.company._id } }).populate('department');
        data = {
          companies
        };
        break;
      }
      case 'Customer_Company_Owner': {
        const company = userprofile.company;
        
        data = {
          company
        };
        break;
      }
      case 'Department_Manager':
      case 'Shift_Manager':
      case 'Employee': {
        const department = userprofile.department;
        
        data = {
          department
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

// Get a single Department by ID
router.get('/:id', async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(department);
  } catch (error) {
    next(error);
  }
});
router.post('/create',verifyToken, validateDepartment, checkValidationResult, async (req, res, next) => {

  try {
    console.log(req.body.formData);
    const {
      name,
      email,
      description,
      phone,
      address,
      company,  
    } = req.body.formData;
    const nddress= new Address(address);
    await nddress.save();
    const department = new Department({
      name,
      email,
      description,
      phone,
      nddress,
      company
    });
    
     await department.save();
       // Update the company to include the new department
    const updatedCompany = await Company.findByIdAndUpdate(
      company,
      { $push: { department: department._id } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(201).json({
      department: department,
      message: "Department created and added to company successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: error.message });  }
});

// Create a new Department
router.post('/', validateDepartment, checkValidationResult, async (req, res, next) => {
  try {
    const department = new Department(req.body);
    const newDepartment = await department.save();
    res.status(201).json(newDepartment);
  } catch (error) {
    next(error);
  }
});

// Update a Department
router.patch('/:id', validateDepartment, checkValidationResult, async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(department, req.body);
    const updatedDepartment = await department.save();
    res.json(updatedDepartment);
  } catch (error) {
    next(error);
  }
});

// Delete a Department
router.delete('/:id', async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    await department.remove();
    res.json({ message: 'Department deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;