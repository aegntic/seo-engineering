const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

/**
 * AgencyUser Schema
 * Represents a user associated with an agency (staff or client)
 */
const AgencyUserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'specialist', 'viewer', 'client'],
    default: 'viewer'
  },
  roleCustom: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'invited', 'suspended'],
    default: 'invited'
  },
  clients: [{
    type: Schema.Types.ObjectId,
    ref: 'Client'
  }],
  permissions: {
    dashboard: {
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: false }
    },
    reports: {
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: false },
      create: { type: Boolean, default: false }
    },
    settings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false }
    },
    clients: {
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    users: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    billing: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: Date,
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'AgencyUser'
  },
  invitedAt: Date,
  inviteToken: String,
  inviteTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Pre-save hook to hash password and update timestamps
AgencyUserSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();

  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for authentication
AgencyUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
AgencyUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('AgencyUser', AgencyUserSchema);