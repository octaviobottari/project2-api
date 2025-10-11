const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://cse-341-project1-qz6j.onrender.com/auth/github/callback'
    : 'http://localhost:3000/auth/github/callback',
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub profile received:', profile);
    
    // Check if user exists with this GitHub ID
    let user = await User.findOne({ githubId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with the same email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email: email });
      if (user) {
        // Link GitHub account to existing user
        user.githubId = profile.id;
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user
    const username = profile.username || `githubuser${profile.id}`;
    const newUser = new User({
      username: username,
      email: email || `${username}@github.com`,
      githubId: profile.id,
      password: 'github-auth' 
    });
    
    await newUser.save();
    console.log('New user created via GitHub:', newUser.username);
    return done(null, newUser);
    
  } catch (error) {
    console.error('Passport GitHub strategy error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});