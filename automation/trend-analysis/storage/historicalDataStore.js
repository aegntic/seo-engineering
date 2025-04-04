/**
 * Historical Data Store
 * 
 * Manages storage and retrieval of historical performance metrics for trend analysis.
 * Provides mechanisms for storing, retrieving, and querying time-series performance data.
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../common/logger');
const MetricsSnapshot = require('../models/metricsSnapshot');

class HistoricalDataStore {
  constructor(options = {}) {
    this.config = {
      // Storage type: 'file' (default) or 'database'
      storageType: options.storageType || 'file',
      
      // Base directory for file storage
      storageDir: options.storageDir || path.join(process.cwd(), 'data', 'historical'),
      
      // Database connection (if storageType is 'database')
      dbConnection: options.dbConnection || null,
      
      // Table/collection name (if storageType is 'database')
      tableName: options.tableName || 'historical_metrics',
      
      // Default tracking period in days
      defaultPeriod: options.defaultPeriod || 90,
      
      // Data resolution/interval
      dataInterval: options.dataInterval || 'daily',
      
      ...options
    };
    
    // Initialize storage
    this.init();
    
    logger.info('Historical Data Store initialized');
  }
  
  /**
   * Initialize the storage system
   */
  async init() {
    try {
      if (this.config.storageType === 'file') {
        // Ensure storage directory exists
        await this.ensureStorageDirectory();
      } else if (this.config.storageType === 'database') {
        // Validate database connection
        if (!this.config.dbConnection) {
          throw new Error('Database connection required for database storage type');
        }
        
        // Additional database initialization can be added here
      }
    } catch (error) {
      logger.error(`Failed to initialize historical data store: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Ensure the file storage directory exists
   */
  async ensureStorageDirectory() {
    try {
      await fs.mkdir(this.config.storageDir, { recursive: true });
      logger.debug(`Storage directory ensured: ${this.config.storageDir}`);
    } catch (error) {
      logger.error(`Failed to create storage directory: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Store metrics for a site
   * 
   * @param {string} siteId - Site identifier
   * @param {Object} metrics - Metrics data
   * @param {Date} timestamp - Timestamp for the metrics
   * @param {Object} options - Storage options
   * @returns {Promise<Object>} - Storage result
   */
  async storeMetrics(siteId, metrics, timestamp = new Date(), options = {}) {
    logger.debug(`Storing metrics for site ${siteId} at ${timestamp}`);
    
    try {
      // Create metrics snapshot
      const snapshot = new MetricsSnapshot({
        siteId,
        timestamp,
        metrics: metrics.metrics || metrics,
      });
      
      // Store the snapshot
      if (this.config.storageType === 'file') {
        return await this.storeToFile(siteId, snapshot);
      } else if (this.config.storageType === 'database') {
        return await this.storeToDatabase(siteId, snapshot);
      } else {
        throw new Error(`Unsupported storage type: ${this.config.storageType}`);
      }
    } catch (error) {
      logger.error(`Failed to store metrics: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Store metrics snapshot to file
   * 
   * @param {string} siteId - Site identifier
   * @param {MetricsSnapshot} snapshot - Metrics snapshot
   * @returns {Promise<Object>} - Storage result
   */
  async storeToFile(siteId, snapshot) {
    try {
      // Create site-specific directory
      const siteDir = path.join(this.config.storageDir, siteId);
      await fs.mkdir(siteDir, { recursive: true });
      
      // Format date for filename
      const dateStr = this.formatDateForFilename(snapshot.timestamp);
      
      // Determine file path
      const filePath = path.join(siteDir, `${dateStr}.json`);
      
      // Write snapshot to file
      await fs.writeFile(
        filePath,
        JSON.stringify(snapshot, null, 2),
        'utf8'
      );
      
      return {
        success: true,
        siteId,
        timestamp: snapshot.timestamp,
        path: filePath
      };
    } catch (error) {
      logger.error(`Failed to store metrics to file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Store metrics snapshot to database
   * 
   * @param {string} siteId - Site identifier
   * @param {MetricsSnapshot} snapshot - Metrics snapshot
   * @returns {Promise<Object>} - Storage result
   */
  async storeToDatabase(siteId, snapshot) {
    try {
      // Check database connection
      if (!this.config.dbConnection) {
        throw new Error('Database connection not available');
      }
      
      // Insert into database (implementation depends on database type)
      // This is a placeholder for database-specific implementation
      const result = await this.config.dbConnection.collection(this.config.tableName).insertOne({
        siteId,
        timestamp: snapshot.timestamp,
        metrics: snapshot.metrics
      });
      
      return {
        success: true,
        siteId,
        timestamp: snapshot.timestamp,
        id: result.insertedId
      };
    } catch (error) {
      logger.error(`Failed to store metrics to database: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get historical data for a site
   * 
   * @param {string} siteId - Site identifier
   * @param {number} periodDays - Number of days to retrieve
   * @param {Object} options - Retrieval options
   * @returns {Promise<Array<Object>>} - Historical data
   */
  async getHistoricalData(siteId, periodDays = 90, options = {}) {
    logger.debug(`Retrieving ${periodDays} days of historical data for site ${siteId}`);
    
    try {
      // Calculate start date
      const endDate = options.endDate || new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - periodDays);
      
      // Retrieve data
      if (this.config.storageType === 'file') {
        return await this.retrieveFromFile(siteId, startDate, endDate, options);
      } else if (this.config.storageType === 'database') {
        return await this.retrieveFromDatabase(siteId, startDate, endDate, options);
      } else {
        throw new Error(`Unsupported storage type: ${this.config.storageType}`);
      }
    } catch (error) {
      logger.error(`Failed to retrieve historical data: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Retrieve historical data from file storage
   * 
   * @param {string} siteId - Site identifier
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Retrieval options
   * @returns {Promise<Array<Object>>} - Historical data
   */
  async retrieveFromFile(siteId, startDate, endDate, options = {}) {
    try {
      // Get site directory
      const siteDir = path.join(this.config.storageDir, siteId);
      
      // Check if directory exists
      try {
        await fs.access(siteDir);
      } catch (error) {
        // Directory doesn't exist, return empty array
        return [];
      }
      
      // Get files in the site directory
      const files = await fs.readdir(siteDir);
      
      // Filter files by date range
      const dateFilteredFiles = files.filter(file => {
        if (!file.endsWith('.json')) return false;
        
        // Extract date from filename
        const fileDate = this.parseDateFromFilename(file);
        if (!fileDate) return false;
        
        // Check if date is within range
        return fileDate >= startDate && fileDate <= endDate;
      });
      
      // Sort files by date
      dateFilteredFiles.sort();
      
      // Read and parse each file
      const snapshots = await Promise.all(
        dateFilteredFiles.map(async (file) => {
          const filePath = path.join(siteDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          return JSON.parse(content);
        })
      );
      
      // Apply interval aggregation if needed
      if (options.interval && options.interval !== 'daily') {
        return this.aggregateByInterval(snapshots, options.interval);
      }
      
      return snapshots;
    } catch (error) {
      logger.error(`Failed to retrieve data from file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Retrieve historical data from database
   * 
   * @param {string} siteId - Site identifier
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Retrieval options
   * @returns {Promise<Array<Object>>} - Historical data
   */
  async retrieveFromDatabase(siteId, startDate, endDate, options = {}) {
    try {
      // Check database connection
      if (!this.config.dbConnection) {
        throw new Error('Database connection not available');
      }
      
      // Query database
      const snapshots = await this.config.dbConnection.collection(this.config.tableName)
        .find({
          siteId,
          timestamp: { $gte: startDate, $lte: endDate }
        })
        .sort({ timestamp: 1 })
        .toArray();
      
      // Apply interval aggregation if needed
      if (options.interval && options.interval !== 'daily') {
        return this.aggregateByInterval(snapshots, options.interval);
      }
      
      return snapshots;
    } catch (error) {
      logger.error(`Failed to retrieve data from database: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get historical data for a specific metric
   * 
   * @param {string} siteId - Site identifier
   * @param {string} metricKey - Metric key
   * @param {number} periodDays - Number of days to retrieve
   * @param {Object} options - Retrieval options
   * @returns {Promise<Array<Object>>} - Metric history
   */
  async getMetricHistory(siteId, metricKey, periodDays = 90, options = {}) {
    logger.debug(`Retrieving history for metric ${metricKey} for site ${siteId}`);
    
    try {
      // Get all historical data
      const allData = await this.getHistoricalData(siteId, periodDays, options);
      
      // Extract specific metric data
      const metricHistory = allData.map(snapshot => {
        const metricValue = snapshot.metrics[metricKey];
        
        return {
          timestamp: new Date(snapshot.timestamp),
          value: metricValue !== undefined ? metricValue : null,
          siteId
        };
      });
      
      // Filter out null values
      return metricHistory.filter(point => point.value !== null);
    } catch (error) {
      logger.error(`Failed to retrieve metric history: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Aggregate snapshots by interval
   * 
   * @param {Array<Object>} snapshots - Metrics snapshots
   * @param {string} interval - Interval ('weekly' or 'monthly')
   * @returns {Array<Object>} - Aggregated snapshots
   */
  aggregateByInterval(snapshots, interval) {
    // Group snapshots by interval
    const groupedSnapshots = {};
    
    snapshots.forEach(snapshot => {
      const date = new Date(snapshot.timestamp);
      let key;
      
      if (interval === 'weekly') {
        // Get week number (1-52)
        const weekNumber = this.getWeekNumber(date);
        const year = date.getFullYear();
        key = `${year}-W${weekNumber}`;
      } else if (interval === 'monthly') {
        // Get month (0-11)
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        key = `${year}-M${month}`;
      } else {
        // Invalid interval, use daily
        key = this.formatDateForFilename(date);
      }
      
      if (!groupedSnapshots[key]) {
        groupedSnapshots[key] = [];
      }
      
      groupedSnapshots[key].push(snapshot);
    });
    
    // Aggregate each group
    const aggregatedSnapshots = [];
    
    Object.entries(groupedSnapshots).forEach(([key, group]) => {
      // Use the latest snapshot in the group as the base
      const latestSnapshot = { ...group[group.length - 1] };
      
      // Average numeric metrics
      if (latestSnapshot.metrics) {
        Object.keys(latestSnapshot.metrics).forEach(metricKey => {
          const values = group
            .map(s => s.metrics[metricKey])
            .filter(value => typeof value === 'number');
          
          if (values.length > 0) {
            const sum = values.reduce((acc, val) => acc + val, 0);
            latestSnapshot.metrics[metricKey] = sum / values.length;
          }
        });
      }
      
      // Add interval information
      latestSnapshot.interval = interval;
      latestSnapshot.intervalKey = key;
      
      aggregatedSnapshots.push(latestSnapshot);
    });
    
    // Sort by timestamp
    return aggregatedSnapshots.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  }
  
  /**
   * Format date for filename
   * 
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date (YYYY-MM-DD)
   */
  formatDateForFilename(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  /**
   * Parse date from filename
   * 
   * @param {string} filename - Filename to parse
   * @returns {Date|null} - Parsed date or null
   */
  parseDateFromFilename(filename) {
    // Extract date part (YYYY-MM-DD) from filename
    const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (!match) return null;
    
    // Parse date
    return new Date(match[1]);
  }
  
  /**
   * Get week number (1-52) from date
   * 
   * @param {Date} date - Date to process
   * @returns {number} - Week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
    
    // Set to nearest Thursday (week numbering is based on ISO weeks)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    
    // Calculate week number
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
}

module.exports = HistoricalDataStore;
