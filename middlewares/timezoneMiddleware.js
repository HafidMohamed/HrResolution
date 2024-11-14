const moment = require('moment-timezone');

function timezoneMiddleware(req, res, next) {
    let timezone ; // Default timezone
    let preferredLanguage;
    if (req.cookies && req.cookies.userPreferences) {
      try {
        const userPreferences = JSON.parse(req.cookies.userPreferences);
        timezone = userPreferences.timezone;
        preferredLanguage=userPreferences.preferredLanguage;
      } catch (error) {
        console.error('Error parsing userPreferences cookie:', error);
      }
    }

    // Set timezone on the request object
    req.userTimezone = timezone;
    req.preferredLanguage=preferredLanguage;
    // Set a helper function to get the current time in the user's timezone
    req.getUserTime = () => moment().tz(timezone);
    console.log('User timezone:', req.userTimezone);

    next();
}

module.exports = timezoneMiddleware;