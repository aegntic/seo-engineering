const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const util = require('util');

const sleep = util.promisify(setTimeout);
let mongoServer;

async function testConnection(uri, maxRetries = 5, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(uri, {connectTimeoutMS: 5000});
      await mongoose.connection.db.admin().ping();
      console.log('Successfully connected to MongoDB at', uri);
      return true;
    } catch (err) {
      console.warn(`Connection attempt ${i + 1} failed:`, err.message);
      if (i < maxRetries - 1) await sleep(delay);
    }
  }
  return false;
}

before(async function () {
  // Prefer real MongoDB if URL is provided
  if (process.env.MONGO_URL) {
    console.log('Using provided MongoDB at', process.env.MONGO_URL);
    if (!await testConnection(process.env.MONGO_URL)) {
      throw new Error('Failed to connect to provided MongoDB');
    }
  } 
  // Fall back to in-memory MongoDB if no URL provided or in CI
  else if (process.env.CI === 'true') {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    console.log('[CI] Started in-memory MongoDB at', uri);
    if (!await testConnection(uri)) {
      throw new Error('Failed to connect to in-memory MongoDB');
    }
  }
});

after(async function () {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('[CI] Stopped in-memory MongoDB');
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
});
