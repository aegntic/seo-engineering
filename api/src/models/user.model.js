/**
 * User model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
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
    required: true,
    minlength: 8
  },
  companyName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  refreshToken: {
    type: String,
    default: null
  },
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }],
  stripeCustomerId: {
    type: String,
    default: null
  },
  plan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise', 'free'],
    default: 'free'
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  planFeatures: {
    maxSites: {
      type: Number,
      default: 1
    },
    maxScansPerMonth: {
      type: Number,
      default: 5
    },
    advancedReporting: {
      type: Boolean,
      default: false
    },
    automatedFixes: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it's modified
  if (!user.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;