const request = require('supertest');
const app = require('../server'); 

describe('Server Basic Tests', () => {
  it('should return API information on root route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();
  });

  it('should serve Swagger documentation', async () => {
    const response = await request(app).get('/api-docs');
    expect(response.status).toBe(200);
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });
});