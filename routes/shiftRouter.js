const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Userprofile= require('../models/Userprofile');
const { generateToken, verifyToken } = require('../utils/jwtUtils');
const verifyPermition = require('../middlewares/verifyPermission');
const User = require('../models/User');


router.get('/getShifts/:id', verifyToken, async (req, res, next) => {
    try {
        console.log(req.params.id);
      const data = await Userprofile.findOne({ user: req.params.id }).select('Shifts').populate({ 
        path: 'Shifts',
        populate: { 
          path: 'position' }
      });
      console.log(data);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in /saveSchedule route:', error);
      res.status(500).json({ message: 'Error saving schedule', error: error.message });
    }
});
module.exports = router;