const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authMiddleware = require('./middleware/auth');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
require('dotenv').config();

console.log("Loaded DB_URI:", process.env.DB_URI);

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);

app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
class DbConnection {
  static async connect(connectionString = process.env.DB_URI || "") {
    try {
      await mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("[CONNECTION TO DB SUCCESSFUL]");
      return true;
    } catch (e) {
      console.error("[MONGOOSE CONNECTION ERROR]:", e.message);
      return false;
    }
  }
}

// Connect to MongoDB
DbConnection.connect();

// Event listeners for connection status
mongoose.connection.on("error", (err) => {
  console.error("[DATABASE ERROR]:", err);
});
mongoose.connection.on("connected", () => {
  console.log("DbConnection Successful");
});

// Simple OAuth routes for testing
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/login-error',
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: req.user._id, username: req.user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      // Redirect with token in URL (for easy testing)
      res.redirect(`/?token=${token}&user=${req.user.username}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect('/login-error');
    }
  }
);

// Simple login success/error pages
app.get('/login-success', (req, res) => {
  res.json({ message: 'Login successful! Check URL for token.' });
});

app.get('/login-error', (req, res) => {
  res.status(401).json({ error: 'GitHub authentication failed' });
});

// Simple home route to show token
app.get('/', (req, res) => {
  const token = req.query.token;
  if (token) {
    res.json({
      message: 'Authentication successful!',
      token: token,
      instructions: 'Use this token in Swagger UI or Postman with "Bearer TOKEN"'
    });
  } else {
    res.json({
      message: 'BookReviewAPI is running!',
      endpoints: {
        docs: '/api-docs',
        githubLogin: '/auth/github',
        register: 'POST /users/register',
        login: 'POST /users/login'
      }
    });
  }
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`GitHub OAuth: http://localhost:${PORT}/auth/github`);
});