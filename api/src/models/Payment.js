const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  stripeSubscriptionId: {
    type: String
  },
  plan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'unpaid', 'trialing'],
    default: 'active'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String
  },
  invoices: [{
    invoiceId: String,
    amount: Number,
    status: String,
    date: Date,
    pdfUrl: String
  }],
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

// Index for efficient queries
paymentSchema.index({ user: 1 });
paymentSchema.index({ stripeCustomerId: 1 });
paymentSchema.index({ stripeSubscriptionId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;