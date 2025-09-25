const router = require('express').Router();

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Logged in as ${req.user.name}`);
  } else {
    res.send('Not logged in');
  }
});

router.get('/login', (req, res) => {
  res.redirect('/auth/github');
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: 'Session destruction failed' });
      res.clearCookie('connect.sid'); // Limpia la cookie de sesión
      res.redirect('/');
    });
  });
});

router.use('/users', require('./users'));
router.use('/products', require('./products'));

module.exports = router;