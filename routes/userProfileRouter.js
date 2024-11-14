const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Userprofile= require('../models/Userprofile');
const { generateToken, verifyToken } = require('../utils/jwtUtils');
const verifyPermition = require('../middlewares/verifyPermission');
const User = require('../models/User');
const Company = require('../models/Company');
const Role = require('../models/Role');
const Department = require('../models/Department');
const Position = require('../models/Position');
const userService=require('../services/userService');
const Address = require('../models/Address');
const Shift = require('../models/Shift');


// Validation middleware

const validateUserProfile =   [
    body('firstName')
      .notEmpty().withMessage('First name is required')
      .isString().withMessage('First name must be a string')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  
    body('lastName')
      .notEmpty().withMessage('Last name is required')
      .isString().withMessage('Last name must be a string')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  
    body('gender')
      .optional()
      .isIn(['male', 'female']).withMessage('Gender must be either male or female'),
  
    body('dateOfBirth')
      .optional()
      .isISO8601().toDate().withMessage('Invalid date of birth')
      .custom(value => {
        const age = (new Date().getFullYear()) - value.getFullYear();
        if (age < 18 || age > 100) {
          throw new Error('User data must be between 18 and 100 years old');
        }
        return true;
      }),
  
    body('nationalID')
      .optional()
      .isString().withMessage('National ID must be a string')
      .isLength({ min: 5, max: 20 }).withMessage('National ID must be between 5 and 20 characters'),
  
    body('phone')
      .optional()
      .isMobilePhone('de-DE').withMessage('Invalid German phone number'),
  
    body('hireDate')
      .optional()
      .isISO8601().toDate().withMessage('Invalid hire date')
      .custom(value => {
        if (value > new Date()) {
          throw new Error('Hire date cannot be in the future');
        }
        return true;
      }),
  
    body('IBAN')
      .notEmpty().withMessage('IBAN is required')
      .isIBAN().withMessage('Invalid IBAN')
      .custom(value => {
        if (!value.startsWith('DE')) {
          throw new Error('IBAN must be a German IBAN (starting with DE)');
        }
        return true;
      })
      .customSanitizer(value => (value ? value.replace(/\s/g, '').toUpperCase() : '')),  
    body('SSN')
      .notEmpty().withMessage('SSN (Social Security Number) is required')
      .isString().withMessage('SSN must be a string')
      .matches(/^(?=.*[A-Z])[A-Z0-9]{12}$/).withMessage('Social Security Number must be a 12-digit number')
      .custom((value, { req }) => {
        if (req.body.countryOfResidence !== 'Germany') {
          throw new Error('SSN is only applicable within German ');
        }
        return true;
      }),
  
    body('SIN')
      .notEmpty().withMessage('Tax Identification Number (Steuer-ID) is required')
      .isString().withMessage('Tax ID must be a string')
      .matches(/^\d{11}$/).withMessage('Invalid German Tax ID format (11 digits)')
      .custom((value, { req }) => {
        if (req.body.countryOfResidence !== 'Germany') {
          throw new Error('Tax ID is only applicable within German');
        }
        return true;
      }),
  
    body('IN')
      .notEmpty().withMessage('Insurance number is required')
      .isString().withMessage('Insurance number must be a string')
      .matches(/^[A-Z]\d{9,11}$/).withMessage('Insurance Number must start with a letter followed by 9 to 11 digits'),
  
    body('familyStatus')
      .notEmpty().withMessage('Family status is required')
      .isIn(['single', 'married', 'divorced', 'widowed']).withMessage('Invalid family status'),
  
    body('nationality')
      .notEmpty().withMessage('Nationality is required')
      .isString().withMessage('Nationality must be a string')
      .isLength({ min: 2, max: 50 }).withMessage('Nationality must be between 2 and 50 characters'),
    body('countryOfResidence')
      .notEmpty().withMessage('Country Of Residance is required')
      .isString().withMessage('Country Of Residance must be a string')
      .isLength({ min: 2, max: 50 }).withMessage('Country Of Residance must be between 2 and 50 characters'),

      body('cityOrigins')
      .notEmpty().withMessage('city Origins is required')
      .isString().withMessage('city Origins  must be a string')
      .isLength({ min: 2, max: 50 }).withMessage('cityOrigins must be between 2 and 50 characters'),
    
  ];
// Middleware to check for validation errors
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all Users profile
router.get('/', async (req, res, next) => {
  try {
    const userprofiles = await Userprofile.find();
    res.json(userprofiles);
  } catch (error) {
    next(error);
  }
});
router.post('/search', async (req, res) => {

  try {
    const employees = await Userprofile.find({
      $or: [
        { firstName: { $regex: req.body.query, $options: 'i' } },
        { lastName: { $regex: req.body.query, $options: 'i' } }
      ],company:req.body.company
    }).limit(10);
console.log(employees);
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error searching employees:', error);
    res.status(500).json({ error: 'Error searching employees' });
  }
});
router.get('/Profile/:id',verifyToken, async (req, res) => {
  try {
    console.log(req.params.id);

    const userprofile = await Userprofile.findOne({ user: req.params.id })
   .populate('department position company')
   .select('-gender -dateOfBirth -nationalID -familyStatus -nationality -countryOfResidence -cityOrigins -IBAN -SSN -SIN -IN')
   .exec();
   if (!userprofile) {
     const error = new Error('Profile not found');
     error.statusCode = 404;
     throw error;
   }
   res.json(userprofile);

 } catch (error) {
   res.status(401).json({ error: error.message });
 }
});

router.post('/getUsers',verifyToken, async (req, res, next) => {
  try {
    console.log(req.body);
    
    const users = await Userprofile.find({ user: { $ne: req.body.formData.user.userId } ,
    departmment: req.body.formData.department}).populate({
      path: 'user',
    select: ['_id','username','email','isActive','isEmailVerified'],
    populate: {
      path: 'role'
    }
   }).populate('position');
    
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get a single User Profile by ID
/*router.get('/:id', async (req, res, next) => {
  try {
    const userprofile = await Userprofile.findById(req.params.id);
    if (!userprofile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(userprofile);
  } catch (error) {
    next(error);
  }
});*/
// Get a single user profile by ID
router.get('/:id', async (req, res, next) => {
    try {
      const userprofile = await Userprofile.findById(req.params.id)
      .populate('address department position company upcomingShift ')
      .exec();
      if (!userprofile) {
        const error = new Error('Profile not found');
        error.statusCode = 404;
        throw error;
      }
      res.json(userprofile);
    } catch (error) {
      next(error);
    }
  });

  router.post('/setUpUserProfile/:id',verifyToken, async (req, res, next) => {
   
    try {
      console.log(req.body);
      const user = await User.findById(req.params.id).populate('role');
    const userprofile = await Userprofile.findOne({ user:req.params.id})
    .populate('department position company upcomingShift')
    .select('-gender -dateOfBirth -nationalID -familyStatus -nationality -countryOfResidence -cityOrigins -IBAN -SSN -SIN -IN')
    .exec();
    
    let data = {};
    
    switch (user.role.name) {
        case 'Owner': {
            // Fetch all companies and their departments
            const companies = await Company.find()
      .populate({
        path: 'department',
        populate: {
          path: 'position'
        }
      });
            const roles = await Role.find({ name: { $ne: 'Owner' } }); // Exclude 'owner' role

            data = {
                companies,
                roles
            };
            break;
        }
        case 'admin': {
            // Fetch all companies except the one assigned to the admin
            const companies = await Company.find({ _id: { $ne: userprofile.company } }).populate('departments');
            const positions = await Position.find();
            const roles = await Role.find({ name: { $nin: ['owner', 'admin'] } }); // Exclude 'owner' and 'admin'

            data = {
                companies,
                positions,
                roles
            };
            break;
        }
        case 'customer_company_owner': {
            // Fetch all companies except the one owned by this customer
            const departmens = await Department.find({ company: userprofile.company._id });
            const positions = await Position.find();
            const roles = await Role.find({ name: { $nin: ['owner', 'admin', 'customer_company_owner'] } });

            data = {
                departmens,
                positions,
                roles
            };
            break;
        }
        case 'department_manager': {
            // Fetch all departments except the one managed by this user
            const departments = userprofile.department;
            const positions = await Position.find();
            const roles = await Role.find({ name: { $nin: ['owner', 'admin', 'customer_company_owner', 'department_manager'] } });

            data = {
                departments,
                positions,
                roles
            };
            break;
        }
        default: {
            throw new Error('Invalid user role');
        }
    }
    res.json(data);
    
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Create a new User profile
router.post('/creatUserProfile',verifyToken,verifyPermition, async (req, res, next) => {
  try {
    console.log(req.body.formData);
    const {
      user,
      email,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      nationalID,
      phone,
      address,
      hireDate,
      department,
      company,
      position,
      role,
      IBAN,
      SSN,
      SIN,
      IN,
      familyStatus,
      nationality,
      countryOfResidence,
      cityOrigins,
    } = req.body.formData;

    // Create user account
    const nddress= new Address(address);
    await nddress.save();
        // Create User profile
    const userprofile = new Userprofile({
      firstName,
      lastName,
      gender,
      dateOfBirth,
      nationalID,
      phone,
      address:nddress._id,
      hireDate,
      department,
      company,
      position,
      IBAN,
      SSN,
      SIN,
      IN,
      familyStatus,
      nationality,
      countryOfResidence,
      cityOrigins,
    });
    await userprofile.save();
    // Update the department to include the new position
     await Department.findByIdAndUpdate(
      department,
      { $addToSet: { userprofile: userprofile._id } },
      { new: true, useFindAndModify: false }
    );
    const userN = await userService.saveByEmailAndRole(email,role);
    userprofile.user=userN._id;
    await userprofile.save();
    res.status(200).json(userprofile);
  } catch (error) {
    next(error);
  }
});

// Update a User profile
router.patch('/:id',verifyToken, validateUserProfile, checkValidationResult, async (req, res, next) => {
  try {
    const userprofile = await Userprofile.findById(req.params.id);
    if (!userprofile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(userprofile, req.body);
    const updatedUserprofile = await userprofile.save();
    res.json(updatedUserprofile);
  } catch (error) {
    next(error);
  }
});

// Delete a User profile
router.delete('/:id', async (req, res, next) => {
  try {
    const userprofile = await Userprofile.findById(req.params.id);
    if (!userprofile) {
      const error = new Error('Profile not found');
      error.statusCode = 404;
      throw error;
    }

    await userprofile.remove();
    res.json({ message: 'Profile deleted' });
  } catch (error) {
    next(error);
  }
});
router.get('/getStats/:userId',verifyToken,async (req, res) => {
  try {
    const userProfile = await Userprofile.findOne({ user: req.params.userId })
      .populate({
        path: 'Shifts',
        match: {
          date: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        },
        options: { sort: { date: -1 } }
      });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    const currentDate = new Date();
    const upcomingShift = await Shift.findOne({
      userprofile: userProfile._id,
      status: 'scheduled',
      scheduledStartTime: { 
        $gt: currentDate 
      }
    })
    .sort({ scheduledStartTime: 1 }).populate('position');
    // Calculate weekly performance
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    // Get or create current week's performance record
    let weeklyPerformance = userProfile.weeklyPerformance.find(
      wp => wp.week === currentWeek && wp.year === currentYear
    );

    if (!weeklyPerformance) {
      weeklyPerformance = {
        week: currentWeek,
        year: currentYear,
        averageRating: 0,
        shiftsCompleted: 0,
        totalHours: 0,
        punctualityScore: 0,
        breakComplianceScore: 0,
        hoursCompletedScore: 0
      };
    }

    // Get current month stats
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthShifts = await Shift.find({
      userprofile: userProfile._id,
      date: { $gte: monthStart },
      status: 'completed'
    });

    const monthlyStats = monthShifts.reduce((acc, shift) => ({
      hoursWorked: acc.hoursWorked + (shift.actualHours || 0),
      earnedAmount: acc.earnedAmount + (shift.pay || 0),
      completedShifts: acc.completedShifts + 1
    }), { hoursWorked: 0, earnedAmount: 0, completedShifts: 0 });

    res.json({
      upcomingShift,
      weeklyPerformance,
      monthlyStats
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}


module.exports = router;