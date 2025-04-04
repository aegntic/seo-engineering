/**
 * Metrics Trend Analyzer
 * 
 * Analyzes time-series performance metrics to identify trends, patterns,
 * and significant changes over time.
 */

const logger = require('../../common/logger');
const TrendResult = require('../models/trendResult');

class MetricsTrendAnalyzer {
  constructor(options = {}) {
    this.config = {
      // Minimum data points required for trend analysis
      minDataPoints: options.minDataPoints || 5,
      
      // Default metrics to analyze
      defaultMetrics: options.defaultMetrics || [
        'score', 
        'largestContentfulPaint',
        'cumulativeLayoutShift',
        'totalBlockingTime'
      ],
      
      // Threshold for significant change (percentage)
      significantChangeThreshold: options.significantChangeThreshold || 10,
      
      // Period for recent trend analysis (days)
      recentPeriod: options.recentPeriod || 14,
      
      // Whether to analyze seasonal patterns
      analyzeSeasonality: options.analyzeSeasonality !== false,
      
      // Whether to detect anomalies
      detectAnomalies: options.detectAnomalies !== false,
      
      // Z-score threshold for anomaly detection
      anomalyThreshold: options.anomalyThreshold || 2.5,
      
      ...options
    };
    
    logger.info('Metrics Trend Analyzer initialized');
  }
  
  /**
   * Analyze trends in historical metrics data
   * 
   * @param {Array<Object>} historicalData - Historical metrics snapshots
   * @param {Array<string>} metricsToAnalyze - Metrics to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Trend analysis results
   */
  async analyzeTrends(historicalData, metricsToAnalyze = [], options = {}) {
    logger.info(`Analyzing trends for ${metricsToAnalyze.length || 'all'} metrics`);
    
    try {
      // Use default metrics if none specified
      const metrics = metricsToAnalyze.length > 0 
        ? metricsToAnalyze 
        : this.config.defaultMetrics;
      
      // Ensure we have enough data points
      if (historicalData.length < this.config.minDataPoints) {
        logger.warn(`Not enough data points for trend analysis (${historicalData.length} < ${this.config.minDataPoints})`);
        return {
          success: false,
          message: `Not enough data points for trend analysis (${historicalData.length} < ${this.config.minDataPoints})`,
          results: {}
        };
      }
      
      // Sort data by timestamp
      const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Analyze each metric
      const results = {};
      
      for (const metric of metrics) {
        // Extract data for this metric
        const metricData = this.extractMetricData(sortedData, metric);
        
        // Skip if not enough valid data points
        if (metricData.length < this.config.minDataPoints) {
          logger.debug(`Not enough data points for metric ${metric}`);
          continue;
        }
        
        // Analyze this metric
        results[metric] = await this.analyzeMetricTrend(metricData, metric, options);
      }
      
      // Generate overall trend summary
      const overallTrend = this.generateOverallTrend(results);
      
      return {
        success: true,
        overallTrend,
        metrics: results,
        dataPointCount: historicalData.length,
        analyzedMetrics: Object.keys(results)
      };
      
    } catch (error) {
      logger.error(`Failed to analyze trends: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extract data for a specific metric
   * 
   * @param {Array<Object>} data - Historical data
   * @param {string} metricKey - Metric to extract
   * @returns {Array<Object>} - Extracted metric data
   */
  extractMetricData(data, metricKey) {
    // Extract metric values
    return data
      .map(snapshot => {
        const metricValue = snapshot.metrics[metricKey];
        
        // Skip if metric not found
        if (metricValue === undefined || metricValue === null) {
          return null;
        }
        
        return {
          timestamp: new Date(snapshot.timestamp),
          value: metricValue,
          metricKey
        };
      })
      .filter(item => item !== null);
  }
  
  /**
   * Analyze trend for a specific metric
   * 
   * @param {Array<Object>} metricData - Metric data points
   * @param {string} metricKey - Metric key
   * @param {Object} options - Analysis options
   * @returns {Promise<TrendResult>} - Trend analysis result
   */
  async analyzeMetricTrend(metricData, metricKey, options = {}) {
    logger.debug(`Analyzing trend for metric: ${metricKey}`);
    
    // Calculate basic statistics
    const stats = this.calculateStatistics(metricData);
    
    // Calculate overall trend (linear regression)
    const trend = this.calculateTrend(metricData);
    
    // Calculate recent trend
    const recentTrend = this.calculateRecentTrend(metricData, options.recentPeriod || this.config.recentPeriod);
    
    // Detect significant changes
    const significantChanges = this.detectSignificantChanges(
      metricData, 
      options.significantChangeThreshold || this.config.significantChangeThreshold
    );
    
    // Detect seasonality if enabled
    let seasonality = null;
    if (options.analyzeSeasonality !== false && this.config.analyzeSeasonality) {
      seasonality = this.detectSeasonality(metricData);
    }
    
    // Detect anomalies if enabled
    let anomalies = [];
    if (options.detectAnomalies !== false && this.config.detectAnomalies) {
      anomalies = this.detectAnomalies(
        metricData, 
        options.anomalyThreshold || this.config.anomalyThreshold
      );
    }
    
    // Determine trend direction
    const trendDirection = this.determineTrendDirection(trend.slope, metricKey);
    
    // Create trend result
    return new TrendResult({
      metricKey,
      dataPoints: metricData.length,
      statistics: stats,
      trend: {
        slope: trend.slope,
        intercept: trend.intercept,
        r2: trend.r2,
        direction: trendDirection,
        directionLabel: this.getTrendDirectionLabel(trendDirection, metricKey),
        percentChange: this.calculatePercentChange(metricData),
        isPositive: this.isTrendPositive(trendDirection, metricKey)
      },
      recentTrend: {
        slope: recentTrend.slope,
        intercept: recentTrend.intercept,
        r2: recentTrend.r2,
        direction: this.determineTrendDirection(recentTrend.slope, metricKey),
        dataPoints: recentTrend.dataPoints,
        percentChange: recentTrend.percentChange
      },
      significantChanges,
      seasonality,
      anomalies,
      forecast: this.generateForecast(metricData, trend, 7) // 7-day forecast
    });
  }
  
  /**
   * Calculate basic statistics for metric data
   * 
   * @param {Array<Object>} data - Metric data points
   * @returns {Object} - Statistical measures
   */
  calculateStatistics(data) {
    const values = data.map(point => point.value);
    
    // Sort values for percentiles
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate basic statistics
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    
    // Calculate variance and standard deviation
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate percentiles
    const p25 = this.percentile(sortedValues, 25);
    const p50 = this.percentile(sortedValues, 50); // median
    const p75 = this.percentile(sortedValues, 75);
    const p90 = this.percentile(sortedValues, 90);
    const p95 = this.percentile(sortedValues, 95);
    
    // Calculate first and last values for total change
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const totalChange = last - first;
    const totalChangePercent = (totalChange / first) * 100;
    
    return {
      count: values.length,
      min,
      max,
      mean,
      median: p50,
      stdDev,
      variance,
      percentiles: {
        p25,
        p50,
        p75,
        p90,
        p95
      },
      first,
      last,
      totalChange,
      totalChangePercent
    };
  }
  
  /**
   * Calculate percentile
   * 
   * @param {Array<number>} sortedValues - Sorted array of values
   * @param {number} p - Percentile (0-100)
   * @returns {number} - Percentile value
   */
  percentile(sortedValues, p) {
    if (sortedValues.length === 0) return 0;
    if (sortedValues.length === 1) return sortedValues[0];
    
    const index = (p / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sortedValues[lower];
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }
  
  /**
   * Calculate trend using linear regression
   * 
   * @param {Array<Object>} data - Metric data points
   * @returns {Object} - Trend parameters
   */
  calculateTrend(data) {
    // Convert timestamps to relative days for regression
    const firstTimestamp = data[0].timestamp.getTime();
    const xValues = data.map(point => 
      (point.timestamp.getTime() - firstTimestamp) / (1000 * 60 * 60 * 24) // days
    );
    const yValues = data.map(point => point.value);
    
    // Calculate linear regression
    const n = data.length;
    const sumX = xValues.reduce((acc, val) => acc + val, 0);
    const sumY = yValues.reduce((acc, val) => acc + val, 0);
    const sumXY = xValues.reduce((acc, val, i) => acc + val * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, val) => acc + val * val, 0);
    const sumY2 = yValues.reduce((acc, val) => acc + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((acc, val) => acc + Math.pow(val - yMean, 2), 0);
    const ssResidual = yValues.reduce((acc, val, i) => {
      const yPred = slope * xValues[i] + intercept;
      return acc + Math.pow(val - yPred, 2);
    }, 0);
    const r2 = 1 - (ssResidual / ssTotal);
    
    return {
      slope,
      intercept,
      r2
    };
  }
  
  /**
   * Calculate recent trend (for the most recent period)
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {number} recentPeriodDays - Recent period in days
   * @returns {Object} - Recent trend parameters
   */
  calculateRecentTrend(data, recentPeriodDays) {
    // If not enough data, use overall trend
    if (data.length < 2) {
      return this.calculateTrend(data);
    }
    
    // Get the most recent timestamp
    const lastTimestamp = data[data.length - 1].timestamp.getTime();
    
    // Filter for the recent period
    const recentPeriodMs = recentPeriodDays * 24 * 60 * 60 * 1000;
    const recentData = data.filter(point => 
      (lastTimestamp - point.timestamp.getTime()) <= recentPeriodMs
    );
    
    // If not enough data in recent period, use more data
    if (recentData.length < 2) {
      const halfDataLength = Math.floor(data.length / 2);
      const halfData = data.slice(-halfDataLength);
      const trend = this.calculateTrend(halfData);
      trend.dataPoints = halfData.length;
      
      // Calculate percent change
      const first = halfData[0].value;
      const last = halfData[halfData.length - 1].value;
      trend.percentChange = ((last - first) / first) * 100;
      
      return trend;
    }
    
    // Calculate trend for recent data
    const trend = this.calculateTrend(recentData);
    trend.dataPoints = recentData.length;
    
    // Calculate percent change
    const first = recentData[0].value;
    const last = recentData[recentData.length - 1].value;
    trend.percentChange = ((last - first) / first) * 100;
    
    return trend;
  }
  
  /**
   * Detect significant changes in the metric
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {number} threshold - Threshold percentage for significant change
   * @returns {Array<Object>} - Significant changes
   */
  detectSignificantChanges(data, threshold) {
    const changes = [];
    
    // Need at least 3 points to detect changes
    if (data.length < 3) {
      return changes;
    }
    
    // Calculate moving average (MA) for smoothing
    const windowSize = Math.max(2, Math.floor(data.length / 10));
    const movingAvg = this.calculateMovingAverage(data, windowSize);
    
    // Look for significant changes in the smoothed data
    for (let i = windowSize; i < movingAvg.length - 1; i++) {
      const current = movingAvg[i];
      const next = movingAvg[i + 1];
      
      // Calculate percent change
      const percentChange = ((next - current) / current) * 100;
      
      // Check if change exceeds threshold
      if (Math.abs(percentChange) >= threshold) {
        changes.push({
          fromIndex: i,
          toIndex: i + 1,
          fromDate: data[i].timestamp,
          toDate: data[i + 1].timestamp,
          fromValue: data[i].value,
          toValue: data[i + 1].value,
          percentChange: percentChange,
          direction: percentChange > 0 ? 'increase' : 'decrease'
        });
      }
    }
    
    return changes;
  }
  
  /**
   * Calculate moving average
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {number} windowSize - Window size for moving average
   * @returns {Array<number>} - Moving average values
   */
  calculateMovingAverage(data, windowSize) {
    const values = data.map(point => point.value);
    const result = [];
    
    for (let i = 0; i < values.length; i++) {
      if (i < windowSize - 1) {
        // Not enough prior data points, use available
        const window = values.slice(0, i + 1);
        const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
        result.push(avg);
      } else {
        // Full window
        const window = values.slice(i - windowSize + 1, i + 1);
        const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
        result.push(avg);
      }
    }
    
    return result;
  }
  
  /**
   * Detect seasonality in the time series
   * 
   * @param {Array<Object>} data - Metric data points
   * @returns {Object|null} - Seasonality information or null if none detected
   */
  detectSeasonality(data) {
    // Need enough data points to detect seasonality
    if (data.length < 14) {
      return null;
    }
    
    // Analyze periodicity by day of week
    const byDayOfWeek = Array(7).fill(0).map(() => []);
    
    data.forEach(point => {
      const dayOfWeek = point.timestamp.getDay(); // 0-6
      byDayOfWeek[dayOfWeek].push(point.value);
    });
    
    // Calculate average by day of week
    const averageByDayOfWeek = byDayOfWeek.map(values => {
      if (values.length === 0) return null;
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    // Check for nulls (days without data)
    if (averageByDayOfWeek.some(avg => avg === null)) {
      return null;
    }
    
    // Calculate variation across days of week
    const avg = averageByDayOfWeek.reduce((sum, val) => sum + val, 0) / 7;
    const maxDiff = Math.max(...averageByDayOfWeek) - Math.min(...averageByDayOfWeek);
    const relativeVariation = maxDiff / avg;
    
    // If variation is significant, we have weekly seasonality
    if (relativeVariation > 0.1) {
      // Find day of week with highest and lowest values
      const maxDay = averageByDayOfWeek.indexOf(Math.max(...averageByDayOfWeek));
      const minDay = averageByDayOfWeek.indexOf(Math.min(...averageByDayOfWeek));
      
      return {
        type: 'weekly',
        dayOfWeekPattern: true,
        averageByDayOfWeek,
        variation: relativeVariation,
        maxDay,
        minDay,
        daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        confidence: relativeVariation > 0.2 ? 'high' : 'medium'
      };
    }
    
    // No clear seasonality detected
    return null;
  }
  
  /**
   * Detect anomalies in the time series
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {number} zScoreThreshold - Z-score threshold for anomaly detection
   * @returns {Array<Object>} - Detected anomalies
   */
  detectAnomalies(data, zScoreThreshold) {
    // Need enough data points to detect anomalies
    if (data.length < 5) {
      return [];
    }
    
    const values = data.map(point => point.value);
    
    // Calculate mean and standard deviation
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // If standard deviation is very low, adjust threshold
    const effectiveThreshold = stdDev < 0.001 ? 10 : zScoreThreshold;
    
    // Detect anomalies using Z-score
    const anomalies = [];
    
    data.forEach((point, index) => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      
      if (zScore > effectiveThreshold) {
        anomalies.push({
          index,
          timestamp: point.timestamp,
          value: point.value,
          zScore,
          direction: point.value > mean ? 'high' : 'low',
          deviationPercent: ((point.value - mean) / mean) * 100
        });
      }
    });
    
    return anomalies;
  }
  
  /**
   * Determine trend direction based on slope
   * 
   * @param {number} slope - Trend slope
   * @param {string} metricKey - Metric key
   * @returns {string} - Trend direction (improving, degrading, stable)
   */
  determineTrendDirection(slope, metricKey) {
    // If slope is very close to zero, it's stable
    if (Math.abs(slope) < 0.0001) {
      return 'stable';
    }
    
    // Determine if higher is better for this metric
    const higherIsBetter = this.isHigherBetterForMetric(metricKey);
    
    // Positive slope means increasing values
    if (slope > 0) {
      return higherIsBetter ? 'improving' : 'degrading';
    } else {
      return higherIsBetter ? 'degrading' : 'improving';
    }
  }
  
  /**
   * Get user-friendly trend direction label
   * 
   * @param {string} direction - Trend direction
   * @param {string} metricKey - Metric key
   * @returns {string} - User-friendly label
   */
  getTrendDirectionLabel(direction, metricKey) {
    const metricName = this.getMetricDisplayName(metricKey);
    
    switch (direction) {
      case 'improving':
        return `${metricName} is improving over time`;
      case 'degrading':
        return `${metricName} is degrading over time`;
      case 'stable':
        return `${metricName} is stable over time`;
      default:
        return `${metricName} trend unknown`;
    }
  }
  
  /**
   * Calculate percent change from first to last data point
   * 
   * @param {Array<Object>} data - Metric data points
   * @returns {number} - Percent change
   */
  calculatePercentChange(data) {
    if (data.length < 2) return 0;
    
    const first = data[0].value;
    const last = data[data.length - 1].value;
    
    if (first === 0) return 0; // Avoid division by zero
    
    return ((last - first) / first) * 100;
  }
  
  /**
   * Determine if a trend direction is positive
   * 
   * @param {string} direction - Trend direction
   * @param {string} metricKey - Metric key
   * @returns {boolean} - Whether trend is positive
   */
  isTrendPositive(direction, metricKey) {
    return direction === 'improving';
  }
  
  /**
   * Generate a simple forecast for the metric
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {Object} trend - Trend parameters
   * @param {number} days - Number of days to forecast
   * @returns {Array<Object>} - Forecast data points
   */
  generateForecast(data, trend, days) {
    const forecast = [];
    
    // If not enough data or poor fit, return empty forecast
    if (data.length < 3 || trend.r2 < 0.1) {
      return forecast;
    }
    
    // Get the last timestamp
    const lastTimestamp = data[data.length - 1].timestamp.getTime();
    const lastDataPoint = data[data.length - 1].value;
    
    // Convert timestamp to days for regression
    const firstTimestamp = data[0].timestamp.getTime();
    const lastDay = (lastTimestamp - firstTimestamp) / (1000 * 60 * 60 * 24);
    
    // Generate forecast points
    for (let i = 1; i <= days; i++) {
      const forecastDay = lastDay + i;
      const forecastTimestamp = new Date(firstTimestamp + forecastDay * 24 * 60 * 60 * 1000);
      
      // Calculate forecasted value
      const forecastValue = trend.slope * forecastDay + trend.intercept;
      
      forecast.push({
        timestamp: forecastTimestamp,
        value: forecastValue,
        day: i
      });
    }
    
    return forecast;
  }
  
  /**
   * Generate overall trend summary
   * 
   * @param {Object} results - Trend results by metric
   * @returns {Object} - Overall trend summary
   */
  generateOverallTrend(results) {
    // Count metrics by trend direction
    const directionCounts = {
      improving: 0,
      degrading: 0,
      stable: 0
    };
    
    // Count significant changes
    let totalSignificantChanges = 0;
    
    // Calculate overall score trend
    let scoreTrend = null;
    
    Object.entries(results).forEach(([metric, result]) => {
      // Count by direction
      directionCounts[result.trend.direction]++;
      
      // Count significant changes
      totalSignificantChanges += result.significantChanges.length;
      
      // Track score trend
      if (metric === 'score') {
        scoreTrend = result.trend;
      }
    });
    
    // Determine overall direction
    let overallDirection = 'mixed';
    const totalMetrics = Object.values(directionCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalMetrics > 0) {
      if (directionCounts.improving > 0.6 * totalMetrics) {
        overallDirection = 'improving';
      } else if (directionCounts.degrading > 0.6 * totalMetrics) {
        overallDirection = 'degrading';
      } else if (directionCounts.stable > 0.6 * totalMetrics) {
        overallDirection = 'stable';
      }
    }
    
    return {
      direction: overallDirection,
      scoreTrend,
      metricsByDirection: directionCounts,
      totalMetrics,
      significantChangesCount: totalSignificantChanges,
      summary: this.generateSummaryText(overallDirection, directionCounts, totalMetrics, scoreTrend)
    };
  }
  
  /**
   * Generate a summary text for the overall trend
   * 
   * @param {string} direction - Overall direction
   * @param {Object} counts - Metric counts by direction
   * @param {number} total - Total metrics count
   * @param {Object} scoreTrend - Score trend data
   * @returns {string} - Summary text
   */
  generateSummaryText(direction, counts, total, scoreTrend) {
    let summary = `Overall performance trend is ${direction}. `;
    
    if (total > 0) {
      summary += `${counts.improving} of ${total} metrics show improvement, `;
      summary += `${counts.degrading} show degradation, and `;
      summary += `${counts.stable} remain stable. `;
    }
    
    if (scoreTrend) {
      const scoreChange = scoreTrend.percentChange.toFixed(1);
      if (Math.abs(scoreTrend.percentChange) > 1) {
        const direction = scoreTrend.percentChange > 0 ? 'increased' : 'decreased';
        summary += `Overall performance score has ${direction} by ${Math.abs(scoreChange)}% over the analyzed period.`;
      } else {
        summary += `Overall performance score has remained relatively stable (${scoreChange}% change).`;
      }
    }
    
    return summary;
  }
  
  /**
   * Determine if higher values are better for a metric
   * 
   * @param {string} metricKey - Metric key
   * @returns {boolean} - Whether higher is better
   */
  isHigherBetterForMetric(metricKey) {
    // Metrics where higher is better
    const higherIsBetter = [
      'score',
      'coreWebVitalsScore',
      'resourceEfficiencyScore',
      'javascriptExecutionScore',
      'browserCompatibilityScore'
    ];
    
    // Metrics where lower is better
    const lowerIsBetter = [
      'largestContentfulPaint',
      'cumulativeLayoutShift',
      'totalBlockingTime',
      'firstContentfulPaint',
      'timeToInteractive',
      'loadTime',
      'resourceSize',
      'requestCount',
      'highSeverityIssues',
      'mediumSeverityIssues',
      'mobileLCP',
      'mobileCLS',
      'mobileTBT',
      'mobileLoadTime',
      'desktopLCP',
      'desktopCLS',
      'desktopTBT',
      'desktopLoadTime',
      'totalRequests',
      'totalSize'
    ];
    
    if (higherIsBetter.includes(metricKey)) {
      return true;
    }
    
    if (lowerIsBetter.includes(metricKey)) {
      return false;
    }
    
    // Default to lower is better for unknown metrics
    return false;
  }
  
  /**
   * Get display name for a metric
   * 
   * @param {string} metricKey - Metric key
   * @returns {string} - Display name
   */
  getMetricDisplayName(metricKey) {
    const displayNames = {
      'score': 'Overall score',
      'coreWebVitalsScore': 'Core Web Vitals score',
      'resourceEfficiencyScore': 'Resource efficiency score',
      'javascriptExecutionScore': 'JavaScript performance score',
      'browserCompatibilityScore': 'Browser compatibility score',
      'largestContentfulPaint': 'Largest Contentful Paint',
      'cumulativeLayoutShift': 'Cumulative Layout Shift',
      'totalBlockingTime': 'Total Blocking Time',
      'firstContentfulPaint': 'First Contentful Paint',
      'timeToInteractive': 'Time to Interactive',
      'mobileLCP': 'Mobile LCP',
      'mobileCLS': 'Mobile CLS',
      'mobileTBT': 'Mobile TBT',
      'desktopLCP': 'Desktop LCP',
      'desktopCLS': 'Desktop CLS',
      'desktopTBT': 'Desktop TBT',
      'loadTime': 'Page load time',
      'resourceSize': 'Total resource size',
      'requestCount': 'Request count',
      'totalRequests': 'Total requests',
      'totalSize': 'Total page size',
      'highSeverityIssues': 'High severity issues',
      'mediumSeverityIssues': 'Medium severity issues'
    };
    
    return displayNames[metricKey] || metricKey;
  }
}

module.exports = MetricsTrendAnalyzer;
