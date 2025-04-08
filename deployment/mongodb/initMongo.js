// Basic MongoDB initialization script
const adminPassword = process.env.MONGO_ADMIN_PASSWORD || 'default_password_for_development';
db.auth('admin', adminPassword);

// Switch to the seo_engineering database
db = db.getSiblingDB('seo_engineering');

// Create application user
const appPassword = process.env.MONGO_APP_PASSWORD || 'default_password_for_development';
db.createUser({
  user: 'app_user',
  pwd: appPassword,
  roles: [
    { role: 'readWrite', db: 'seo_engineering' }
  ]
});

// Create a sample collection
db.createCollection('system_info');
db.system_info.insertOne({
  name: 'SEO.engineering',
  initialized: new Date(),
  status: 'active'
});

print('MongoDB initialized successfully');
