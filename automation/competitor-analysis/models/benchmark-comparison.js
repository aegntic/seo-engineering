/**
 * Benchmark Comparison Model
 * 
 * This model represents a benchmark comparison between a client site,
 * its direct competitors, and industry benchmarks.
 */

class BenchmarkComparison {
  /**
   * Create a new benchmark comparison
   * @param {Object} clientData Client site data
   * @param {Object} competitorsData Competitors data
   * @param {Object} industryBenchmarks Industry benchmark data
   * @param {Array} categories Categories to benchmark
   */
  constructor(clientData, competitorsData, industryBenchmarks = {}, categories = []) {
    this.clientData = clientData;
    this.competitorsData = competitorsData;
    this.industryBenchmarks = industryBenchmarks;
    this.categories = categories.length > 0 ? categories : [
      'technical', 'content', 'keywords', 'performance', 'onPage', 'structure'
    ];
    
    this.benchmarks = {};
    this.rankings = {};
    this.trends = {};
    this.recommendations = [];
    this.visualizationData = {};
  }

  /**
   * Get benchmark data for a specific category
   * @param {string} category The category to get benchmarks for
   * @returns {Object} Benchmark data
   */
  getBenchmarkData(category) {
    return this.benchmarks[category] || {};
  }

  /**
   * Get all benchmark data
   * @returns {Object} All benchmark data
   */
  getAllBenchmarkData() {
    return this.benchmarks;
  }

  /**
   * Get ranking data for a specific category
   * @param {string} category The category to get rankings for
   * @returns {Object} Ranking data
   */
  getRankingData(category) {
    return this.rankings[category] || {};
  }

  /**
   * Get all ranking data
   * @returns {Object} All ranking data
   */
  getAllRankingData() {
    return this.rankings;
  }

  /**
   * Get trend data for a specific category
   * @param {string} category The category to get trends for
   * @returns {Object} Trend data
   */
  getTrendData(category) {
    return this.trends[category] || {};
  }

  /**
   * Get all trend data
   * @returns {Object} All trend data
   */
  getAllTrendData() {
    return this.trends;
  }

  /**
   * Get recommendations based on benchmark comparison
   * @returns {Array} Recommendations
   */
  getRecommendations() {
    return this.recommendations;
  }

  /**
   * Set benchmark data for a category
   * @param {string} category Category name
   * @param {Object} data Benchmark data
   */
  setBenchmarkData(category, data) {
    this.benchmarks[category] = data;
  }

  /**
   * Set ranking data for a category
   * @param {string} category Category name
   * @param {Object} data Ranking data
   */
  setRankingData(category, data) {
    this.rankings[category] = data;
  }

  /**
   * Set trend data for a category
   * @param {string} category Category name
   * @param {Object} data Trend data
   */
  setTrendData(category, data) {
    this.trends[category] = data;
  }

  /**
   * Add a recommendation based on benchmark comparison
   * @param {Object} recommendation Recommendation object
   */
  addRecommendation(recommendation) {
    this.recommendations.push(recommendation);
  }

  /**
   * Generate visualization data for the benchmark comparison
   * @returns {Object} Visualization data
   */
  generateVisualizationData() {
    this.visualizationData = {
      radar: this._generateRadarChartData(),
      rankings: this._generateRankingsChartData(),
      trends: this._generateTrendsChartData(),
      distribution: this._generateDistributionChartData()
    };
    
    return this.visualizationData;
  }

  /**
   * Generate radar chart data
   * @returns {Object} Radar chart data
   * @private
   */
  _generateRadarChartData() {
    const categories = this.categories;
    const clientScores = [];
    const competitorAvgScores = [];
    const industryBenchmarkScores = [];
    
    categories.forEach(category => {
      const benchmark = this.benchmarks[category] || {};
      
      clientScores.push(benchmark.clientScore || 0);
      competitorAvgScores.push(benchmark.competitorAverage || 0);
      industryBenchmarkScores.push(benchmark.industryBenchmark || 0);
    });
    
    return {
      categories,
      series: [
        {
          name: 'Your Site',
          data: clientScores
        },
        {
          name: 'Competitor Average',
          data: competitorAvgScores
        },
        {
          name: 'Industry Benchmark',
          data: industryBenchmarkScores
        }
      ]
    };
  }

  /**
   * Generate rankings chart data
   * @returns {Object} Rankings chart data
   * @private
   */
  _generateRankingsChartData() {
    const categories = this.categories;
    const rankingData = {};
    
    categories.forEach(category => {
      const ranking = this.rankings[category] || {};
      
      if (ranking.competitors && ranking.competitors.length > 0) {
        rankingData[category] = {
          clientRank: ranking.clientRank || 0,
          totalCompetitors: ranking.competitors.length,
          competitors: ranking.competitors.map(comp => ({
            name: comp.name,
            score: comp.score
          }))
        };
      }
    });
    
    return rankingData;
  }

  /**
   * Generate trends chart data
   * @returns {Object} Trends chart data
   * @private
   */
  _generateTrendsChartData() {
    const categories = this.categories;
    const trendData = {};
    
    categories.forEach(category => {
      const trend = this.trends[category] || {};
      
      if (trend.history && trend.history.length > 0) {
        trendData[category] = {
          clientHistory: trend.clientHistory || [],
          competitorHistory: trend.competitorHistory || [],
          industryHistory: trend.industryHistory || [],
          forecastClient: trend.forecastClient || [],
          forecastCompetitor: trend.forecastCompetitor || []
        };
      }
    });
    
    return trendData;
  }

  /**
   * Generate distribution chart data
   * @returns {Object} Distribution chart data
   * @private
   */
  _generateDistributionChartData() {
    const categories = this.categories;
    const distributionData = {};
    
    categories.forEach(category => {
      const benchmark = this.benchmarks[category] || {};
      
      if (benchmark.distribution) {
        distributionData[category] = benchmark.distribution;
      }
    });
    
    return distributionData;
  }

  /**
   * Generate a report of the benchmark comparison
   * @returns {string} Markdown report
   */
  generateMarkdownReport() {
    let report = `# Benchmark Comparison Report\n\n`;
    
    // Introduction
    report += `## Overview\n\n`;
    report += `This report compares your site's performance against direct competitors and industry benchmarks across multiple categories.\n\n`;
    
    // Category Benchmarks
    report += `## Category Benchmarks\n\n`;
    
    this.categories.forEach(category => {
      const benchmark = this.benchmarks[category] || {};
      
      report += `### ${this._formatCategoryName(category)}\n\n`;
      
      if (Object.keys(benchmark).length === 0) {
        report += `No benchmark data available for this category.\n\n`;
        return;
      }
      
      report += `| Metric | Your Score | Competitor Avg | Industry Benchmark |\n`;
      report += `|--------|------------|---------------|--------------------|\n`;
      
      // Main score
      const clientScore = benchmark.clientScore || 0;
      const competitorAvg = benchmark.competitorAverage || 0;
      const industryBenchmark = benchmark.industryBenchmark || 0;
      
      const vsCompetitor = clientScore - competitorAvg;
      const vsIndustry = clientScore - industryBenchmark;
      
      const vsCompetitorIcon = this._getComparisonIcon(vsCompetitor);
      const vsIndustryIcon = this._getComparisonIcon(vsIndustry);
      
      report += `| Score | ${clientScore.toFixed(1)} | ${competitorAvg.toFixed(1)} ${vsCompetitorIcon} | ${industryBenchmark.toFixed(1)} ${vsIndustryIcon} |\n`;
      
      // Sub-metrics
      if (benchmark.metrics && Object.keys(benchmark.metrics).length > 0) {
        Object.entries(benchmark.metrics).forEach(([metricName, metricData]) => {
          const clientMetric = metricData.clientValue || 0;
          const competitorMetric = metricData.competitorAverage || 0;
          const industryMetric = metricData.industryAverage || 0;
          
          const vsCompMetric = this._compareMetric(metricName, clientMetric, competitorMetric);
          const vsIndMetric = this._compareMetric(metricName, clientMetric, industryMetric);
          
          const vsCompMetricIcon = this._getComparisonIcon(vsCompMetric);
          const vsIndMetricIcon = this._getComparisonIcon(vsIndMetric);
          
          report += `| ${this._formatMetricName(metricName)} | ${this._formatMetricValue(metricName, clientMetric)} | ${this._formatMetricValue(metricName, competitorMetric)} ${vsCompMetricIcon} | ${this._formatMetricValue(metricName, industryMetric)} ${vsIndMetricIcon} |\n`;
        });
      }
      
      report += `\n`;
      
      // Rankings
      const ranking = this.rankings[category] || {};
      
      if (ranking.clientRank && ranking.competitors && ranking.competitors.length > 0) {
        report += `#### Ranking\n\n`;
        report += `Your site ranks **${ranking.clientRank}** out of ${ranking.competitors.length + 1} in this category.\n\n`;
        
        // Top 3 competitors in this category
        const topCompetitors = [...ranking.competitors]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        
        if (topCompetitors.length > 0) {
          report += `**Top performers:**\n\n`;
          
          topCompetitors.forEach((competitor, index) => {
            report += `${index + 1}. ${competitor.name}: ${competitor.score.toFixed(1)}\n`;
          });
          
          report += `\n`;
        }
      }
      
      // Trends
      const trend = this.trends[category] || {};
      
      if (trend.clientHistory && trend.clientHistory.length > 0) {
        report += `#### Trend\n\n`;
        
        const lastTwoPoints = trend.clientHistory.slice(-2);
        
        if (lastTwoPoints.length === 2) {
          const change = lastTwoPoints[1].value - lastTwoPoints[0].value;
          const changePercent = (change / lastTwoPoints[0].value) * 100;
          
          if (change > 0) {
            report += `Your score has **improved by ${changePercent.toFixed(1)}%** over the last period.\n\n`;
          } else if (change < 0) {
            report += `Your score has **decreased by ${Math.abs(changePercent).toFixed(1)}%** over the last period.\n\n`;
          } else {
            report += `Your score has **remained stable** over the last period.\n\n`;
          }
        }
        
        if (trend.forecastClient && trend.forecastClient.length > 0) {
          const forecastChange = trend.forecastClient[trend.forecastClient.length - 1].value - trend.clientHistory[trend.clientHistory.length - 1].value;
          const forecastPercent = (forecastChange / trend.clientHistory[trend.clientHistory.length - 1].value) * 100;
          
          if (forecastChange > 0) {
            report += `**Forecast:** Your score is projected to **improve by ${forecastPercent.toFixed(1)}%** in the next period.\n\n`;
          } else if (forecastChange < 0) {
            report += `**Forecast:** Your score is projected to **decrease by ${Math.abs(forecastPercent).toFixed(1)}%** in the next period.\n\n`;
          } else {
            report += `**Forecast:** Your score is projected to **remain stable** in the next period.\n\n`;
          }
        }
      }
    });
    
    // Recommendations
    if (this.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      
      // Group recommendations by category
      const recommendationsByCategory = {};
      
      this.recommendations.forEach(recommendation => {
        if (!recommendationsByCategory[recommendation.category]) {
          recommendationsByCategory[recommendation.category] = [];
        }
        
        recommendationsByCategory[recommendation.category].push(recommendation);
      });
      
      // Output recommendations by category
      Object.entries(recommendationsByCategory).forEach(([category, recommendations]) => {
        report += `### ${this._formatCategoryName(category)} Recommendations\n\n`;
        
        recommendations.forEach(recommendation => {
          report += `#### ${recommendation.title}\n\n`;
          report += `${recommendation.description}\n\n`;
          
          if (recommendation.impact) {
            report += `**Impact:** ${recommendation.impact}\n\n`;
          }
          
          if (recommendation.actions && recommendation.actions.length > 0) {
            report += `**Actions:**\n\n`;
            
            recommendation.actions.forEach(action => {
              report += `- ${action}\n`;
            });
            
            report += `\n`;
          }
        });
      });
    }
    
    return report;
  }

  /**
   * Format a category name for display
   * @param {string} category Category name
   * @returns {string} Formatted category name
   * @private
   */
  _formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Format a metric name for display
   * @param {string} metric Metric name
   * @returns {string} Formatted metric name
   * @private
   */
  _formatMetricName(metric) {
    return metric
      .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/Percent$/, '%') // Replace Percent suffix with %
      .replace(/Avg$/, 'Average'); // Replace Avg with Average
  }

  /**
   * Format a metric value for display
   * @param {string} metricName Metric name
   * @param {number} value Metric value
   * @returns {string} Formatted metric value
   * @private
   */
  _formatMetricValue(metricName, value) {
    if (metricName.endsWith('Percent') || metricName.endsWith('%')) {
      return `${value.toFixed(1)}%`;
    }
    
    if (metricName.includes('Time') || metricName.includes('Speed')) {
      return `${value.toFixed(2)}ms`;
    }
    
    if (Number.isInteger(value)) {
      return value.toString();
    }
    
    return value.toFixed(2);
  }

  /**
   * Compare a metric value (higher or lower is better depends on the metric)
   * @param {string} metricName Metric name
   * @param {number} clientValue Client value
   * @param {number} benchmarkValue Benchmark value
   * @returns {number} Comparison result
   * @private
   */
  _compareMetric(metricName, clientValue, benchmarkValue) {
    // For these metrics, lower values are better
    const lowerIsBetter = [
      'load', 'domContentLoaded', 'firstPaint', 'firstContentfulPaint',
      'largestContentfulPaint', 'cumulativeLayoutShift',
      'missingTitlesPercent', 'missingDescriptionsPercent', 'missingH1Percent',
      'brokenLinksPercent', 'errorRate'
    ];
    
    // Check if this metric is in the "lower is better" list
    const isLowerBetter = lowerIsBetter.some(metric => 
      metricName.includes(metric) || 
      metricName.toLowerCase().includes(metric.toLowerCase())
    );
    
    // Calculate difference based on whether lower or higher is better
    if (isLowerBetter) {
      return benchmarkValue - clientValue; // Positive if client is better
    } else {
      return clientValue - benchmarkValue; // Positive if client is better
    }
  }

  /**
   * Get a comparison icon based on the comparison value
   * @param {number} comparison Comparison value
   * @returns {string} Comparison icon
   * @private
   */
  _getComparisonIcon(comparison) {
    if (comparison > 0) {
      return '✅'; // Client is better
    } else if (comparison < 0) {
      return '❌'; // Client is worse
    } else {
      return '➖'; // Equal
    }
  }
}

module.exports = BenchmarkComparison;
