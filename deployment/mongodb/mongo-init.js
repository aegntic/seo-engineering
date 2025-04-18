// MongoDB initialization script

// Create database and admin user
db = db.getSiblingDB('admin');
const adminPassword = process.env.MONGO_ADMIN_PASSWORD || 'default_password_for_development';
db.auth('admin', adminPassword);

// Create seo_engineering database
db = db.getSiblingDB('seo_engineering');

// Set up application-specific collections
db.createCollection('clients');
db.createCollection('users');
db.createCollection('reports');
db.createCollection('seochecks');
db.createCollection('agencies');
db.createCollection('agencyusers');
db.createCollection('roles');
db.createCollection('payments');
db.createCollection('webhooksubscriptions');
db.createCollection('webhookdeliveries');
db.createCollection('systeminfo');

// Create system info record
db.systeminfo.insertOne({
  version: '1.0.0',
  initialized: new Date(),
  status: 'active'
});

print('MongoDB initialization completed successfully');
