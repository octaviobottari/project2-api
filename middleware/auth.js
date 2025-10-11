const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  
  if (req.user && req.user._id) {
    req.user = { id: req.user._id, role: 'user' }; 
    return next();
  }
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};