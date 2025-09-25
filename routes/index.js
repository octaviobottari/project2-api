const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('Hello World');
});
router.get('/login', (req, res) => {
  res.redirect('/auth/github');
});
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy();
    res.redirect('/');
  });
});
router.use('/users', require('./users'));
router.use('/products', require('./products'));

module.exports = router;