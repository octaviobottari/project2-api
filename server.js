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
  const passport = require('./config/passport'); // Ensure this is correct
  require('dotenv').config(); 

  console.log("Loaded DB_URI:", process.env.DB_URI);

  const app = express();
  app.use(express.json());
  app.use(helmet());

  // Trust proxy for Render
  app.set('trust proxy', true);

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // DbConnection class
  class DbConnection {
    static async connect(connectionString = process.env.DB_URI || "") {
      let status = 0;
      try {
        await mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("[CONNECTION TO DB SUCCESSFUL]");
        return status;
      } catch (e) {
        console.error("[MONGOOSE CONNECTION ERROR]:", "Invalid connection string", e);
        return status;
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

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // OAuth Routes
  app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
  app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }), 
    (req, res) => {
      if (req.user.token) {
        res.redirect(`/?token=${req.user.token}`);
      } else {
        res.redirect('/login');
      }
    }
  );

  // Logout
  app.get('/logout', (req, res) => {
    req.logout((err) => { if (err) return next(err); });
    req.session.destroy();
    res.redirect('/');
  });

  // Routes
  app.use('/users', userRoutes);
  app.use('/books', bookRoutes);
  app.use('/reviews', reviewRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));