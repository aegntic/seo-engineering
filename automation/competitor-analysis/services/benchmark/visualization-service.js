/**
 * Benchmark Visualization Service
 * 
 * This service generates visualization data for benchmark comparison results.
 * It provides data formatting for various charts and visualizations.
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('../../utils/logger');

class BenchmarkVisualizationService {
  /**
   * Create a new benchmark visualization service
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'competitor-analysis', 'visualizations');
  }

  /**
   * Initialize the service
   * @returns {Promise<void>}
   */
  async initialize() {
    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * Generate visualizations for benchmark comparison results
   * @param {BenchmarkComparison} benchmarkComparison Benchmark comparison results
   * @param {string} jobId Job ID for naming files
   * @returns {Promise<Object>} Generated visualization paths
   */
  async generateVisualizations(benchmarkComparison, jobId) {
    try {
      await this.initialize();
      
      logger.info('Generating benchmark comparison visualizations');
      
      // Generate data for visualizations
      const visualizationData = benchmarkComparison.generateVisualizationData();
      
      // Format data for various chart types
      const radarData = this._formatRadarChartData(visualizationData.radar);
      const rankingsData = this._formatRankingsChartData(visualizationData.rankings);
      const trendsData = this._formatTrendsChartData(visualizationData.trends);
      const distributionData = this._formatDistributionChartData(visualizationData.distribution);
      
      // Create industry comparison data
      const industryData = this._formatIndustryComparisonData(benchmarkComparison.getAllBenchmarkData());
      
      // Save visualization data to files
      const radarPath = path.join(this.outputDir, `benchmark-radar-${jobId}.json`);
      const rankingsPath = path.join(this.outputDir, `benchmark-rankings-${jobId}.json`);
      const trendsPath = path.join(this.outputDir, `benchmark-trends-${jobId}.json`);
      const distributionPath = path.join(this.outputDir, `benchmark-distribution-${jobId}.json`);
      const industryPath = path.join(this.outputDir, `benchmark-industry-${jobId}.json`);
      
      await fs.writeFile(radarPath, JSON.stringify(radarData, null, 2));
      await fs.writeFile(rankingsPath, JSON.stringify(rankingsData, null, 2));
      await fs.writeFile(trendsPath, JSON.stringify(trendsData, null, 2));
      await fs.writeFile(distributionPath, JSON.stringify(distributionData, null, 2));
      await fs.writeFile(industryPath, JSON.stringify(industryData, null, 2));
      
      logger.info('Benchmark comparison visualizations generated successfully');
      
      return {
        radar: radarPath,
        rankings: rankingsPath,
        trends: trendsPath,
        distribution: distributionPath,
        industry: industryPath
      };
    } catch (error) {
      logger.error(`Failed to generate benchmark visualizations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format data for a radar chart
   * @param {Object} radarData Raw radar chart data
   * @returns {Object} Formatted radar chart data
   * @private
   */
  _formatRadarChartData(radarData) {
    if (!radarData || !radarData.categories || !radarData.series) {
      return {
        categories: [],
        series: []
      };
    }
    
    // Format categories for better display
    const formattedCategories = radarData.categories.map(category => 
      category.charAt(0).toUpperCase() + category.slice(1)
    );
    
    // Return data in format ready for chart rendering
    return {
      categories: formattedCategories,
      series: radarData.series.map(series => ({
        name: series.name,
        data: series.data
      }))
    };
  }

  /**
   * Format data for rankings charts
   * @param {Object} rankingsData Raw rankings data
   * @returns {Object} Formatted rankings data
   * @private
   */
  _formatRankingsChartData(rankingsData) {
    if (!rankingsData) {
      return {};
    }
    
    const formattedData = {};
    
    // Format rankings data for each category
    Object.entries(rankingsData).forEach(([category, data]) => {
      if (!data || !data.competitors) {
        return;
      }
      
      // Sort competitors by score
      const sortedCompetitors = [...data.competitors].sort((a, b) => b.score - a.score);
      
      // Format data for chart
      formattedData[category] = {
        clientRank: data.clientRank,
        totalCompetitors: data.totalCompetitors,
        series: [
          {
            name: 'Scores',
            data: sortedCompetitors.map(comp => comp.score)
          }
        ],
        categories: sortedCompetitors.map(comp => comp.name),
        clientPosition: data.clientRank - 1 // Array index starts at 0
      };
    });
    
    return formattedData;
  }

  /**
   * Format data for trends charts
   * @param {Object} trendsData Raw trends data
   * @returns {Object} Formatted trends data
   * @private
   */
  _formatTrendsChartData(trendsData) {
    if (!trendsData) {
      return {};
    }
    
    const formattedData = {};
    
    // Format trends data for each category
    Object.entries(trendsData).forEach(([category, data]) => {
      if (!data || !data.clientHistory || data.clientHistory.length === 0) {
        return;
      }
      
      // Get dates from client history
      const dates = data.clientHistory.map(point => point.date);
      
      // Add forecast dates if available
      const forecastDates = data.forecastClient ? data.forecastClient.map(point => point.date) : [];
      const allDates = [...dates, ...forecastDates];
      
      // Create series data
      const series = [
        {
          name: 'Your Site',
          type: 'line',
          data: [
            ...data.clientHistory.map(point => point.value),
            ...data.forecastClient ? data.forecastClient.map(point => null) : []
          ]
        },
        {
          name: 'Your Site (Forecast)',
          type: 'line',
          dashStyle: 'dash',
          data: [
            ...data.clientHistory.map(point => null),
            ...data.forecastClient ? data.forecastClient.map(point => point.value) : []
          ]
        }
      ];
      
      // Add competitor data if available
      if (data.competitorHistory && data.competitorHistory.length > 0) {
        series.push({
          name: 'Competitors Avg',
          type: 'line',
          data: [
            ...data.competitorHistory.map(point => point.value),
            ...data.forecastCompetitor ? data.forecastCompetitor.map(point => null) : []
          ]
        });
        
        // Add competitor forecast if available
        if (data.forecastCompetitor && data.forecastCompetitor.length > 0) {
          series.push({
            name: 'Competitors Avg (Forecast)',
            type: 'line',
            dashStyle: 'dash',
            data: [
              ...data.competitorHistory.map(point => null),
              ...data.forecastCompetitor.map(point => point.value)
            ]
          });
        }
      }
      
      // Add industry data if available
      if (data.industryHistory && data.industryHistory.length > 0) {
        series.push({
          name: 'Industry Benchmark',
          type: 'line',
          data: data.industryHistory.map(point => point.value)
        });
      }
      
      // Format data for chart
      formattedData[category] = {
        categories: allDates,
        series
      };
    });
    
    return formattedData;
  }

  /**
   * Format data for distribution charts
   * @param {Object} distributionData Raw distribution data
   * @returns {Object} Formatted distribution data
   * @private
   */
  _formatDistributionChartData(distributionData) {
    if (!distributionData) {
      return {};
    }
    
    const formattedData = {};
    
    // Format distribution data for each category
    Object.entries(distributionData).forEach(([category, data]) => {
      if (!data || !data.ranges || !data.counts) {
        return;
      }
      
      // Format data for chart
      formattedData[category] = {
        series: [
          {
            name: 'Competitors',
            data: data.counts
          }
        ],
        categories: data.ranges.map(range => range.label),
        clientPosition: data.clientPosition,
        percentiles: data.percentiles
      };
    });
    
    return formattedData;
  }

  /**
   * Format data for industry comparison
   * @param {Object} benchmarkData Benchmark data
   * @returns {Object} Formatted industry comparison data
   * @private
   */
  _formatIndustryComparisonData(benchmarkData) {
    if (!benchmarkData) {
      return {};
    }
    
    const categories = [];
    const clientScores = [];
    const competitorScores = [];
    const industryScores = [];
    const differences = [];
    
    // Extract data for each category
    Object.entries(benchmarkData).forEach(([category, data]) => {
      if (!data) {
        return;
      }
      
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      categories.push(formattedCategory);
      
      const clientScore = data.clientScore || 0;
      const competitorScore = data.competitorAverage || 0;
      const industryScore = data.industryBenchmark || 0;
      
      clientScores.push(clientScore);
      competitorScores.push(competitorScore);
      industryScores.push(industryScore);
      
      // Calculate difference between client and industry (negative if client is worse)
      differences.push(clientScore - industryScore);
    });
    
    // Format data for chart
    return {
      categories,
      series: [
        {
          name: 'Your Site',
          type: 'column',
          data: clientScores
        },
        {
          name: 'Competitor Average',
          type: 'column',
          data: competitorScores
        },
        {
          name: 'Industry Benchmark',
          type: 'column',
          data: industryScores
        },
        {
          name: 'Difference vs Industry',
          type: 'line',
          data: differences
        }
      ]
    };
  }
}

module.exports = BenchmarkVisualizationService;
