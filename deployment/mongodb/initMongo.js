// Basic MongoDB initialization script
db.auth('admin', 'F0ujdluYOVCCDX7N');

// Switch to the seo_engineering database
db = db.getSiblingDB('seo_engineering');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'F0ujdluYOVCCDX7N',
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
