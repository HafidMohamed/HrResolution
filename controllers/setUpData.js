const express = require('express');
const router = express.Router();
const Userprofile = require('../models/Userprofile');
const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const Position = require('../models/Position');

router.post('/setUpCostumerSchedule/:id',verifyToken, async (req, res, next) => {

    const reqData=req.body;
   
    try {
        const user = await User.findById(reqData.id).populate('role');
        if (!user) {
          throw new Error('User not found');
        }
    
        const userprofile = await Userprofile.findOne({ user: user._id })
        .select('firstName lastName position')
        .populate('position')
        .exec();
    
        // Get the IDs of the roles to exclude
        const excludedRoles = await Role.find({ name: { $in: ['department_manager', 'shift_manager'] } }).select('_id');
        const excludedRoleIds = excludedRoles.map(role => role._id);
    
        let data = {};
    
        switch (user.role.name) {
          case 'Owner':
          case 'Admin': {
    
            if (reqData.departmentId) {
              const positions = await Position.find({ department: reqData.departmentId });
              const userprofiles = await Userprofile.find({ 
                department: reqData.departmentId,
                user: { $nin: await User.find({ role: { $in: ['Customer_Company_Owner'] } }).select('_id') }
              })
                .select('firstName lastName position')
                .populate('position');
    
              data = {
                positions,
                userprofiles,
              };
            } 
            break;
          }
          case 'customer_company_owner': {
    
            if (reqData.departmentId) {
              const positions = await Position.find({ department: reqData.departmentId });
              const userprofiles = await Userprofile.find({ 
                department: reqData.departmentId,
                _id: { $ne: userprofile._id },
                user: { $nin: await User.find({ role: { $in: ['customer_company_owner'] } }).select('_id') }
              })
                .select('firstName lastName position')
                .populate('position');
    
              data = {
                positions,
                userprofiles
              };
            } 
            break;
          }
          case 'department_manager':
          case 'shift_manager': {
            const positions = await Position.find({ department: userprofile.department });
            const userprofiles = await Userprofile.find({ 
              department: userprofile.department,
              _id: { $ne: userprofile._id },
              user: { $nin: await User.find({ role: { $in:['customer_company_owner', 'department_manager', 'shift_manager'] } }).select('_id') }
            })
              .select('firstName lastName position')
              .populate('position');
    
            data = {
              positions,
              userprofiles
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