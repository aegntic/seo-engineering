/**
 * Strategy Model
 * 
 * This model represents a strategic SEO plan based on gap analysis and
 * benchmark comparison.
 */

class Strategy {
  /**
   * Create a new strategy
   * @param {Object} gapAnalysis Gap analysis results
   * @param {Object} benchmarkComparison Benchmark comparison results
   * @param {Object} options Strategy options
   */
  constructor(gapAnalysis, benchmarkComparison, options = {}) {
    this.gapAnalysis = gapAnalysis;
    this.benchmarkComparison = benchmarkComparison;
    this.options = {
      timelineMonths: 6,
      priorityThresholds: {
        critical: 4.5,
        high: 3.5,
        medium: 2.5,
        low: 1.0
      },
      ...options
    };
    
    this.recommendations = [];
    this.timeline = null;
    this.resourceAllocation = null;
    this.roiProjection = null;
    this.strategyMap = null;
    this.visualizationData = null;
  }

  /**
   * Add a strategic recommendation
   * @param {Object} recommendation Recommendation object
   */
  addStrategicRecommendation(recommendation) {
    this.recommendations.push(recommendation);
  }

  /**
   * Get all strategic recommendations
   * @returns {Array} Strategic recommendations
   */
  getAllRecommendations() {
    return this.recommendations;
  }

  /**
   * Get recommendations by priority
   * @param {string} priority Priority level
   * @returns {Array} Recommendations with the specified priority
   */
  getRecommendationsByPriority(priority) {
    return this.recommendations.filter(r => r.priority === priority);
  }

  /**
   * Get recommendations by category
   * @param {string} category Category name
   * @returns {Array} Recommendations with the specified category
   */
  getRecommendationsByCategory(category) {
    return this.recommendations.filter(r => r.category === category);
  }

  /**
   * Set implementation timeline
   * @param {Object} timeline Implementation timeline
   */
  setTimeline(timeline) {
    this.timeline = timeline;
  }

  /**
   * Get implementation timeline
   * @returns {Object} Implementation timeline
   */
  getTimeline() {
    return this.timeline;
  }

  /**
   * Set resource allocation
   * @param {Object} resourceAllocation Resource allocation
   */
  setResourceAllocation(resourceAllocation) {
    this.resourceAllocation = resourceAllocation;
  }

  /**
   * Get resource allocation
   * @returns {Object} Resource allocation
   */
  getResourceAllocation() {
    return this.resourceAllocation;
  }

  /**
   * Set ROI projection
   * @param {Object} roiProjection ROI projection
   */
  setRoiProjection(roiProjection) {
    this.roiProjection = roiProjection;
  }

  /**
   * Get ROI projection
   * @returns {Object} ROI projection
   */
  getRoiProjection() {
    return this.roiProjection;
  }

  /**
   * Set strategy map
   * @param {Object} strategyMap Strategy map
   */
  setStrategyMap(strategyMap) {
    this.strategyMap = strategyMap;
  }

  /**
   * Get strategy map
   * @returns {Object} Strategy map
   */
  getStrategyMap() {
    return this.strategyMap;
  }

  /**
   * Generate visualization data for the strategy
   * @returns {Object} Visualization data
   */
  generateVisualizationData() {
    this.visualizationData = {
      impact: this._generateImpactVisualizationData(),
      timeline: this.timeline,
      resources: this.resourceAllocation,
      roi: this.roiProjection,
      strategyMap: this.strategyMap
    };
    
    return this.visualizationData;
  }

  /**
   * Generate impact visualization data
   * @returns {Object} Impact visualization data
   * @private
   */
  _generateImpactVisualizationData() {
    // Group recommendations by category
    const categories = [...new Set(this.recommendations.map(r => r.category))];
    const values = [];
    
    for (const category of categories) {
      const categoryRecommendations = this.getRecommendationsByCategory(category);
      const categoryImpact = categoryRecommendations.reduce((sum, r) => sum + r.impactScore, 0);
      values.push(categoryImpact);
    }
    
    return {
      categories,
      values
    };
  }

  /**
   * Generate a markdown report for the strategy
   * @returns {string} Markdown report
   */
  generateMarkdownReport() {
    let report = `# Strategic SEO Recommendations\n\n`;
    
    // Introduction
    report += `## Executive Summary\n\n`;
    report += `This strategic plan provides a comprehensive approach to improving your SEO performance. `;
    report += `It is based on detailed gap analysis and benchmark comparison against competitors and industry standards.\n\n`;
    
    // Add strategy summary
    report += `The strategy includes ${this.recommendations.length} prioritized recommendations `;
    
    const criticalCount = this.getRecommendationsByPriority('critical').length;
    const highCount = this.getRecommendationsByPriority('high').length;
    
    if (criticalCount > 0 || highCount > 0) {
      report += `with ${criticalCount} critical and ${highCount} high-priority items `;
    }
    
    report += `across ${new Set(this.recommendations.map(r => r.category)).size} key areas. `;
    
    if (this.timeline) {
      report += `Implementation is structured in ${this.timeline.phases.length} phases over ${this.options.timelineMonths} months.\n\n`;
    } else {
      report += `\n\n`;
    }
    
    // Recommendations by priority
    report += `## Strategic Recommendations\n\n`;
    
    const priorities = ['critical', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      const priorityRecommendations = this.getRecommendationsByPriority(priority);
      
      if (priorityRecommendations.length > 0) {
        report += `### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Items\n\n`;
        
        for (const recommendation of priorityRecommendations) {
          report += `#### ${recommendation.title}\n\n`;
          report += `${recommendation.description}\n\n`;
          report += `**Category:** ${recommendation.category}\n`;
          report += `**Impact Score:** ${recommendation.impactScore.toFixed(1)}/5.0\n\n`;
          
          if (recommendation.actions && recommendation.actions.length > 0) {
            report += `**Action Plan:**\n\n`;
            
            for (const action of recommendation.actions) {
              report += `- ${action}\n`;
            }
            
            report += `\n`;
          }
        }
      }
    }
    
    // Implementation timeline
    if (this.timeline) {
      report += `## Implementation Timeline\n\n`;
      report += `The strategic plan will be implemented over ${this.options.timelineMonths} months in ${this.timeline.phases.length} phases:\n\n`;
      
      for (const phase of this.timeline.phases) {
        report += `### ${phase.name}\n\n`;
        report += `**Timeframe:** ${phase.start} to ${phase.end}\n\n`;
        
        if (phase.tasks && phase.tasks.length > 0) {
          report += `**Tasks:**\n\n`;
          
          for (const task of phase.tasks) {
            report += `- **${task.name}** (${task.start} - ${task.end})\n`;
          }
          
          report += `\n`;
        }
      }
    }
    
    // Resource allocation
    if (this.resourceAllocation) {
      report += `## Resource Requirements\n\n`;
      
      const { total } = this.resourceAllocation;
      
      report += `### Total Resources\n\n`;
      report += `| Resource Type | Allocation |\n`;
      report += `|---------------|------------|\n`;
      
      for (const [resource, value] of Object.entries(total)) {
        let formattedValue = '';
        
        if (resource === 'time') {
          formattedValue = `${value} hours`;
        } else if (resource === 'cost') {
          formattedValue = `$${value}`;
        } else {
          formattedValue = value.toString();
        }
        
        report += `| ${resource.charAt(0).toUpperCase() + resource.slice(1)} | ${formattedValue} |\n`;
      }
      
      report += `\n`;
    }
    
    // ROI projection
    if (this.roiProjection) {
      report += `## ROI Projection\n\n`;
      report += `This plan is projected to deliver positive ROI within `;
      
      // Find the month where ROI becomes positive
      const positiveRoiMonth = this.roiProjection.cumulativeRoi.findIndex(roi => roi > 0);
      
      if (positiveRoiMonth >= 0) {
        report += `${positiveRoiMonth + 1} months of implementation.\n\n`;
      } else {
        report += `the ${this.options.timelineMonths} month implementation period.\n\n`;
      }
      
      // Show projected ROI at key intervals
      if (this.roiProjection.months.length > 0) {
        report += `### Projected ROI\n\n`;
        report += `| Period | Projected ROI |\n`;
        report += `|--------|---------------|\n`;
        
        const intervals = [3, 6, 9, 12];
        
        for (const interval of intervals) {
          if (interval < this.roiProjection.months.length) {
            const roi = this.roiProjection.cumulativeRoi[interval - 1].toFixed(2);
            report += `| ${interval} months | ${roi}% |\n`;
          }
        }
        
        report += `\n`;
      }
    }
    
    // Conclusion
    report += `## Next Steps\n\n`;
    report += `To implement this strategic plan:\n\n`;
    report += `1. Review and approve the recommendations and timeline\n`;
    report += `2. Allocate resources according to the resource requirements\n`;
    report += `3. Begin with the critical and high-priority items in Phase 1\n`;
    report += `4. Track progress and performance improvements\n`;
    report += `5. Adjust the plan as needed based on results\n\n`;
    
    report += `This plan is designed to be adaptable as implementation progresses and results are measured. `;
    report += `Regular reviews will ensure the strategy remains aligned with business goals and market conditions.\n`;
    
    return report;
  }
}

module.exports = Strategy;
