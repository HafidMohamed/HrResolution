const User = require('../models/User');
const Role = require('../models/Role');

const verifyPermission = async (req, res, next) => {
  try {
    const creatorId = req.body.formData.user; // Assuming you have authentication middleware that adds user to req
    const creator = await User.findById(creatorId).populate('role');
    const newUserRole = req.body.role; // Assuming the new user's role is sent in the request body

    if (!creator || !creator.role) {
      return res.status(403).json({ message: 'Creator not found or role not assigned' });
    }

    const creatorRole = creator.role.name;
    const newRole = await Role.findById(newUserRole);

    if (!newRole) {
      return res.status(400).json({ message: 'Invalid role for new user' });
    }

    const newRoleName = newRole.name;

    // Check permissions based on role hierarchy
    switch (creatorRole) {
      case 'Owner':
        // Owner can create any account
        return next();
      case 'Admin':
        if (['Admin', 'Customer Company Owner'].includes(newRoleName)) {
          return next();
        }
        break;
      case 'Customer Company Owner':
        if (['Department Manager'].includes(newRoleName)) {
          return next();
        }
        break;
      case 'Department_Manager':
        if (['Shift Manager'].includes(newRoleName)) {
          return next();
        }
        break;
      case 'Shift Manager':
        if (['Employee'].includes(newRoleName)) {
          return next();
        }
        break;
      default:
        break;
    }

    // If we reach here, the creator doesn't have permission
    return res.status(403).json({ message: 'You do not have permission to create this type of user account' });

  } catch (error) {
    console.error('Error in verifyPermission middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = verifyPermission;