/**
 * Strategy Visualization Service
 * 
 * This service generates visualization data for strategic recommendations.
 * It provides data formatting for various charts and visualizations.
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('../../utils/logger');

class StrategyVisualizationService {
  /**
   * Create a new strategy visualization service
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'strategy-visualizations');
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
   * Generate visualizations for strategy recommendations
   * @param {Object} strategy Strategy recommendations
   * @param {string} jobId Job ID for naming files
   * @returns {Promise<Object>} Generated visualization paths
   */
  async generateVisualizations(strategy, jobId) {
    try {
      await this.initialize();
      
      logger.info('Generating strategy visualizations');
      
      // Generate data for visualizations
      const visualizationData = strategy.generateVisualizationData();
      
      // Create impact chart data
      const impactData = this._formatImpactChartData(visualizationData.impact);
      
      // Create timeline chart data
      const timelineData = this._formatTimelineChartData(visualizationData.timeline);
      
      // Create resource allocation chart data
      const resourceData = this._formatResourceChartData(visualizationData.resources);
      
      // Create ROI projection chart data
      const roiData = this._formatROIChartData(visualizationData.roi);
      
      // Create strategy map data
      const strategyMapData = this._formatStrategyMapData(visualizationData.strategyMap);
      
      // Save visualization data to files
      const impactPath = path.join(this.outputDir, `impact-${jobId}.json`);
      const timelinePath = path.join(this.outputDir, `timeline-${jobId}.json`);
      const resourcePath = path.join(this.outputDir, `resources-${jobId}.json`);
      const roiPath = path.join(this.outputDir, `roi-${jobId}.json`);
      const strategyMapPath = path.join(this.outputDir, `strategy-map-${jobId}.json`);
      
      await fs.writeFile(impactPath, JSON.stringify(impactData, null, 2));
      await fs.writeFile(timelinePath, JSON.stringify(timelineData, null, 2));
      await fs.writeFile(resourcePath, JSON.stringify(resourceData, null, 2));
      await fs.writeFile(roiPath, JSON.stringify(roiData, null, 2));
      await fs.writeFile(strategyMapPath, JSON.stringify(strategyMapData, null, 2));
      
      logger.info('Strategy visualizations generated successfully');
      
      return {
        impact: impactPath,
        timeline: timelinePath,
        resources: resourcePath,
        roi: roiPath,
        strategyMap: strategyMapPath
      };
    } catch (error) {
      logger.error(`Failed to generate strategy visualizations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format data for impact chart
   * @param {Object} impactData Raw impact data
   * @returns {Object} Formatted impact chart data
   * @private
   */
  _formatImpactChartData(impactData) {
    if (!impactData || !impactData.categories || !impactData.values) {
      return {
        categories: [],
        series: []
      };
    }
    
    return {
      categories: impactData.categories,
      series: [
        {
          name: 'Impact Score',
          data: impactData.values
        }
      ]
    };
  }

  /**
   * Format data for timeline chart
   * @param {Object} timelineData Raw timeline data
   * @returns {Object} Formatted timeline chart data
   * @private
   */
  _formatTimelineChartData(timelineData) {
    if (!timelineData || !timelineData.phases) {
      return {
        phases: []
      };
    }
    
    return {
      phases: timelineData.phases.map(phase => ({
        name: phase.name,
        start: phase.start,
        end: phase.end,
        tasks: phase.tasks.map(task => ({
          name: task.name,
          start: task.start,
          end: task.end,
          dependencies: task.dependencies,
          progress: task.progress || 0
        }))
      }))
    };
  }

  /**
   * Format data for resource allocation chart
   * @param {Object} resourceData Raw resource data
   * @returns {Object} Formatted resource chart data
   * @private
   */
  _formatResourceChartData(resourceData) {
    if (!resourceData || !resourceData.resources) {
      return {
        categories: [],
        series: []
      };
    }
    
    const categories = resourceData.resources.map(resource => resource.name);
    const series = [];
    
    // Create series for each type of allocation
    if (resourceData.resources.length > 0 && resourceData.resources[0].allocations) {
      const allocations = resourceData.resources[0].allocations;
      Object.keys(allocations).forEach(type => {
        series.push({
          name: type,
          data: resourceData.resources.map(resource => resource.allocations[type] || 0)
        });
      });
    }
    
    return {
      categories,
      series
    };
  }

  /**
   * Format data for ROI projection chart
   * @param {Object} roiData Raw ROI data
   * @returns {Object} Formatted ROI chart data
   * @private
   */
  _formatROIChartData(roiData) {
    if (!roiData || !roiData.months) {
      return {
        categories: [],
        series: []
      };
    }
    
    const categories = roiData.months;
    
    return {
      categories,
      series: [
        {
          name: 'Investment',
          type: 'column',
          data: roiData.investment
        },
        {
          name: 'Return',
          type: 'column',
          data: roiData.return
        },
        {
          name: 'Cumulative ROI',
          type: 'line',
          data: roiData.cumulativeRoi
        }
      ]
    };
  }

  /**
   * Format data for strategy map
   * @param {Object} strategyMapData Raw strategy map data
   * @returns {Object} Formatted strategy map data
   * @private
   */
  _formatStrategyMapData(strategyMapData) {
    if (!strategyMapData || !strategyMapData.nodes || !strategyMapData.links) {
      return {
        nodes: [],
        links: []
      };
    }
    
    return {
      nodes: strategyMapData.nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        impact: node.impact,
        category: node.category
      })),
      links: strategyMapData.links.map(link => ({
        source: link.source,
        target: link.target,
        value: link.value,
        type: link.type
      }))
    };
  }
}

module.exports = StrategyVisualizationService;
