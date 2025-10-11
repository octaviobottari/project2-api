const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://cse-341-project1-qz6j.onrender.com/auth/github/callback'
    : 'http://localhost:3000/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
 
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = new User({
        githubId: profile.id,
        username: profile.username,
        email: profile.emails[0]?.value || `${profile.username}@github.com`,
        githubProfile: profile
      });
      await user.save();
    }
   
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token; 
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;