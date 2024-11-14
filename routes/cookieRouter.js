const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');


// Add a new route to set cookie consent with additional data
router.post('/cookie-consent', (req, res) => {
    const { 
        consent,
        consentDate,
        locale,
        timezone,
        theme,
        deviceType,
        screenResolution,
        browser,
        accessibilitySettings,
        preferredLanguage
      } = req.body;
      
      const consentData = {
        consent,
        consentDate,
        locale,
        timezone,
        theme,
        deviceType,
        screenResolution,
        browser,
        accessibilitySettings,
        lastVisit: moment().tz(timezone).format(), // Use moment-timezone
        country: req.headers['cf-ipcountry'] || 'Unknown', // If you're using Cloudflare
        preferredLanguage
      };
      
      res.cookie('userPreferences', JSON.stringify(consentData), {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    
      res.status(200).json({ message: 'User preferences saved', data: consentData });
    });
    module.exports = router;