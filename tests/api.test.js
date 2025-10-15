const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/user');
const Book = require('../models/book');
const Review = require('../models/review');
const Author = require('../models/author');

describe('API Tests', () => {
  let token;
  let userId;
  let bookId;
  let reviewId;
  let authorId;

  beforeAll(async () => {
    // Use jest-mongodb to set up a test MongoDB instance
    // Connect to MongoDB (handled by jest-mongodb preset)
    await mongoose.connection.db.dropDatabase();

    // Create a test user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword' // In practice, this should be hashed
    });
    await user.save();
    userId = user._id;

    // Generate JWT token
    token = jwt.sign(
      { id: userId, role: 'user' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // Create a test book
    const book = new Book({
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Fiction'
    });
    await book.save();
    bookId = book._id;

    // Create a test review
    const review = new Review({
      bookId,
      userId,
      rating: 4,
      comment: 'Great book!'
    });
    await review.save();
    reviewId = review._id;

    // Create a test author
    const author = new Author({
      firstName: 'John',
      lastName: 'Doe',
      birthDate: new Date('1970-01-01'),
      nationality: 'American',
      biography: 'Test author biography',
      website: 'http://example.com',
      awards: ['Pulitzer']
    });
    await author.save();
    authorId = author._id;
  });

  afterAll(async () => {
    // Clean up database and close connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Users API', () => {
    test('GET /users should return all users', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('username', 'testuser');
    });

    test('GET /users/:id should return a user by ID', async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('_id', userId.toString());
    });
  });

  describe('Books API', () => {
    test('GET /books should return all books', async () => {
      const response = await request(app).get('/books');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title', 'Test Book');
    });

    test('GET /books/:id should return a book by ID', async () => {
      const response = await request(app).get(`/books/${bookId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Test Book');
      expect(response.body).toHaveProperty('_id', bookId.toString());
    });
  });

  describe('Reviews API', () => {
    test('GET /reviews should return all reviews', async () => {
      const response = await request(app).get('/reviews');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('rating', 4);
    });

    test('GET /reviews/:id should return a review by ID', async () => {
      const response = await request(app).get(`/reviews/${reviewId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rating', 4);
      expect(response.body).toHaveProperty('_id', reviewId.toString());
    });
  });

  describe('Authors API', () => {
    test('GET /authors should return all authors', async () => {
      const response = await request(app).get('/authors');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('firstName', 'John');
    });

    test('GET /authors/:id should return an author by ID', async () => {
      const response = await request(app).get(`/authors/${authorId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('_id', authorId.toString());
    });
  });
});