const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');


module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("Google login attempt", profile); 
            let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          } else {
            user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value
            });
            await user.save();
            return done(null, user);
          }
        } catch (err) {
          console.error(err);
          return done(err, null);
        }
      }
      ));
      
      passport.serializeUser((user, done) => {
      done(null, user.id);
      });
      
      passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
      });
      passport.session({
      secret:process.env.SESSION_SECRET ,
      resave: false,
      saveUninitialized: true,
      cookie:{maxAge:1000 * 60 * 60}
      });
};