/**
 * Trend Report
 * 
 * Generates comprehensive trend analysis reports by synthesizing historical data,
 * trend analysis, competitor benchmarking, and predictions into actionable insights.
 */

const logger = require('../../common/logger');

class TrendReport {
  constructor(data) {
    this.siteId = data.siteId;
    this.historicalData = data.historicalData || [];
    this.trendAnalysis = data.trendAnalysis || {};
    this.competitorBenchmarks = data.competitorBenchmarks || {};
    this.predictions = data.predictions || null;
    this.config = data.config || {};
    
    logger.debug(`Trend Report initialized for site: ${this.siteId}`);
  }
  
  /**
   * Generate a complete trend report
   * 
   * @returns {Object} - Complete trend report
   */
  generate() {
    logger.info(`Generating trend report for site: ${this.siteId}`);
    
    try {
      // Create the report structure
      const report = {
        siteId: this.siteId,
        timestamp: new Date().toISOString(),
        summary: this.generateSummary(),
        historicalAnalysis: this.processHistoricalAnalysis(),
        trendAnalysis: this.processTrendAnalysis(),
        competitorBenchmarks: this.processCompetitorBenchmarks(),
        predictions: this.processPredictions(),
        insightsAndRecommendations: this.generateInsightsAndRecommendations(),
        visualizationData: this.generateVisualizationData()
      };
      
      logger.info(`Trend report generated successfully for site: ${this.siteId}`);
      return report;
      
    } catch (error) {
      logger.error(`Failed to generate trend report: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate overall report summary
   * 
   * @returns {Object} - Report summary
   */
  generateSummary() {
    // Extract high-level information for the summary
    const historicalDataPoints = this.historicalData.length;
    const analyzedMetrics = this.trendAnalysis.analyzedMetrics || [];
    const competitorCount = this.competitorBenchmarks.competitors?.length || 0;
    
    // Get overall trend direction if available
    let overallTrend = 'unknown';
    let scoreTrend = null;
    
    if (this.trendAnalysis.overallTrend) {
      overallTrend = this.trendAnalysis.overallTrend.direction;
      scoreTrend = this.trendAnalysis.overallTrend.scoreTrend;
    }
    
    // Get key predictions if available
    let keyPredictions = [];
    
    if (this.predictions && this.predictions.metrics) {
      // Get predictions for score and core metrics
      const importantMetrics = ['score', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
      
      keyPredictions = Object.entries(this.predictions.metrics)
        .filter(([key]) => importantMetrics.includes(key))
        .map(([key, prediction]) => ({
          metric: key,
          metricName: prediction.metricName || key,
          percentChange: prediction.summary?.percentChange || 0,
          isPositiveChange: prediction.summary?.isPositiveChange || false
        }));
    }
    
    // Generate summary text
    const summaryText = this.generateSummaryText(overallTrend, scoreTrend, competitorCount, keyPredictions);
    
    return {
      siteId: this.siteId,
      reportDate: new Date().toISOString(),
      dataPoints: historicalDataPoints,
      analyzedMetrics,
      competitorCount,
      overallTrend,
      scoreTrend,
      keyPredictions,
      summaryText
    };
  }
  
  /**
   * Generate summary text for the report
   * 
   * @param {string} trend - Overall trend direction
   * @param {Object} scoreTrend - Score trend data
   * @param {number} competitorCount - Number of competitors
   * @param {Array<Object>} predictions - Key predictions
   * @returns {string} - Summary text
   */
  generateSummaryText(trend, scoreTrend, competitorCount, predictions) {
    let summary = `This trend analysis covers performance over time`;
    
    if (competitorCount > 0) {
      summary += ` and benchmarks against ${competitorCount} competitors`;
    }
    
    summary += `. `;
    
    // Add trend information
    if (trend && trend !== 'unknown') {
      if (trend === 'improving') {
        summary += `Overall performance is improving`;
      } else if (trend === 'degrading') {
        summary += `Overall performance is degrading`;
      } else if (trend === 'stable') {
        summary += `Overall performance is stable`;
      } else {
        summary += `Performance shows a ${trend} trend`;
      }
      
      if (scoreTrend && Math.abs(scoreTrend.percentChange) > 1) {
        const direction = scoreTrend.percentChange > 0 ? 'increased' : 'decreased';
        summary += `, with overall score ${direction} by ${Math.abs(scoreTrend.percentChange).toFixed(1)}%`;
      }
      
      summary += `. `;
    }
    
    // Add prediction information
    if (predictions && predictions.length > 0) {
      const scorePrediction = predictions.find(p => p.metric === 'score');
      
      if (scorePrediction) {
        const direction = scorePrediction.percentChange > 0 ? 'increase' : 'decrease';
        const impact = scorePrediction.isPositiveChange ? 'improving' : 'degrading';
        
        summary += `The performance score is predicted to ${direction} by ${Math.abs(scorePrediction.percentChange).toFixed(1)}% over the forecast period, ${impact} overall performance. `;
      }
    }
    
    return summary;
  }
  
  /**
   * Process historical data analysis
   * 
   * @returns {Object} - Processed historical analysis
   */
  processHistoricalAnalysis() {
    // Extract key information about historical data
    const snapshots = this.historicalData;
    
    if (!snapshots || snapshots.length === 0) {
      return {
        available: false,
        message: 'No historical data available'
      };
    }
    
    // Calculate date range
    const timestamps = snapshots.map(s => new Date(s.timestamp));
    const startDate = new Date(Math.min(...timestamps));
    const endDate = new Date(Math.max(...timestamps));
    const daysDifference = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Find available metrics
    const availableMetrics = new Set();
    
    snapshots.forEach(snapshot => {
      if (snapshot.metrics) {
        Object.keys(snapshot.metrics).forEach(key => availableMetrics.add(key));
      }
    });
    
    // Extract key metrics over time if score is available
    let scoreOverTime = null;
    
    if (availableMetrics.has('score')) {
      scoreOverTime = snapshots
        .filter(s => s.metrics && s.metrics.score !== undefined)
        .map(s => ({
          timestamp: new Date(s.timestamp),
          value: s.metrics.score
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    
    return {
      available: true,
      snapshots: snapshots.length,
      dateRange: {
        start: startDate,
        end: endDate,
        days: daysDifference
      },
      availableMetrics: Array.from(availableMetrics),
      scoreOverTime
    };
  }
  
  /**
   * Process trend analysis results
   * 
   * @returns {Object} - Processed trend analysis
   */
  processTrendAnalysis() {
    if (!this.trendAnalysis || !this.trendAnalysis.success) {
      return {
        available: false,
        message: 'No trend analysis available'
      };
    }
    
    // Extract overall trend information
    const overallTrend = this.trendAnalysis.overallTrend;
    
    // Extract significant changes across all metrics
    const significantChanges = [];
    
    Object.entries(this.trendAnalysis.metrics || {}).forEach(([metric, analysis]) => {
      if (analysis.significantChanges && analysis.significantChanges.length > 0) {
        analysis.significantChanges.forEach(change => {
          significantChanges.push({
            metric,
            metricName: this.getMetricDisplayName(metric),
            ...change
          });
        });
      }
    });
    
    // Sort significant changes by magnitude
    significantChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
    
    // Extract anomalies across all metrics
    const anomalies = [];
    
    Object.entries(this.trendAnalysis.metrics || {}).forEach(([metric, analysis]) => {
      if (analysis.anomalies && analysis.anomalies.length > 0) {
        analysis.anomalies.forEach(anomaly => {
          anomalies.push({
            metric,
            metricName: this.getMetricDisplayName(metric),
            ...anomaly
          });
        });
      }
    });
    
    // Sort anomalies by z-score
    anomalies.sort((a, b) => b.zScore - a.zScore);
    
    // Extract seasonality patterns
    const seasonalityPatterns = [];
    
    Object.entries(this.trendAnalysis.metrics || {}).forEach(([metric, analysis]) => {
      if (analysis.seasonality) {
        seasonalityPatterns.push({
          metric,
          metricName: this.getMetricDisplayName(metric),
          ...analysis.seasonality
        });
      }
    });
    
    return {
      available: true,
      overallTrend,
      metrics: this.trendAnalysis.metrics,
      significantChanges,
      anomalies,
      seasonalityPatterns,
      dataPointCount: this.trendAnalysis.dataPointCount,
      analyzedMetrics: this.trendAnalysis.analyzedMetrics
    };
  }
  
  /**
   * Process competitor benchmarking results
   * 
   * @returns {Object} - Processed competitor benchmarks
   */
  processCompetitorBenchmarks() {
    if (!this.competitorBenchmarks || !this.competitorBenchmarks.competitors) {
      return {
        available: false,
        message: 'No competitor benchmarks available'
      };
    }
    
    const competitors = this.competitorBenchmarks.competitors;
    
    if (competitors.length === 0) {
      return {
        available: false,
        message: 'No competitors registered'
      };
    }
    
    // Extract key metrics for ranking
    const keyMetrics = ['score', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
    const metricRankings = {};
    
    // For each key metric, rank competitors if available
    keyMetrics.forEach(metric => {
      // Filter competitors with this metric
      const withMetric = competitors.filter(c => c.metrics && c.metrics[metric] !== undefined);
      
      if (withMetric.length > 0) {
        // Determine if higher is better
        const higherIsBetter = this.isHigherBetterForMetric(metric);
        
        // Sort competitors
        const sorted = [...withMetric].sort((a, b) => {
          return higherIsBetter
            ? b.metrics[metric] - a.metrics[metric]  // Higher is better, descending
            : a.metrics[metric] - b.metrics[metric]; // Lower is better, ascending
        });
        
        // Create ranking
        metricRankings[metric] = sorted.map((competitor, index) => ({
          rank: index + 1,
          name: competitor.name,
          url: competitor.url,
          value: competitor.metrics[metric],
          lastUpdated: competitor.lastUpdated
        }));
      }
    });
    
    // Calculate overall competitive position based on score
    let competitivePosition = null;
    
    if (metricRankings.score && metricRankings.score.length > 0) {
      // Analyze score rankings
      const scoreRanking = metricRankings.score;
      const totalCount = scoreRanking.length;
      const topRank = scoreRanking[0].rank;
      const bottomRank = scoreRanking[scoreRanking.length - 1].rank;
      
      // Calculate percentile position
      const percentile = ((totalCount + 1 - topRank) / (totalCount + 1)) * 100;
      
      let status;
      if (percentile >= 80) {
        status = 'leader';        // Top 20%
      } else if (percentile >= 60) {
        status = 'strongPerformer'; // Top 40%
      } else if (percentile >= 40) {
        status = 'average';        // Middle 20%
      } else if (percentile >= 20) {
        status = 'belowAverage';   // Bottom 40%
      } else {
        status = 'lagging';        // Bottom 20%
      }
      
      competitivePosition = {
        rank: topRank,
        totalCompetitors: totalCount,
        percentile,
        status,
        scoreValue: scoreRanking[0].value
      };
    }
    
    return {
      available: true,
      competitors: competitors.map(c => ({
        name: c.name,
        url: c.url,
        lastUpdated: c.lastUpdated
      })),
      metricRankings,
      competitivePosition,
      competitorCount: competitors.length
    };
  }
  
  /**
   * Process prediction results
   * 
   * @returns {Object} - Processed predictions
   */
  processPredictions() {
    if (!this.predictions || !this.predictions.metrics) {
      return {
        available: false,
        message: 'No predictions available'
      };
    }
    
    // Extract key predictions
    const keyMetrics = ['score', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
    const keyPredictions = {};
    
    keyMetrics.forEach(metric => {
      if (this.predictions.metrics[metric]) {
        keyPredictions[metric] = this.predictions.metrics[metric];
      }
    });
    
    // Extract prediction summaries for all metrics
    const summaries = {};
    
    Object.entries(this.predictions.metrics).forEach(([metric, prediction]) => {
      if (prediction.summary) {
        summaries[metric] = prediction.summary;
      }
    });
    
    // Find metrics with significant predicted changes
    const significantChanges = Object.values(summaries)
      .filter(summary => Math.abs(summary.percentChange) >= 10)  // 10% or more change
      .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
    
    return {
      available: true,
      horizon: this.predictions.horizon,
      keyPredictions,
      allMetrics: this.predictions.metrics,
      summaries,
      significantChanges,
      timestamp: this.predictions.timestamp,
      predictedMetrics: this.predictions.predictedMetrics
    };
  }
  
  /**
   * Generate insights and recommendations
   * 
   * @returns {Object} - Insights and recommendations
   */
  generateInsightsAndRecommendations() {
    const insights = [];
    const recommendations = [];
    
    // Get insights from trend analysis
    if (this.trendAnalysis && this.trendAnalysis.metrics) {
      // Check for degrading core metrics
      Object.entries(this.trendAnalysis.metrics).forEach(([metric, analysis]) => {
        // Check if this is a core performance metric
        const isCoreMetric = [
          'largestContentfulPaint', 
          'cumulativeLayoutShift', 
          'totalBlockingTime',
          'firstContentfulPaint',
          'timeToInteractive'
        ].includes(metric);
        
        if (isCoreMetric && analysis.trend && analysis.trend.direction === 'degrading') {
          insights.push({
            type: 'degrading-metric',
            metric,
            metricName: this.getMetricDisplayName(metric),
            importance: 'high',
            description: `${this.getMetricDisplayName(metric)} is degrading by ${Math.abs(analysis.trend.percentChange).toFixed(1)}%`,
            percentChange: analysis.trend.percentChange,
            source: 'trend-analysis'
          });
          
          // Add recommendation
          recommendations.push({
            type: 'improve-metric',
            metric,
            metricName: this.getMetricDisplayName(metric),
            priority: 'high',
            title: `Improve ${this.getMetricDisplayName(metric)}`,
            description: `Focus on improving ${this.getMetricDisplayName(metric)} which is showing a degrading trend`,
            actions: this.getActionsForMetric(metric),
            source: 'trend-analysis'
          });
        }
      });
      
      // Check for significant changes
      const significantChanges = [];
      
      Object.entries(this.trendAnalysis.metrics).forEach(([metric, analysis]) => {
        if (analysis.significantChanges && analysis.significantChanges.length > 0) {
          significantChanges.push(...analysis.significantChanges.map(change => ({
            ...change,
            metric,
            metricName: this.getMetricDisplayName(metric)
          })));
        }
      });
      
      // Sort by magnitude and get top changes
      significantChanges
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
        .slice(0, 3)
        .forEach(change => {
          const direction = change.direction === 'increase' ? 'increased' : 'decreased';
          const impact = this.isPositiveChange(change.direction, change.metric) ? 'positive' : 'negative';
          
          insights.push({
            type: 'significant-change',
            metric: change.metric,
            metricName: change.metricName,
            importance: 'medium',
            description: `${change.metricName} ${direction} by ${Math.abs(change.percentChange).toFixed(1)}% (${impact} impact)`,
            percentChange: change.percentChange,
            direction: change.direction,
            impact,
            fromDate: change.fromDate,
            toDate: change.toDate,
            source: 'trend-analysis'
          });
        });
    }
    
    // Get insights from competitor benchmarks
    if (this.competitorBenchmarks && this.competitorBenchmarks.competitors && this.competitorBenchmarks.competitors.length > 0) {
      // Get competitive position if available
      const benchmarks = this.processCompetitorBenchmarks();
      
      if (benchmarks.competitivePosition) {
        const position = benchmarks.competitivePosition;
        
        // Add insight based on competitive position
        let competitiveInsight;
        
        if (position.status === 'leader') {
          competitiveInsight = {
            type: 'competitive-position',
            importance: 'high',
            description: `Leading the competition with top ranking in overall score`,
            position: position.rank,
            totalCompetitors: position.totalCompetitors,
            status: position.status,
            source: 'competitor-benchmarks'
          };
        } else if (position.status === 'lagging') {
          competitiveInsight = {
            type: 'competitive-position',
            importance: 'high',
            description: `Significantly behind competitors in overall score`,
            position: position.rank,
            totalCompetitors: position.totalCompetitors,
            status: position.status,
            source: 'competitor-benchmarks'
          };
          
          // Add recommendation
          recommendations.push({
            type: 'competitive-improvement',
            priority: 'high',
            title: 'Improve competitive position',
            description: 'Make significant improvements to catch up with competitors',
            actions: [
              'Analyze top competitors to identify their performance advantages',
              'Focus on metrics where the gap is largest',
              'Implement a performance improvement sprint to close the gap'
            ],
            source: 'competitor-benchmarks'
          });
        } else if (position.status === 'belowAverage') {
          competitiveInsight = {
            type: 'competitive-position',
            importance: 'medium',
            description: `Below average compared to competitors in overall score`,
            position: position.rank,
            totalCompetitors: position.totalCompetitors,
            status: position.status,
            source: 'competitor-benchmarks'
          };
          
          // Add recommendation
          recommendations.push({
            type: 'competitive-improvement',
            priority: 'medium',
            title: 'Improve competitive position',
            description: 'Make targeted improvements to match competitor performance',
            actions: [
              'Identify specific metrics where competitors outperform',
              'Implement focused improvements in those areas',
              'Track progress against competitor benchmarks'
            ],
            source: 'competitor-benchmarks'
          });
        }
        
        if (competitiveInsight) {
          insights.push(competitiveInsight);
        }
      }
      
      // Check for specific metrics where site is significantly behind
      if (benchmarks.metricRankings) {
        Object.entries(benchmarks.metricRankings).forEach(([metric, ranking]) => {
          // Skip if not a core metric
          if (!['largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'].includes(metric)) {
            return;
          }
          
          // Find this site in the ranking
          const siteRanking = ranking[0]; // First is the site
          
          // Check if ranking is in bottom half and there are at least 2 competitors
          if (siteRanking && siteRanking.rank > Math.ceil(ranking.length / 2) && ranking.length >= 3) {
            insights.push({
              type: 'competitive-gap',
              metric,
              metricName: this.getMetricDisplayName(metric),
              importance: 'medium',
              description: `Behind competitors in ${this.getMetricDisplayName(metric)} (ranked ${siteRanking.rank} of ${ranking.length})`,
              rank: siteRanking.rank,
              totalCompetitors: ranking.length,
              source: 'competitor-benchmarks'
            });
            
            // Add recommendation
            recommendations.push({
              type: 'competitive-improvement',
              metric,
              metricName: this.getMetricDisplayName(metric),
              priority: 'medium',
              title: `Improve ${this.getMetricDisplayName(metric)} to match competitors`,
              description: `Focus on improving ${this.getMetricDisplayName(metric)} where competitors are outperforming`,
              actions: this.getActionsForMetric(metric),
              source: 'competitor-benchmarks'
            });
          }
        });
      }
    }
    
    // Get insights from predictions
    if (this.predictions && this.predictions.metrics) {
      // Check for significant predicted changes
      const processedPredictions = this.processPredictions();
      
      if (processedPredictions.significantChanges) {
        processedPredictions.significantChanges.slice(0, 3).forEach(prediction => {
          insights.push({
            type: 'predicted-change',
            metric: prediction.metric,
            metricName: prediction.metricName,
            importance: prediction.isPositiveChange ? 'low' : 'medium',
            description: `${prediction.metricName} predicted to ${prediction.percentChange > 0 ? 'increase' : 'decrease'} by ${Math.abs(prediction.percentChange).toFixed(1)}%`,
            percentChange: prediction.percentChange,
            isPositiveChange: prediction.isPositiveChange,
            source: 'predictions'
          });
          
          // Add recommendation if negative change predicted
          if (!prediction.isPositiveChange) {
            recommendations.push({
              type: 'prevent-degradation',
              metric: prediction.metric,
              metricName: prediction.metricName,
              priority: 'medium',
              title: `Prevent predicted degradation in ${prediction.metricName}`,
              description: `Take action to prevent the predicted degradation of ${prediction.metricName}`,
              actions: this.getActionsForMetric(prediction.metric),
              source: 'predictions'
            });
          }
        });
      }
    }
    
    // Sort insights and recommendations by importance/priority
    const importancePriority = { high: 0, medium: 1, low: 2 };
    
    insights.sort((a, b) => importancePriority[a.importance] - importancePriority[b.importance]);
    recommendations.sort((a, b) => importancePriority[a.priority] - importancePriority[b.priority]);
    
    return {
      insights,
      recommendations
    };
  }
  
  /**
   * Generate data for visualizations
   * 
   * @returns {Object} - Visualization data
   */
  generateVisualizationData() {
    const visualizations = {};
    
    // Generate historical trend visualization data
    if (this.historicalData && this.historicalData.length > 0) {
      // Get core metrics to visualize
      const coreMetrics = ['score', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
      const availableMetrics = this.getAvailableMetrics();
      
      // Filter to metrics that are available
      const metricsToVisualize = coreMetrics.filter(metric => availableMetrics.includes(metric));
      
      if (metricsToVisualize.length > 0) {
        visualizations.historicalTrends = this.generateHistoricalTrendData(metricsToVisualize);
      }
    }
    
    // Generate competitor benchmark visualization data
    if (this.competitorBenchmarks && this.competitorBenchmarks.competitors && this.competitorBenchmarks.competitors.length > 0) {
      const benchmarks = this.processCompetitorBenchmarks();
      
      if (benchmarks.metricRankings) {
        // Generate data for core metrics
        const coreMetrics = ['score', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
        const availableMetrics = Object.keys(benchmarks.metricRankings);
        
        // Filter to metrics that are available
        const metricsToVisualize = coreMetrics.filter(metric => availableMetrics.includes(metric));
        
        if (metricsToVisualize.length > 0) {
          visualizations.competitorBenchmarks = this.generateCompetitorBenchmarkData(metricsToVisualize, benchmarks.metricRankings);
        }
      }
    }
    
    // Generate prediction visualization data
    if (this.predictions && this.predictions.metrics) {
      // Get core metrics to visualize
      const coreMetrics = ['score', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime'];
      const availableMetrics = Object.keys(this.predictions.metrics);
      
      // Filter to metrics that are available
      const metricsToVisualize = coreMetrics.filter(metric => availableMetrics.includes(metric));
      
      if (metricsToVisualize.length > 0) {
        visualizations.predictions = this.generatePredictionVisualizationData(metricsToVisualize);
      }
    }
    
    return visualizations;
  }
  
  /**
   * Generate data for historical trend visualization
   * 
   * @param {Array<string>} metrics - Metrics to visualize
   * @returns {Object} - Visualization data
   */
  generateHistoricalTrendData(metrics) {
    const trendData = {};
    
    metrics.forEach(metric => {
      // Extract data for this metric
      const metricData = this.historicalData
        .filter(snapshot => snapshot.metrics && snapshot.metrics[metric] !== undefined)
        .map(snapshot => ({
          timestamp: new Date(snapshot.timestamp),
          value: snapshot.metrics[metric]
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      if (metricData.length > 0) {
        trendData[metric] = {
          metric,
          metricName: this.getMetricDisplayName(metric),
          higherIsBetter: this.isHigherBetterForMetric(metric),
          data: metricData,
          trend: this.trendAnalysis?.metrics?.[metric]?.trend
        };
      }
    });
    
    return trendData;
  }
  
  /**
   * Generate data for competitor benchmark visualization
   * 
   * @param {Array<string>} metrics - Metrics to visualize
   * @param {Object} metricRankings - Metric rankings
   * @returns {Object} - Visualization data
   */
  generateCompetitorBenchmarkData(metrics, metricRankings) {
    const benchmarkData = {};
    
    metrics.forEach(metric => {
      if (metricRankings[metric]) {
        benchmarkData[metric] = {
          metric,
          metricName: this.getMetricDisplayName(metric),
          higherIsBetter: this.isHigherBetterForMetric(metric),
          rankings: metricRankings[metric]
        };
      }
    });
    
    return benchmarkData;
  }
  
  /**
   * Generate data for prediction visualization
   * 
   * @param {Array<string>} metrics - Metrics to visualize
   * @returns {Object} - Visualization data
   */
  generatePredictionVisualizationData(metrics) {
    const predictionData = {};
    
    metrics.forEach(metric => {
      const prediction = this.predictions.metrics[metric];
      
      if (prediction && prediction.predictions && prediction.predictions.ensemble) {
        // Get historical data for this metric
        const historicalData = this.historicalData
          .filter(snapshot => snapshot.metrics && snapshot.metrics[metric] !== undefined)
          .map(snapshot => ({
            timestamp: new Date(snapshot.timestamp),
            value: snapshot.metrics[metric]
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        
        // Get last 30 days of historical data
        const recentHistoricalData = historicalData.slice(-30);
        
        predictionData[metric] = {
          metric,
          metricName: prediction.metricName || this.getMetricDisplayName(metric),
          higherIsBetter: this.isHigherBetterForMetric(metric),
          historicalData: recentHistoricalData,
          predictionData: prediction.predictions.ensemble,
          confidenceIntervals: prediction.predictions.confidenceIntervals,
          summary: prediction.summary
        };
      }
    });
    
    return predictionData;
  }
  
  /**
   * Get a list of available metrics from historical data
   * 
   * @returns {Array<string>} - Available metrics
   */
  getAvailableMetrics() {
    const availableMetrics = new Set();
    
    this.historicalData.forEach(snapshot => {
      if (snapshot.metrics) {
        Object.keys(snapshot.metrics).forEach(key => availableMetrics.add(key));
      }
    });
    
    return Array.from(availableMetrics);
  }
  
  /**
   * Get recommended actions for a metric
   * 
   * @param {string} metric - Metric key
   * @returns {Array<string>} - Recommended actions
   */
  getActionsForMetric(metric) {
    const actionRecommendations = {
      'largestContentfulPaint': [
        'Optimize and preload critical resources',
        'Reduce server response time',
        'Minimize render-blocking resources',
        'Optimize and compress images',
        'Use CDN for faster content delivery'
      ],
      'cumulativeLayoutShift': [
        'Set explicit width and height for images and videos',
        'Ensure ads elements have reserved space',
        'Avoid inserting content above existing content',
        'Minimize web font loading shifts with font-display: swap',
        'Precompute sufficient space for dynamic content'
      ],
      'totalBlockingTime': [
        'Break up long tasks into smaller, async tasks',
        'Optimize JavaScript execution',
        'Reduce JavaScript payload by removing unused code',
        'Defer non-critical JavaScript',
        'Minimize main-thread work'
      ],
      'firstContentfulPaint': [
        'Eliminate render-blocking resources',
        'Minify CSS and JavaScript',
        'Remove unused CSS',
        'Preconnect to required origins',
        'Reduce server response times'
      ],
      'timeToInteractive': [
        'Minimize main thread work',
        'Reduce JavaScript execution time',
        'Remove unused JavaScript',
        'Implement code splitting',
        'Use Web Workers for heavy processing'
      ],
      'score': [
        'Focus on Core Web Vitals improvements',
        'Prioritize mobile performance',
        'Optimize resource loading and execution',
        'Implement performance monitoring',
        'Address technical SEO issues'
      ]
    };
    
    return actionRecommendations[metric] || [
      'Analyze the metric to identify specific issues',
      'Create a focused improvement plan',
      'Implement changes incrementally',
      'Monitor the impact of changes',
      'Compare against competitors and industry benchmarks'
    ];
  }
  
  /**
   * Determine if a change direction is positive for a metric
   * 
   * @param {string} direction - Change direction (increase/decrease)
   * @param {string} metricKey - Metric key
   * @returns {boolean} - Whether change is positive
   */
  isPositiveChange(direction, metricKey) {
    const higherIsBetter = this.isHigherBetterForMetric(metricKey);
    
    return (direction === 'increase' && higherIsBetter) || 
           (direction === 'decrease' && !higherIsBetter);
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

module.exports = TrendReport;
