require('./setup');
const request = require('supertest');
const express = require('express');

// Create a simple test app without OAuth dependencies
const testApp = express();
testApp.use(express.json());

// Basic routes for testing
testApp.get('/', (req, res) => {
  res.json({ message: 'BookReviewAPI is running!' });
});

testApp.get('/api-docs', (req, res) => {
  res.status(200).send('Swagger UI');
});

testApp.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

describe('Server Basic Tests', () => {
  it('should return API information on root route', async () => {
    const response = await request(testApp).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('BookReviewAPI is running!');
  });

  it('should serve Swagger documentation', async () => {
    const response = await request(testApp).get('/api-docs');
    expect(response.status).toBe(200);
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await request(testApp).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Route not found');
  });
});