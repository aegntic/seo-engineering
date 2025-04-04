/**
 * Data Collector Module
 * 
 * Aggregates and normalizes data from different tracking sources.
 * Provides a unified API for accessing test performance data.
 * 
 * Last updated: April 4, 2025
 */

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const db = require('../../utils/db-connection');

// Define data collection schema
const DataCollectionSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  testId: { type: String, required: true },
  collectionDate: { type: Date, default: Date.now },
  data: {
    performance: {
      byVariant: { type: Map, of: mongoose.Schema.Types.Mixed }
    },
    behavior: {
      byVariant: { type: Map, of: mongoose.Schema.Types.Mixed }
    },
    search: {
      byVariant: { type: Map, of: mongoose.Schema.Types.Mixed }
    },
    combined: {
      byVariant: { type: Map, of: mongoose.Schema.Types.Mixed }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

// Create index for efficient querying
DataCollectionSchema.index({ testId: 1, collectionDate: 1 });

const DataCollection = mongoose.model('DataCollection', DataCollectionSchema);

/**
 * Data Collector class for aggregating and accessing test data
 */
class DataCollector {
  /**
   * Creates a new DataCollector instance
   * 
   * @param {string} testId - ID of the test
   */
  constructor(testId) {
    this.testId = testId;
    this.trackers = {};
    this.initialized = false;
    this.logger = logger;
    this.collectionInterval = null;
  }
  
  /**
   * Connects data sources to the collector
   * 
   * @param {Object} performanceTracker - Performance tracker instance
   * @param {Object} behaviorTracker - User behavior tracker instance
   * @returns {Promise<void>}
   */
  async connect(performanceTracker, behaviorTracker) {
    try {
      this.logger.info(`Connecting data sources for test: ${this.testId}`);
      
      this.trackers.performance = performanceTracker;
      this.trackers.behavior = behaviorTracker;
      
      // Set up scheduled data collection
      this.collectionInterval = setInterval(() => {
        this.collectData().catch(error => {
          this.logger.error(`Error collecting data: ${error.message}`, { error });
        });
      }, 3600000); // Hourly collection
      
      // Perform initial collection
      await this.collectData();
      
      this.initialized = true;
      this.logger.info(`Data collector initialized for test: ${this.testId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Error connecting data sources: ${error.message}`, { error });
      throw new Error(`Failed to connect data sources: ${error.message}`);
    }
  }
  
  /**
   * Collects data from all connected trackers
   * 
   * @returns {Promise<Object>} - Collected data
   */
  async collectData() {
    try {
      this.logger.info(`Collecting data for test: ${this.testId}`);
      
      const collection = {
        performance: { byVariant: {} },
        behavior: { byVariant: {} },
        search: { byVariant: {} },
        combined: { byVariant: {} }
      };
      
      // Collect performance data if tracker available
      if (this.trackers.performance) {
        const performanceData = await this.trackers.performance.aggregatePerformance(this.testId);
        
        // Format performance data
        for (const data of performanceData) {
          const variantId = data._id;
          collection.performance.byVariant[variantId] = {
            pageSpeed: data.avgPageSpeed,
            mobileScore: data.avgMobileScore,
            seoScore: data.avgSeoScore,
            coreWebVitals: {
              lcp: data.avgLCP,
              cls: data.avgCLS,
              fid: data.avgFID,
              inp: data.avgINP
            },
            dataPoints: data.dataPoints,
            lastUpdated: data.lastUpdated
          };
        }
      }
      
      // Collect behavior data if tracker available
      if (this.trackers.behavior) {
        const behaviorMetrics = await this.trackers.behavior.getMetricsByVariant();
        collection.behavior.byVariant = behaviorMetrics;
      }
      
      // Combine data for each variant
      const allVariantIds = new Set([
        ...Object.keys(collection.performance.byVariant),
        ...Object.keys(collection.behavior.byVariant),
        ...Object.keys(collection.search.byVariant)
      ]);
      
      for (const variantId of allVariantIds) {
        collection.combined.byVariant[variantId] = {
          performance: collection.performance.byVariant[variantId] || {},
          behavior: collection.behavior.byVariant[variantId] || {},
          search: collection.search.byVariant[variantId] || {}
        };
      }
      
      // Save collection to database
      const dataCollection = new DataCollection({
        testId: this.testId,
        data: collection
      });
      
      await dataCollection.save();
      
      this.logger.info(`Data collection completed for test: ${this.testId}`);
      
      return collection;
    } catch (error) {
      this.logger.error(`Error collecting data: ${error.message}`, { error });
      throw new Error(`Failed to collect data: ${error.message}`);
    }
  }
  
  /**
   * Gets the latest collected data for the test
   * 
   * @returns {Promise<Object>} - Latest collected data
   */
  async getLatestData() {
    try {
      const latestCollection = await DataCollection.findOne({ testId: this.testId })
        .sort({ collectionDate: -1 })
        .lean();
      
      if (!latestCollection) {
        throw new Error(`No data collection found for test: ${this.testId}`);
      }
      
      return latestCollection.data;
    } catch (error) {
      this.logger.error(`Error retrieving latest data: ${error.message}`, { error });
      throw new Error(`Failed to retrieve latest data: ${error.message}`);
    }
  }
  
  /**
   * Gets data collection history for the test
   * 
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Data collection history
   */
  async getDataHistory(options = {}) {
    try {
      const query = { testId: this.testId };
      
      if (options.startDate) {
        query.collectionDate = { $gte: new Date(options.startDate) };
      }
      
      if (options.endDate) {
        query.collectionDate = query.collectionDate || {};
        query.collectionDate.$lte = new Date(options.endDate);
      }
      
      const dataCollections = await DataCollection.find(query)
        .sort({ collectionDate: options.sort || 'desc' })
        .limit(options.limit || 100)
        .lean();
      
      return dataCollections;
    } catch (error) {
      this.logger.error(`Error retrieving data history: ${error.message}`, { error });
      throw new Error(`Failed to retrieve data history: ${error.message}`);
    }
  }
  
  /**
   * Gets data trends for a specific metric
   * 
   * @param {string} metricPath - Dot-notation path to the metric
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Metric trends by variant
   */
  async getMetricTrends(metricPath, options = {}) {
    try {
      const dataHistory = await this.getDataHistory(options);
      
      const trends = {};
      
      for (const collection of dataHistory) {
        const collectionDate = collection.collectionDate;
        
        for (const [variantId, variantData] of Object.entries(collection.data.combined.byVariant)) {
          if (!trends[variantId]) {
            trends[variantId] = [];
          }
          
          // Extract metric value using path
          const metricValue = this.getValueByPath(variantData, metricPath);
          
          if (metricValue !== undefined) {
            trends[variantId].push({
              date: collectionDate,
              value: metricValue
            });
          }
        }
      }
      
      // Sort data points by date
      for (const variantId of Object.keys(trends)) {
        trends[variantId].sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      return trends;
    } catch (error) {
      this.logger.error(`Error retrieving metric trends: ${error.message}`, { error });
      throw new Error(`Failed to retrieve metric trends: ${error.message}`);
    }
  }
  
  /**
   * Gets a value from an object using dot notation
   * 
   * @param {Object} obj - Object to extract value from
   * @param {string} path - Dot-notation path to the value
   * @returns {*} - Extracted value
   */
  getValueByPath(obj, path) {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
  
  /**
   * Stops the data collector
   * 
   * @returns {Promise<boolean>} - Success indicator
   */
  async stop() {
    try {
      if (this.collectionInterval) {
        clearInterval(this.collectionInterval);
        this.collectionInterval = null;
      }
      
      this.initialized = false;
      this.logger.info(`Data collector stopped for test: ${this.testId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Error stopping data collector: ${error.message}`, { error });
      return false;
    }
  }
}

module.exports = {
  DataCollector
};
