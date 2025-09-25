const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const GitHubStrategy = require('passport-github2').Strategy;
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Please log in' });
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Project 2 API', version: '1.0.0' },
    components: {
      securitySchemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://github.com/login/oauth/authorize',
              tokenUrl: 'https://github.com/login/oauth/access_token',
              scopes: {}
            }
          }
        }
      }
    },
    security: [{ OAuth2: [] }],
  },
  apis: ['./routes/*.js'],
};
const specs = swaggerJsdoc(options);

app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    dbName: 'project2db',
    collectionName: 'sessions'
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({ methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], origin: '*' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Proteger /api-docs
app.use('/api-docs', isAuthenticated, swaggerUi.serve, swaggerUi.setup(specs));
app.use('/', require('./routes'));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const db = mongodb.getDatabase();
    let user = await db.collection('users').findOne({ githubId: profile.id });
    if (!user) {
      user = {
        githubId: profile.id,
        name: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value || '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        profilePicture: profile.photos?.[0]?.value || '',
        provider: 'github'
      };
      await db.collection('users').insertOne(user);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/github/callback', passport.authenticate('github', { failureRedirect: '/api-docs' }), (req, res) => {
  req.session.user = req.user;
  res.redirect('/');
});

mongodb.initDb((err) => {
  if (err) {
    console.log('Database initialization error:', err);
  } else {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
});