const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const Client = require('../src/models/Client');
const Scan = require('../src/models/Scan');
const User = require('../src/models/User');

describe('SEO Scan Routes', () => {
  let authToken;
  let clientId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections
    await Scan.deleteMany({});
    await Client.deleteMany({});
    await User.deleteMany({});

    // Register user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'scan.test@seo.engineering',
        password: 'TestPassword123!',
        name: 'Scan Test User'
      });

    authToken = userResponse.body.token;

    // Create test client
    const clientResponse = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Scan Test Client',
        domain: 'scantest.com',
        email: 'client@scantest.com'
      });

    clientId = clientResponse.body._id;
  });

  it('should initiate a new SEO scan', async () => {
    const response = await request(app)
      .post('/api/scans')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId: clientId,
        scanType: 'full',
        priority: 'high'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.status).toBe('queued');
  });

  it('should retrieve scan results', async () => {
    // First, create a scan
    const scanResponse = await request(app)
      .post('/api/scans')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId: clientId,
        scanType: 'technical',
        priority: 'medium'
      });

    const scanId = scanResponse.body._id;

    // Simulate scan completion (in real-world, this would be handled by background job)
    await Scan.findByIdAndUpdate(scanId, { 
      status: 'completed', 
      results: { 
        technicalScore: 85, 
        issues: ['low page speed', 'missing meta tags'] 
      }
    });

    // Retrieve scan results
    const response = await request(app)
      .get(`/api/scans/${scanId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('completed');
    expect(response.body.results).toHaveProperty('technicalScore');
  });
});
