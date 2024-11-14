// controllers/userprofileController.js
const Userprofile = require('../models/Userprofile');
const User = require('../models/User');
const { createUserAccount } = require('../utils/userAccountCreation');
const sendEmail = require('../utils/sendEmail');

exports.createUserprofile= async (req, res) => {
  try {
    const {
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
      employmentStatus
    } = req.body;

    // Create user account
    const { user, temporaryPassword } = await createUserAccount(email);

    // Create User profile
    const userprofile = new Userprofile({
      user: user._id,
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
      employmentStatus
    });

    await userprofile.save();

    // Send email to the new User profile
    await sendEmail(email, 'Your New Account', `
      Your account has been created. 
      Username: ${user.username}
      Temporary Password: ${temporaryPassword}
      Please log in and change your password.
    `);

    res.status(201).json({ message: 'Profile created successfully', userprofileId: eserprofile._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating User profile', error: error.message });
  }
};