/**
 * Models initialization
 */

const mongoose = require('mongoose');

// Import all models to ensure they are registered with mongoose
try {
  require('./Client'); // This uses ClientAgency as model name internally
  console.log('Loaded Client.js');
  require('./client.model');
  console.log('Loaded client.model.js');
  require('./user.model');
  console.log('Loaded user.model.js');
  require('./report.model');
  console.log('Loaded report.model.js');
  require('./seocheck.model');
  console.log('Loaded seocheck.model.js');
  require('./Agency');
  console.log('Loaded Agency.js');
  require('./AgencyUser');
  console.log('Loaded AgencyUser.js');
  require('./Role');
  console.log('Loaded Role.js');
  require('./Payment');
  console.log('Loaded Payment.js');
  require('./WebhookSubscription');
  console.log('Loaded WebhookSubscription.js');
  require('./WebhookDelivery');
  console.log('Loaded WebhookDelivery.js');
} catch (err) {
  console.error('Error loading model files:', err);
}

// Define schemas
const SystemInfoSchema = new mongoose.Schema({
  name: String,
  version: String,
  initialized: Date,
  status: String
});

// Create models
const SystemInfo = mongoose.model('SystemInfo', SystemInfoSchema);

// Initialization function
const initializeModels = async () => {
  console.log('Initializing models...');
  
  // Create basic system info
  try {
    // Check if we need to create initial data
    const count = await SystemInfo.countDocuments();
    if (count === 0) {
      await new SystemInfo({
        name: 'SEO.engineering',
        version: '1.0.0',
        initialized: new Date(),
        status: 'active'
      }).save();
      console.log('System info initialized');
    } else {
      console.log('System info already exists');
    }
  } catch (err) {
    console.error('Error initializing models:', err);
  }
};

module.exports = {
  initializeModels,
  SystemInfo
};
