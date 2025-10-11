const express = require('express');
    const router = express.Router();
    const Book = require('../models/book');
    const authMiddleware = require('../middleware/auth');
    const { body, param, query, validationResult } = require('express-validator');

    router.post('/', authMiddleware, [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('author').trim().notEmpty().withMessage('Author is required'),
      body('genre').optional().trim(),
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const { title, author, genre } = req.body;
        const book = new Book({ title, author, genre });
        await book.save();
        res.status(201).json(book);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    router.get('/', [
      query('genre').optional().trim(),
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const { genre } = req.query;
        const query = genre ? { genre } : {};
        const books = await Book.find(query);
        res.json(books);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    router.get('/:id', [
      param('id').isMongoId().withMessage('Invalid book ID'),
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    router.put('/:id', authMiddleware, [
      param('id').isMongoId().withMessage('Invalid book ID'),
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('author').trim().notEmpty().withMessage('Author is required'),
      body('genre').optional().trim(),
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const { title, author, genre } = req.body;
        const book = await Book.findByIdAndUpdate(req.params.id, { title, author, genre }, { new: true });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    router.delete('/:id', authMiddleware, [
      param('id').isMongoId().withMessage('Invalid book ID'),
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ message: 'Book deleted' });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    module.exports = router;