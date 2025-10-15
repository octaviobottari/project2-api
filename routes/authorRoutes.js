const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const authMiddleware = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

router.post('/', authMiddleware, [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('birthDate').isDate().withMessage('Valid birth date is required'),
  body('nationality').trim().notEmpty().withMessage('Nationality is required'),
  body('biography').trim().notEmpty().withMessage('Biography is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('awards').optional().isArray().withMessage('Awards must be an array')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { firstName, lastName, birthDate, nationality, biography, website, awards } = req.body;
    const author = new Author({ firstName, lastName, birthDate, nationality, biography, website, awards });
    await author.save();
    res.status(201).json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', [
  query('nationality').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { nationality } = req.query;
    const query = nationality ? { nationality } : {};
    const authors = await Author.find(query);
    res.json(authors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid author ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid author ID'),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('birthDate').optional().isDate().withMessage('Valid birth date is required'),
  body('nationality').optional().trim().notEmpty().withMessage('Nationality cannot be empty'),
  body('biography').optional().trim().notEmpty().withMessage('Biography cannot be empty'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('awards').optional().isArray().withMessage('Awards must be an array')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { firstName, lastName, birthDate, nationality, biography, website, awards } = req.body;
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, birthDate, nationality, biography, website, awards },
      { new: true }
    );
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid author ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json({ message: 'Author deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;