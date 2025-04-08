const request = require('supertest');
const app = require('../src/server');

describe('Health Check Endpoint', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
