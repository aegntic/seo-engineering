/**
 * Performance Prediction Engine
 * 
 * Provides predictive analytics for performance metrics based on historical data.
 * Implements multiple forecasting algorithms to predict future metric values.
 */

const logger = require('../../common/logger');

class PerformancePredictionEngine {
  constructor(options = {}) {
    this.config = {
      // Default prediction horizon in days
      defaultHorizon: options.defaultHorizon || 30,
      
      // Minimum data points required for prediction
      minDataPoints: options.minDataPoints || 10,
      
      // Prediction algorithms to use
      algorithms: options.algorithms || ['linear', 'movingAverage', 'weightedMovingAverage'],
      
      // Weights for ensemble prediction
      algorithmWeights: options.algorithmWeights || {
        linear: 0.4,
        movingAverage: 0.3,
        weightedMovingAverage: 0.3
      },
      
      // Moving average window size
      maWindowSize: options.maWindowSize || 7,
      
      // Weighted moving average decay factor
      wmaDecayFactor: options.wmaDecayFactor || 0.9,
      
      // Confidence interval level (0-1)
      confidenceLevel: options.confidenceLevel || 0.8,
      
      // Whether to consider seasonality
      considerSeasonality: options.considerSeasonality !== false,
      
      ...options
    };
    
    logger.info('Performance Prediction Engine initialized');
  }
  
  /**
   * Predict future values for multiple metrics
   * 
   * @param {Array<Object>} historicalData - Historical data points
   * @param {Array<string>} metricsToPredict - Metrics to predict
   * @param {number} horizon - Prediction horizon in days
   * @param {Object} options - Prediction options
   * @returns {Promise<Object>} - Predictions for metrics
   */
  async predictMetrics(historicalData, metricsToPredict = [], horizon = null, options = {}) {
    logger.info(`Predicting ${metricsToPredict.length || 'all'} metrics for ${horizon || this.config.defaultHorizon} days`);
    
    try {
      // Use provided horizon or default
      const predictionHorizon = horizon || this.config.defaultHorizon;
      
      // Sort data by timestamp
      const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Get list of all metrics if none specified
      const metrics = metricsToPredict.length > 0 
        ? metricsToPredict 
        : this.getAvailableMetrics(sortedData);
      
      // Generate predictions for each metric
      const predictions = {};
      
      for (const metric of metrics) {
        try {
          const metricData = this.extractMetricData(sortedData, metric);
          
          // Skip if not enough data points
          if (metricData.length < this.config.minDataPoints) {
            logger.debug(`Not enough data points for metric ${metric} prediction`);
            continue;
          }
          
          // Predict this metric
          predictions[metric] = await this.predictSingleMetric(
            metricData,
            metric,
            predictionHorizon,
            options
          );
          
        } catch (error) {
          logger.error(`Error predicting metric ${metric}: ${error.message}`);
          // Continue with other metrics
        }
      }
      
      return {
        success: true,
        horizon: predictionHorizon,
        metrics: predictions,
        timestamp: new Date(),
        predictedMetrics: Object.keys(predictions)
      };
      
    } catch (error) {
      logger.error(`Failed to predict metrics: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Predict future values for a single metric
   * 
   * @param {Array<Object>} metricData - Metric data points
   * @param {string} metricKey - Metric key
   * @param {number} horizon - Prediction horizon in days
   * @param {Object} options - Prediction options
   * @returns {Promise<Object>} - Prediction for metric
   */
  async predictSingleMetric(metricData, metricKey, horizon = 30, options = {}) {
    logger.debug(`Predicting metric ${metricKey} for ${horizon} days`);
    
    try {
      // Ensure we have enough data points
      if (metricData.length < this.config.minDataPoints) {
        return {
          success: false,
          metricKey,
          message: `Not enough data points for prediction (${metricData.length} < ${this.config.minDataPoints})`
        };
      }
      
      // Configure algorithms
      const algorithms = options.algorithms || this.config.algorithms;
      const algorithmWeights = options.algorithmWeights || this.config.algorithmWeights;
      
      // Generate predictions using each algorithm
      const algorithmPredictions = {};
      
      for (const algorithm of algorithms) {
        try {
          const prediction = this.predictWithAlgorithm(
            metricData,
            algorithm,
            horizon,
            options
          );
          
          algorithmPredictions[algorithm] = prediction;
        } catch (error) {
          logger.error(`Error with ${algorithm} prediction: ${error.message}`);
          // Continue with other algorithms
        }
      }
      
      // Generate ensemble prediction
      const ensemblePrediction = this.generateEnsemblePrediction(
        algorithmPredictions,
        algorithmWeights,
        horizon
      );
      
      // Calculate confidence intervals
      const confidenceIntervals = this.calculateConfidenceIntervals(
        ensemblePrediction,
        metricData,
        options.confidenceLevel || this.config.confidenceLevel
      );
      
      // Generate prediction summary
      const summary = this.generatePredictionSummary(
        metricKey,
        metricData,
        ensemblePrediction,
        confidenceIntervals,
        horizon
      );
      
      return {
        success: true,
        metricKey,
        metricName: this.getMetricDisplayName(metricKey),
        timeframe: {
          start: ensemblePrediction[0].timestamp,
          end: ensemblePrediction[ensemblePrediction.length - 1].timestamp,
          horizon
        },
        predictions: {
          ensemble: ensemblePrediction,
          byAlgorithm: algorithmPredictions,
          confidenceIntervals
        },
        summary,
        algorithms
      };
      
    } catch (error) {
      logger.error(`Failed to predict metric ${metricKey}: ${error.message}`);
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
   * Get list of available metrics in the data
   * 
   * @param {Array<Object>} data - Historical data
   * @returns {Array<string>} - Available metrics
   */
  getAvailableMetrics(data) {
    if (data.length === 0) {
      return [];
    }
    
    // Get metrics from the first data point with metrics
    for (const snapshot of data) {
      if (snapshot.metrics) {
        return Object.keys(snapshot.metrics);
      }
    }
    
    return [];
  }
  
  /**
   * Predict values using a specific algorithm
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {string} algorithm - Algorithm name
   * @param {number} horizon - Prediction horizon in days
   * @param {Object} options - Algorithm-specific options
   * @returns {Array<Object>} - Predicted data points
   */
  predictWithAlgorithm(data, algorithm, horizon, options = {}) {
    switch (algorithm) {
      case 'linear':
        return this.linearRegression(data, horizon, options);
      case 'movingAverage':
        return this.movingAveragePrediction(data, horizon, options);
      case 'weightedMovingAverage':
        return this.weightedMovingAveragePrediction(data, horizon, options);
      default:
        throw new Error(`Unknown prediction algorithm: ${algorithm}`);
    }
  }
  
  /**
   * Predict using linear regression
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {number} horizon - Prediction horizon in days
   * @param {Object} options - Algorithm options
   * @returns {Array<Object>} - Predicted data points
   */
  linearRegression(data, horizon, options = {}) {
    // Convert timestamps to days since first data point
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
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate predictions
    const predictions = [];
    const lastDay = xValues[xValues.length - 1];
    
    for (let i = 1; i <= horizon; i++) {
      const day = lastDay + i;
      const forecastValue = slope * day + intercept;
      const forecastTimestamp = new Date(firstTimestamp + day * 24 * 60 * 60 * 1000);
      
      predictions.push({
        timestamp: forecastTimestamp,
        value: forecastValue,
        day: i,
        algorithm: 'linear'
      });
    }
    
    return predictions;
  }
  
  /**
   * Predict using moving average
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {number} horizon - Prediction horizon in days
   * @param {Object} options - Algorithm options
   * @returns {Array<Object>} - Predicted data points
   */
  movingAveragePrediction(data, horizon, options = {}) {
    // Get window size
    const windowSize = options.maWindowSize || this.config.maWindowSize;
    
    // Get the last window of data points
    const lastWindow = data.slice(-windowSize);
    const values = lastWindow.map(point => point.value);
    const avgValue = values.reduce((acc, val) => acc + val, 0) / values.length;
    
    // Generate predictions (flat line at moving average)
    const predictions = [];
    const lastTimestamp = data[data.length - 1].timestamp.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 1; i <= horizon; i++) {
      const forecastTimestamp = new Date(lastTimestamp + i * dayMs);
      
      predictions.push({
        timestamp: forecastTimestamp,
        value: avgValue,
        day: i,
        algorithm: 'movingAverage'
      });
    }
    
    return predictions;
  }
  
  /**
   * Predict using weighted moving average
   * 
   * @param {Array<Object>} data - Metric data points
   * @param {number} horizon - Prediction horizon in days
   * @param {Object} options - Algorithm options
   * @returns {Array<Object>} - Predicted data points
   */
  weightedMovingAveragePrediction(data, horizon, options = {}) {
    // Get window size and decay factor
    const windowSize = options.maWindowSize || this.config.maWindowSize;
    const decayFactor = options.wmaDecayFactor || this.config.wmaDecayFactor;
    
    // Get the last window of data points
    const lastWindow = data.slice(-windowSize);
    
    // Calculate weighted average
    let weightSum = 0;
    let valueSum = 0;
    
    for (let i = 0; i < lastWindow.length; i++) {
      // Weight decreases with age (more recent data has higher weight)
      const weight = Math.pow(decayFactor, lastWindow.length - 1 - i);
      weightSum += weight;
      valueSum += lastWindow[i].value * weight;
    }
    
    const weightedAvg = valueSum / weightSum;
    
    // Generate predictions (flat line at weighted moving average)
    const predictions = [];
    const lastTimestamp = data[data.length - 1].timestamp.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 1; i <= horizon; i++) {
      const forecastTimestamp = new Date(lastTimestamp + i * dayMs);
      
      predictions.push({
        timestamp: forecastTimestamp,
        value: weightedAvg,
        day: i,
        algorithm: 'weightedMovingAverage'
      });
    }
    
    return predictions;
  }
  
  /**
   * Generate ensemble prediction from multiple algorithms
   * 
   * @param {Object} algorithmPredictions - Predictions by algorithm
   * @param {Object} weights - Algorithm weights
   * @param {number} horizon - Prediction horizon
   * @returns {Array<Object>} - Ensemble prediction
   */
  generateEnsemblePrediction(algorithmPredictions, weights, horizon) {
    // Get available algorithms with predictions
    const availableAlgorithms = Object.keys(algorithmPredictions);
    
    if (availableAlgorithms.length === 0) {
      throw new Error('No algorithm predictions available for ensemble');
    }
    
    // If only one algorithm, return its predictions
    if (availableAlgorithms.length === 1) {
      const predictions = algorithmPredictions[availableAlgorithms[0]];
      
      // Mark as ensemble
      return predictions.map(p => ({
        ...p,
        algorithm: 'ensemble'
      }));
    }
    
    // Normalize weights for available algorithms
    const normalizedWeights = {};
    let weightSum = 0;
    
    availableAlgorithms.forEach(alg => {
      normalizedWeights[alg] = weights[alg] || 1;
      weightSum += normalizedWeights[alg];
    });
    
    availableAlgorithms.forEach(alg => {
      normalizedWeights[alg] /= weightSum;
    });
    
    // Generate ensemble predictions
    const ensemblePredictions = [];
    
    for (let i = 0; i < horizon; i++) {
      // Get values from each algorithm for this day
      let weightedSum = 0;
      let timestamp = null;
      
      availableAlgorithms.forEach(alg => {
        const prediction = algorithmPredictions[alg][i];
        if (!timestamp) timestamp = prediction.timestamp;
        weightedSum += prediction.value * normalizedWeights[alg];
      });
      
      ensemblePredictions.push({
        timestamp,
        value: weightedSum,
        day: i + 1,
        algorithm: 'ensemble'
      });
    }
    
    return ensemblePredictions;
  }
  
  /**
   * Calculate confidence intervals for predictions
   * 
   * @param {Array<Object>} predictions - Ensemble predictions
   * @param {Array<Object>} historicalData - Historical data points
   * @param {number} confidenceLevel - Confidence level (0-1)
   * @returns {Array<Object>} - Confidence intervals
   */
  calculateConfidenceIntervals(predictions, historicalData, confidenceLevel) {
    // Calculate standard deviation of historical data
    const values = historicalData.map(point => point.value);
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate z-score for confidence level
    // For 80% confidence, z-score is approximately 1.28
    // For 90% confidence, z-score is approximately 1.645
    // For 95% confidence, z-score is approximately 1.96
    const zScores = {
      0.8: 1.28,
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    
    // Get closest z-score
    const availableConfidenceLevels = Object.keys(zScores).map(k => parseFloat(k));
    const closestLevel = availableConfidenceLevels.reduce((prev, curr) => 
      Math.abs(curr - confidenceLevel) < Math.abs(prev - confidenceLevel) ? curr : prev
    );
    const zScore = zScores[closestLevel];
    
    // Calculate prediction intervals
    // The further into the future, the wider the interval becomes
    return predictions.map((prediction, index) => {
      // Increase uncertainty with prediction distance
      const uncertaintyFactor = 1 + (index / predictions.length);
      const margin = zScore * stdDev * uncertaintyFactor;
      
      return {
        timestamp: prediction.timestamp,
        day: prediction.day,
        center: prediction.value,
        lower: prediction.value - margin,
        upper: prediction.value + margin,
        margin,
        confidenceLevel
      };
    });
  }
  
  /**
   * Generate a summary of the prediction
   * 
   * @param {string} metricKey - Metric key
   * @param {Array<Object>} historicalData - Historical data
   * @param {Array<Object>} predictions - Predictions
   * @param {Array<Object>} confidenceIntervals - Confidence intervals
   * @param {number} horizon - Prediction horizon
   * @returns {Object} - Prediction summary
   */
  generatePredictionSummary(metricKey, historicalData, predictions, confidenceIntervals, horizon) {
    // Get the current value (last historical data point)
    const currentValue = historicalData[historicalData.length - 1].value;
    
    // Get the predicted value at the end of the horizon
    const finalPrediction = predictions[predictions.length - 1].value;
    
    // Calculate percent change
    const percentChange = ((finalPrediction - currentValue) / currentValue) * 100;
    
    // Determine if higher is better for this metric
    const higherIsBetter = this.isHigherBetterForMetric(metricKey);
    
    // Determine if the predicted change is positive for performance
    const isPositiveChange = (higherIsBetter && percentChange > 0) || (!higherIsBetter && percentChange < 0);
    
    // Get prediction confidence interval at horizon end
    const finalInterval = confidenceIntervals[confidenceIntervals.length - 1];
    const worstCase = higherIsBetter ? finalInterval.lower : finalInterval.upper;
    const bestCase = higherIsBetter ? finalInterval.upper : finalInterval.lower;
    
    // Determine trend stability using confidence interval width
    const intervalWidth = finalInterval.upper - finalInterval.lower;
    const relativeIntervalWidth = intervalWidth / Math.abs(currentValue);
    
    let stability;
    if (relativeIntervalWidth < 0.1) {
      stability = 'high';
    } else if (relativeIntervalWidth < 0.3) {
      stability = 'medium';
    } else {
      stability = 'low';
    }
    
    // Generate text summary
    const directionText = percentChange > 0 ? 'increase' : 'decrease';
    const performanceImpact = isPositiveChange ? 'improve' : 'degrade';
    
    let summaryText = `${this.getMetricDisplayName(metricKey)} is predicted to ${directionText} by ${Math.abs(percentChange).toFixed(1)}% over the next ${horizon} days, `;
    summaryText += `which would ${performanceImpact} performance. `;
    summaryText += `Prediction stability is ${stability}.`;
    
    return {
      metric: metricKey,
      metricName: this.getMetricDisplayName(metricKey),
      currentValue,
      finalPrediction,
      percentChange,
      isPositiveChange,
      worstCase,
      bestCase,
      stabilityLevel: stability,
      summaryText
    };
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

module.exports = PerformancePredictionEngine;
