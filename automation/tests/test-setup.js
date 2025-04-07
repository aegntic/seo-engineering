const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const util = require('util');

const sleep = util.promisify(setTimeout);
let mongoServer;

async function testConnection(uri, maxRetries = 10, delay = 2000) {
  console.log(`Attempting to connect to MongoDB at ${uri}`);
  console.log('Available environment variables:', {
    MONGO_URL: process.env.MONGO_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    CI: process.env.CI
  });

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Connection attempt ${i + 1}/${maxRetries}`);
      await mongoose.connect(uri, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 10000
      });
      
      const pingResult = await mongoose.connection.db.admin().ping();
      console.log('MongoDB ping result:', pingResult);
      
      const dbStats = await mongoose.connection.db.stats();
      console.log('MongoDB connection stats:', {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        db: dbStats.db
      });

      return true;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      if (i < maxRetries - 1) {
        console.log(`Waiting ${delay}ms before next attempt...`);
        await sleep(delay);
      }
    }
  }
  console.error(`All ${maxRetries} connection attempts failed`);
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
