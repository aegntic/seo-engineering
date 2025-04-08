const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('Authentication Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@seo.engineering',
        password: 'StrongPassword123!',
        name: 'Test User'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should login existing user', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'login@seo.engineering',
        password: 'LoginPassword123!',
        name: 'Login User'
      });

    // Then try to log in
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@seo.engineering',
        password: 'LoginPassword123!'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should reject invalid login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@seo.engineering',
        password: 'WrongPassword'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
