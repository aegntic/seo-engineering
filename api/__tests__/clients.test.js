const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const Client = require('../src/models/Client');
const User = require('../src/models/User');

describe('Client Management Routes', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections
    await Client.deleteMany({});
    await User.deleteMany({});

    // Register a test user and get token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'client.test@seo.engineering',
        password: 'TestPassword123!',
        name: 'Client Test User'
      });

    authToken = userResponse.body.token;
    userId = userResponse.body.user._id;
  });

  it('should create a new client', async () => {
    const response = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Client',
        domain: 'testclient.com',
        email: 'client@testclient.com'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Test Client');
  });

  it('should retrieve client details', async () => {
    // First create a client
    const createResponse = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Retrieve Client',
        domain: 'retrieveclient.com',
        email: 'retrieve@testclient.com'
      });

    const clientId = createResponse.body._id;

    // Now retrieve the client
    const response = await request(app)
      .get(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Retrieve Client');
  });

  it('should update client details', async () => {
    // First create a client
    const createResponse = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Update Client',
        domain: 'updateclient.com',
        email: 'update@testclient.com'
      });

    const clientId = createResponse.body._id;

    // Now update the client
    const response = await request(app)
      .put(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Client Name',
        domain: 'updateclient.com'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Updated Client Name');
  });
});
