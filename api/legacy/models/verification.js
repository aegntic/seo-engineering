/**
 * Verification Database Schema
 * 
 * Defines the MongoDB schema for storing verification results
 * and related entities in the database.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Comparison Metric Schema
 * Represents a single metric comparing before and after states
 */
const ComparisonMetricSchema = new Schema({
  name: { type: String, required: true },
  beforeValue: { type: Schema.Types.Mixed, required: true },
  afterValue: { type: Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  absoluteChange: { type: Number },
  percentageChange: { type: Number },
  improved: { type: Boolean },
  meetsThreshold: { type: Boolean },
  higherIsBetter: { type: Boolean, default: true },
  threshold: { type: Number, default: 0 }
});

/**
 * Strategy Result Schema
 * Represents the result of a single verification strategy
 */
const StrategyResultSchema = new Schema({
  name: { type: String, required: true },
  success: { type: Boolean, required: true },
  message: { type: String },
  metrics: [ComparisonMetricSchema],
  improvementPercentage: { type: Number },
  tests: [{
    name: { type: String },
    description: { type: String },
    passed: { type: Boolean },
    duration: { type: Number },
    critical: { type: Boolean },
    details: { type: Schema.Types.Mixed }
  }],
  comparisons: [{
    url: { type: String },
    device: { type: String },
    viewport: {
      width: { type: Number },
      height: { type: Number }
    },
    beforePath: { type: String },
    afterPath: { type: String },
    diffPath: { type: String },
    differencePercentage: { type: Number },
    matchPercentage: { type: Number },
    diffPixels: { type: Number },
    totalPixels: { type: Number },
    passed: { type: Boolean }
  }]
});

/**
 * Fix Result Schema
 * Represents the verification result for a specific fix
 */
const FixResultSchema = new Schema({
  fixId: { type: String, required: true },
  fixType: { type: String, required: true },
  success: { type: Boolean, required: true },
  strategyResults: { type: Map, of: StrategyResultSchema },
  timestamp: { type: Date, default: Date.now }
});

/**
 * Summary Schema
 * Represents summary statistics for a verification result
 */
const SummarySchema = new Schema({
  totalFixes: { type: Number, required: true },
  successfulFixes: { type: Number, required: true },
  failedFixes: { type: Number, required: true },
  successRate: { type: Number, required: true },
  averageImprovementPercentage: { type: Number, default: 0 }
});

/**
 * Verification Schema
 * Represents a complete verification operation for a site
 */
const VerificationSchema = new Schema({
  siteId: { type: String, required: true, index: true },
  success: { type: Boolean, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  summary: { type: SummarySchema, required: true },
  fixes: [FixResultSchema],
  metrics: { type: Schema.Types.Mixed },
  error: {
    message: { type: String },
    stack: { type: String }
  },
  scheduled: { type: Boolean, default: false },
  retryCount: { type: Number, default: 0 },
  duration: { type: Number }, // Duration in milliseconds
  triggerType: {
    type: String,
    enum: ['scheduled', 'manual', 'api', 'webhook'],
    default: 'manual'
  },
  triggeredBy: { type: String } // User ID or system identifier
});

/**
 * Fix Verification Schema
 * Represents a verification operation for a specific fix
 */
const FixVerificationSchema = new Schema({
  siteId: { type: String, required: true, index: true },
  fixId: { type: String, required: true, index: true },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  strategyResults: { type: Map, of: StrategyResultSchema },
  error: {
    message: { type: String },
    stack: { type: String }
  },
  duration: { type: Number }, // Duration in milliseconds
  triggerType: {
    type: String,
    enum: ['scheduled', 'manual', 'api', 'webhook'],
    default: 'manual'
  },
  triggeredBy: { type: String } // User ID or system identifier
});

/**
 * Screenshot Schema
 * Represents a screenshot taken during verification
 */
const ScreenshotSchema = new Schema({
  verificationId: { type: Schema.Types.ObjectId, ref: 'Verification', index: true },
  fixId: { type: String },
  url: { type: String, required: true },
  device: { type: String, required: true },
  viewport: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  type: { 
    type: String, 
    enum: ['before', 'after', 'diff'], 
    required: true 
  },
  path: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed }
});

/**
 * Verification Schedule Schema
 * Represents a scheduled verification for a site
 */
const VerificationScheduleSchema = new Schema({
  siteId: { type: String, required: true, unique: true },
  cronExpression: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  lastRun: { type: Date },
  nextRun: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
VerificationSchema.index({ siteId: 1, timestamp: -1 });
FixVerificationSchema.index({ siteId: 1, fixId: 1, timestamp: -1 });
ScreenshotSchema.index({ verificationId: 1, type: 1 });

// Add pre-save hooks
VerificationSchema.pre('save', function(next) {
  // Calculate summary if not provided
  if (!this.summary) {
    this.summary = calculateSummary(this.fixes);
  }
  next();
});

VerificationScheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Define methods
VerificationSchema.methods.toClientFormat = function() {
  const result = this.toObject();
  
  // Format timestamps
  result.timestamp = result.timestamp.toISOString();
  
  // Format summary percentages
  result.summary.successRate = `${result.summary.successRate.toFixed(1)}%`;
  result.summary.averageImprovement = `${result.summary.averageImprovementPercentage.toFixed(1)}%`;
  
  // Format fixes for client consumption
  result.fixes = result.fixes.map(fix => ({
    type: fix.fixType,
    success: fix.success,
    improvementPercentage: getFixImprovementPercentage(fix),
    strategies: Object.keys(fix.strategyResults || {}).map(strategy => ({
      name: strategy,
      success: fix.strategyResults.get(strategy).success
    })),
    details: getFixDetails(fix)
  }));
  
  return result;
};

// Helper functions
function calculateSummary(fixes) {
  if (!fixes || fixes.length === 0) {
    return {
      totalFixes: 0,
      successfulFixes: 0,
      failedFixes: 0,
      successRate: 0,
      averageImprovementPercentage: 0
    };
  }
  
  const totalFixes = fixes.length;
  const successfulFixes = fixes.filter(fix => fix.success).length;
  const failedFixes = totalFixes - successfulFixes;
  const successRate = (successfulFixes / totalFixes) * 100;
  
  // Calculate average improvement percentage
  let totalImprovement = 0;
  let fixesWithMetrics = 0;
  
  fixes.forEach(fix => {
    const improvementPercentage = getFixImprovementPercentage(fix);
    if (improvementPercentage > 0) {
      totalImprovement += improvementPercentage;
      fixesWithMetrics++;
    }
  });
  
  const averageImprovementPercentage = 
    fixesWithMetrics > 0 ? totalImprovement / fixesWithMetrics : 0;
  
  return {
    totalFixes,
    successfulFixes,
    failedFixes,
    successRate,
    averageImprovementPercentage
  };
}

function getFixImprovementPercentage(fix) {
  if (!fix.strategyResults) {
    return 0;
  }
  
  // Check for performance improvement
  const performanceResult = fix.strategyResults.get('performance');
  if (performanceResult && performanceResult.improvementPercentage) {
    return performanceResult.improvementPercentage;
  }
  
  // Check for other metrics
  let totalImprovement = 0;
  let metricCount = 0;
  
  for (const [strategy, result] of fix.strategyResults.entries()) {
    if (result.metrics && result.metrics.length > 0) {
      result.metrics.forEach(metric => {
        if (metric.improved) {
          const absPercentage = Math.abs(metric.percentageChange);
          totalImprovement += absPercentage;
          metricCount++;
        }
      });
    }
  }
  
  return metricCount > 0 ? totalImprovement / metricCount : 0;
}

function getFixDetails(fix) {
  // Extract key details for client display
  if (!fix.strategyResults) {
    return null;
  }
  
  // Get most relevant details
  for (const [strategy, result] of fix.strategyResults.entries()) {
    if (!result.success && result.message) {
      return result.message;
    }
  }
  
  return null;
}

// Create and export models
const Verification = mongoose.model('Verification', VerificationSchema);
const FixVerification = mongoose.model('FixVerification', FixVerificationSchema);
const Screenshot = mongoose.model('Screenshot', ScreenshotSchema);
const VerificationSchedule = mongoose.model('VerificationSchedule', VerificationScheduleSchema);

module.exports = {
  Verification,
  FixVerification,
  Screenshot,
  VerificationSchedule
};
