require('dotenv').config({ path: '.env.test' });

// Global configuration
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
};

// Setup global error catching
beforeAll(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  if (console.error.mock.calls.length > 0 || console.warn.mock.calls.length > 0) {
    console.error('Unexpected console errors or warnings:', 
      console.error.mock.calls, 
      console.warn.mock.calls
    );
  }
});

// Optional: Add global testing utilities if needed
global.generateTestUser = async () => {
  const request = require('supertest');
  const app = require('./src/server');
  
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: `test_${Date.now()}@seo.engineering`,
      password: 'TestPassword123!',
      name: 'Test User'
    });
  
  return userResponse.body;
};
