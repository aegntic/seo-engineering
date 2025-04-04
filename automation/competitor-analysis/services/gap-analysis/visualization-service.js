/**
 * Gap Analysis Visualization Service
 * 
 * This service generates visualization data for the gap analysis results.
 * It provides data formatting for various charts and visualizations.
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('../../utils/logger');

class VisualizationService {
  /**
   * Create a new visualization service
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
   * Generate visualizations for gap analysis results
   * @param {GapAnalysis} gapAnalysis Gap analysis results
   * @param {string} jobId Job ID for naming files
   * @returns {Promise<Object>} Generated visualization paths
   */
  async generateVisualizations(gapAnalysis, jobId) {
    try {
      await this.initialize();
      
      logger.info('Generating gap analysis visualizations');
      
      // Generate data for visualizations
      const visualizationData = gapAnalysis.generateVisualizationData();
      
      // Create radar chart data
      const radarData = this._formatRadarChartData(visualizationData.radar);
      
      // Create competitive comparison chart data
      const comparisonData = this._formatComparisonChartData(visualizationData.comparison);
      
      // Create opportunities bar chart data
      const opportunitiesData = this._formatOpportunitiesChartData(visualizationData.opportunities);
      
      // Create gap impact bubble chart data
      const impactData = this._formatImpactChartData(gapAnalysis.getGapsSortedByImpact());
      
      // Save visualization data to files
      const radarPath = path.join(this.outputDir, `radar-${jobId}.json`);
      const comparisonPath = path.join(this.outputDir, `comparison-${jobId}.json`);
      const opportunitiesPath = path.join(this.outputDir, `opportunities-${jobId}.json`);
      const impactPath = path.join(this.outputDir, `impact-${jobId}.json`);
      
      await fs.writeFile(radarPath, JSON.stringify(radarData, null, 2));
      await fs.writeFile(comparisonPath, JSON.stringify(comparisonData, null, 2));
      await fs.writeFile(opportunitiesPath, JSON.stringify(opportunitiesData, null, 2));
      await fs.writeFile(impactPath, JSON.stringify(impactData, null, 2));
      
      logger.info('Gap analysis visualizations generated successfully');
      
      return {
        radar: radarPath,
        comparison: comparisonPath,
        opportunities: opportunitiesPath,
        impact: impactPath
      };
    } catch (error) {
      logger.error(`Failed to generate visualizations: ${error.message}`);
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
    // Format categories for better display
    const formattedCategories = radarData.categories.map(category => 
      category.charAt(0).toUpperCase() + category.slice(1)
    );
    
    // Return data in format ready for chart rendering
    return {
      categories: formattedCategories,
      series: [
        {
          name: 'Your Site',
          data: radarData.clientScores
        },
        {
          name: 'Competitor Average',
          data: radarData.competitorScores
        }
      ]
    };
  }

  /**
   * Format data for a comparison chart
   * @param {Object} comparisonData Raw comparison chart data
   * @returns {Object} Formatted comparison chart data
   * @private
   */
  _formatComparisonChartData(comparisonData) {
    // Create series data for client and competitors
    const series = [
      {
        name: 'Your Site',
        data: [comparisonData.clientScore]
      }
    ];
    
    // Add series for each competitor
    const competitors = Object.entries(comparisonData.competitorScores)
      .map(([url, score]) => ({
        name: this._getDomainFromUrl(url),
        data: [score]
      }));
    
    // Return data in format ready for chart rendering
    return {
      categories: ['Overall SEO Score'],
      series: [
        ...series,
        ...competitors
      ]
    };
  }

  /**
   * Format data for opportunities chart
   * @param {Object} opportunitiesData Raw opportunities chart data
   * @returns {Object} Formatted opportunities chart data
   * @private
   */
  _formatOpportunitiesChartData(opportunitiesData) {
    // Format categories for better display
    const formattedCategories = opportunitiesData.categories.map(category => 
      category.charAt(0).toUpperCase() + category.slice(1)
    );
    
    // Impact distribution data
    const impactSeries = [];
    
    if (opportunitiesData.impactDistribution) {
      impactSeries.push(
        {
          name: 'Critical',
          data: formattedCategories.map(category => 
            opportunitiesData.impactDistribution[category.toLowerCase()]?.critical || 0
          )
        },
        {
          name: 'High',
          data: formattedCategories.map(category => 
            opportunitiesData.impactDistribution[category.toLowerCase()]?.high || 0
          )
        },
        {
          name: 'Medium',
          data: formattedCategories.map(category => 
            opportunitiesData.impactDistribution[category.toLowerCase()]?.medium || 0
          )
        },
        {
          name: 'Low',
          data: formattedCategories.map(category => 
            opportunitiesData.impactDistribution[category.toLowerCase()]?.low || 0
          )
        }
      );
    }
    
    // Return data in format ready for chart rendering
    return {
      categories: formattedCategories,
      series: [
        {
          name: 'Issues Found',
          type: 'column',
          data: opportunitiesData.counts
        },
        ...impactSeries
      ]
    };
  }

  /**
   * Format data for impact bubble chart
   * @param {Array} gaps Sorted gaps by impact
   * @returns {Object} Formatted impact chart data
   * @private
   */
  _formatImpactChartData(gaps) {
    // Group gaps by category
    const categoriesMap = {};
    
    gaps.forEach(gap => {
      if (!categoriesMap[gap.category]) {
        categoriesMap[gap.category] = [];
      }
      
      categoriesMap[gap.category].push(gap);
    });
    
    // Create series data for each category
    const series = Object.entries(categoriesMap).map(([category, categoryGaps]) => {
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        data: categoryGaps.map(gap => ({
          name: gap.title,
          value: gap.impactScore,
          description: gap.description
        }))
      };
    });
    
    // Return data in format ready for chart rendering
    return {
      series
    };
  }

  /**
   * Extract domain from URL
   * @param {string} url The URL
   * @returns {string} Domain name
   * @private
   */
  _getDomainFromUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch (error) {
      return url;
    }
  }
}

module.exports = VisualizationService;
