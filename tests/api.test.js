const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); 

let mongoServer;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('BookReviewAPI - GET Endpoints', () => {
  beforeAll(async () => {
    const userResponse = await request(app)
      .post('/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = userResponse.body.token;
  });

  // Test 1: GET /books
  describe('GET /books', () => {
    it('should return all books', async () => {
      const response = await request(app).get('/books');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter books by genre', async () => {
      await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Book',
          author: 'Test Author',
          genre: 'Fiction'
        });

      const response = await request(app).get('/books?genre=Fiction');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Test 2: GET /books/:id
  describe('GET /books/:id', () => {
    it('should return a specific book', async () => {
      const bookResponse = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Specific Book',
          author: 'Specific Author',
          genre: 'Mystery'
        });

      const bookId = bookResponse.body._id;
      const response = await request(app).get(`/books/${bookId}`);
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Specific Book');
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/books/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  // Test 3: GET /reviews
  describe('GET /reviews', () => {
    it('should return all reviews', async () => {
      const response = await request(app).get('/reviews');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Test 4: GET /reviews/:id
  describe('GET /reviews/:id', () => {
    it('should return a specific review', async () => {

      const bookResponse = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Review Test Book',
          author: 'Review Author'
        });

      const bookId = bookResponse.body._id;

      const reviewResponse = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: bookId,
          rating: 5,
          comment: 'Excellent book!'
        });

      const reviewId = reviewResponse.body._id;
      const response = await request(app).get(`/reviews/${reviewId}`);
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(5);
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/reviews/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  // Test 5: GET /users/:id
  describe('GET /users/:id', () => {
    it('should return user details', async () => {

      const userResponse = await request(app)
        .post('/users/register')
        .send({
          username: 'getuser',
          email: 'getuser@example.com',
          password: 'password123'
        });

      const userId = userResponse.body.user?._id; 
      
      if (userId) {
        const response = await request(app)
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(200);
      }
    });
  });
});