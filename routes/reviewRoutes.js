const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const review = new Review({ bookId, rating, comment, userId: req.user.id });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { bookId } = req.query;
    const query = bookId ? { bookId } : {};
    const reviews = await Review.find(query);
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { rating, comment }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found or unauthorized' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found or unauthorized' });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;