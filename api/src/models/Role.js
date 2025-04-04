const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Role Schema
 * Represents a custom role that can be assigned to agency users
 */
const RoleSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  agency: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isSystemDefined: {
    type: Boolean,
    default: false
  },
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
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'AgencyUser'
  }
}, { timestamps: true });

// Create index for efficient role lookup by agency
RoleSchema.index({ agency: 1, name: 1 }, { unique: true });

// Pre-save hook to update timestamps
RoleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Role', RoleSchema);