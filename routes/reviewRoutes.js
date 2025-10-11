const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const authMiddleware = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

router.post('/', authMiddleware, [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment too long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const { bookId, rating, comment } = req.body;
    const review = new Review({ bookId, rating, comment, userId: req.user.id });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', [
  query('bookId').optional().isMongoId().withMessage('Invalid book ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const { bookId } = req.query;
    const query = bookId ? { bookId } : {};
    const reviews = await Review.find(query).populate('userId', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid review ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const review = await Review.findById(req.params.id).populate('userId', 'username');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment too long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, 
      { rating, comment }, 
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found or unauthorized' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid review ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found or unauthorized' });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;