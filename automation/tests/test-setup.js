// automation/tests/test-setup.js

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

before(async function () {
  if (process.env.CI === 'true') {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    console.log('[CI] Started in-memory MongoDB at', uri);
  }
});

after(async function () {
  if (mongoServer) {
    await mongoServer.stop();
    console.log('[CI] Stopped in-memory MongoDB');
  }
});
