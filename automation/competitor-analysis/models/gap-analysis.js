/**
 * Gap Analysis Model
 * 
 * This model represents a gap analysis between a client site and its competitors.
 * It identifies areas where the client site is underperforming or missing opportunities
 * compared to competitors.
 */

class GapAnalysis {
  /**
   * Create a new gap analysis
   * @param {Object} clientData Client site data
   * @param {Object} competitorsData Competitors data
   * @param {Array} keywords Keywords to analyze
   */
  constructor(clientData, competitorsData, keywords = []) {
    this.clientData = clientData;
    this.competitorsData = competitorsData;
    this.keywords = keywords;
    this.gaps = {
      technical: [],
      content: [],
      keywords: [],
      performance: [],
      onPage: [],
      structure: []
    };
    this.scores = {
      technical: 0,
      content: 0,
      keywords: 0,
      performance: 0,
      onPage: 0,
      structure: 0,
      overall: 0
    };
    this.opportunities = [];
    this.visualizationData = {
      radar: {},
      comparison: {},
      opportunities: {}
    };
  }

  /**
   * Calculate the gap scores for each category
   * @returns {Object} Gap scores
   */
  calculateScores() {
    // Calculate scores for each category based on gap analysis
    this.scores.technical = this._calculateCategoryScore('technical');
    this.scores.content = this._calculateCategoryScore('content');
    this.scores.keywords = this._calculateCategoryScore('keywords');
    this.scores.performance = this._calculateCategoryScore('performance'); 
    this.scores.onPage = this._calculateCategoryScore('onPage');
    this.scores.structure = this._calculateCategoryScore('structure');
    
    // Calculate overall score as weighted average
    const weights = {
      technical: 0.2,
      content: 0.25,
      keywords: 0.2,
      performance: 0.15,
      onPage: 0.1,
      structure: 0.1
    };
    
    this.scores.overall = Object.entries(weights).reduce((total, [category, weight]) => {
      return total + (this.scores[category] * weight);
    }, 0);
    
    return this.scores;
  }

  /**
   * Calculate score for a specific category
   * @param {string} category The category to calculate score for
   * @returns {number} Score between 0 and 100
   * @private
   */
  _calculateCategoryScore(category) {
    if (!this.gaps[category] || this.gaps[category].length === 0) {
      return 100; // No gaps = perfect score
    }
    
    // Sum up impact scores of gaps in this category
    const totalImpact = this.gaps[category].reduce((sum, gap) => sum + gap.impactScore, 0);
    
    // Calculate score out of 100
    // Max possible impact would be 5 (highest impact) × number of gaps
    const maxPossibleImpact = 5 * this.gaps[category].length;
    
    // Invert the score (lower impact = higher score)
    const score = 100 - ((totalImpact / maxPossibleImpact) * 100);
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate visualization data for the gap analysis
   * @returns {Object} Visualization data
   */
  generateVisualizationData() {
    // Generate radar chart data
    this.visualizationData.radar = {
      categories: Object.keys(this.scores).filter(key => key !== 'overall'),
      clientScores: Object.entries(this.scores)
        .filter(([key]) => key !== 'overall')
        .map(([_, score]) => score),
      competitorScores: this._calculateCompetitorAverageScores()
    };
    
    // Generate comparison chart data
    this.visualizationData.comparison = {
      categories: Object.keys(this.scores).filter(key => key !== 'overall'),
      clientScore: this.scores.overall,
      competitorScores: this._getIndividualCompetitorScores()
    };
    
    // Generate opportunities data for visualization
    this.visualizationData.opportunities = {
      categories: Object.keys(this.gaps),
      counts: Object.entries(this.gaps).map(([_, gaps]) => gaps.length),
      impactDistribution: this._calculateImpactDistribution()
    };
    
    return this.visualizationData;
  }

  /**
   * Calculate average scores for competitors
   * @returns {Array} Average competitor scores by category
   * @private
   */
  _calculateCompetitorAverageScores() {
    // This would be calculated based on competitor data
    // For now, using placeholder logic
    const categories = Object.keys(this.scores).filter(key => key !== 'overall');
    
    return categories.map(category => {
      // Get reference scores from competitor data
      // This is simplified - in production this would use actual competitor metrics
      const competitorScores = this._getCompetitorCategoryScores(category);
      return competitorScores.length > 0 
        ? competitorScores.reduce((sum, score) => sum + score, 0) / competitorScores.length
        : 0;
    });
  }

  /**
   * Get scores for a specific category across all competitors
   * @param {string} category Category to get scores for
   * @returns {Array} Array of competitor scores
   * @private
   */
  _getCompetitorCategoryScores(category) {
    // This would extract relevant metrics from competitor data
    // For simplicity, generating placeholder data
    const scores = [];
    
    // For each competitor, calculate a score for this category
    Object.values(this.competitorsData).forEach(competitorData => {
      if (competitorData.error) return;
      
      let score = 0;
      
      // Different scoring logic based on category
      switch(category) {
        case 'technical':
          // Based on SEO health metrics
          if (competitorData.summary && competitorData.summary.seoHealth) {
            const health = competitorData.summary.seoHealth;
            // Higher is better for these metrics
            const positiveMetrics = ['hasSchemaMarkupPercent', 'hasCanonicalPercent'];
            // Lower is better for these metrics
            const negativeMetrics = ['missingTitlesPercent', 'missingDescriptionsPercent', 'missingH1Percent'];
            
            let technicalScore = 0;
            let metrics = 0;
            
            positiveMetrics.forEach(metric => {
              if (health[metric] !== undefined) {
                technicalScore += health[metric];
                metrics++;
              }
            });
            
            negativeMetrics.forEach(metric => {
              if (health[metric] !== undefined) {
                technicalScore += (100 - health[metric]);
                metrics++;
              }
            });
            
            score = metrics > 0 ? technicalScore / metrics : 0;
          }
          break;
          
        case 'content':
          // Based on content metrics
          if (competitorData.summary && competitorData.summary.contentStats) {
            const stats = competitorData.summary.contentStats;
            // Optimal title length is 50-60 characters
            const titleScore = stats.averageTitleLength 
              ? Math.max(0, 100 - Math.abs(55 - stats.averageTitleLength) * 2) 
              : 0;
            
            // Optimal description length is 120-158 characters
            const descScore = stats.averageDescriptionLength
              ? Math.max(0, 100 - Math.abs(140 - stats.averageDescriptionLength) / 2)
              : 0;
              
            score = (titleScore + descScore) / 2;
          }
          break;
          
        case 'performance':
          // Based on performance metrics
          if (competitorData.summary && competitorData.summary.averagePerformance) {
            const perf = competitorData.summary.averagePerformance;
            
            // Score based on load time (lower is better)
            const loadScore = perf.load
              ? Math.max(0, 100 - (perf.load / 100))
              : 0;
              
            // Score based on DOM content loaded (lower is better)
            const dclScore = perf.domContentLoaded
              ? Math.max(0, 100 - (perf.domContentLoaded / 50))
              : 0;
              
            score = (loadScore + dclScore) / 2;
          }
          break;
          
        // Similar logic for other categories
        default:
          score = 75; // Default score if no specific calculation
      }
      
      scores.push(Math.max(0, Math.min(100, score)));
    });
    
    return scores;
  }

  /**
   * Get overall scores for each individual competitor
   * @returns {Object} Map of competitor URLs to overall scores
   * @private
   */
  _getIndividualCompetitorScores() {
    const competitorScores = {};
    
    Object.entries(this.competitorsData).forEach(([url, competitorData]) => {
      if (competitorData.error) {
        competitorScores[url] = 0;
        return;
      }
      
      // Calculate an overall score for this competitor
      // This is a simplified version - would be more detailed in production
      let totalScore = 0;
      let categories = 0;
      
      // Technical score
      if (competitorData.summary && competitorData.summary.seoHealth) {
        const health = competitorData.summary.seoHealth;
        const technicalScore = 100 - (health.missingTitlesPercent + health.missingDescriptionsPercent) / 2;
        totalScore += technicalScore;
        categories++;
      }
      
      // Performance score
      if (competitorData.summary && competitorData.summary.averagePerformance) {
        const perf = competitorData.summary.averagePerformance;
        // Simple performance score based on load time
        const perfScore = Math.max(0, 100 - (perf.load / 100));
        totalScore += perfScore;
        categories++;
      }
      
      // Content score
      if (competitorData.summary && competitorData.summary.contentStats) {
        // Simple content score
        const contentScore = 70; // Default score
        totalScore += contentScore;
        categories++;
      }
      
      // Calculate final score
      competitorScores[url] = categories > 0 
        ? Math.max(0, Math.min(100, totalScore / categories))
        : 0;
    });
    
    return competitorScores;
  }

  /**
   * Calculate the distribution of impact levels across gaps
   * @returns {Object} Impact distribution by category
   * @private
   */
  _calculateImpactDistribution() {
    const distribution = {};
    
    Object.entries(this.gaps).forEach(([category, gaps]) => {
      distribution[category] = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };
      
      gaps.forEach(gap => {
        if (gap.impactScore <= 2) {
          distribution[category].low++;
        } else if (gap.impactScore <= 3) {
          distribution[category].medium++;
        } else if (gap.impactScore <= 4) {
          distribution[category].high++;
        } else {
          distribution[category].critical++;
        }
      });
    });
    
    return distribution;
  }

  /**
   * Add a gap to the analysis
   * @param {string} category Gap category
   * @param {Object} gap Gap details
   */
  addGap(category, gap) {
    if (!this.gaps[category]) {
      this.gaps[category] = [];
    }
    
    this.gaps[category].push(gap);
  }

  /**
   * Add an opportunity based on gap analysis
   * @param {Object} opportunity Opportunity details
   */
  addOpportunity(opportunity) {
    this.opportunities.push(opportunity);
  }

  /**
   * Get all identified gaps
   * @returns {Object} All gaps by category
   */
  getAllGaps() {
    return this.gaps;
  }

  /**
   * Get all identified opportunities
   * @returns {Array} All opportunities
   */
  getAllOpportunities() {
    return this.opportunities;
  }

  /**
   * Get gaps sorted by impact score
   * @returns {Array} Sorted gaps with category information
   */
  getGapsSortedByImpact() {
    const allGaps = [];
    
    Object.entries(this.gaps).forEach(([category, gaps]) => {
      gaps.forEach(gap => {
        allGaps.push({
          ...gap,
          category
        });
      });
    });
    
    return allGaps.sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Get opportunities sorted by potential impact
   * @returns {Array} Sorted opportunities
   */
  getOpportunitiesSortedByImpact() {
    return [...this.opportunities].sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Generate a summary report of the gap analysis
   * @returns {string} Markdown report
   */
  generateMarkdownReport() {
    let report = `# Gap Analysis Report\n\n`;
    
    // Overall Score
    report += `## Overall Score\n\n`;
    report += `Your site scores **${Math.round(this.scores.overall)}%** compared to competitors.\n\n`;
    
    // Category Scores
    report += `## Category Scores\n\n`;
    report += `| Category | Your Score | Competitor Average | Gap |\n`;
    report += `|----------|------------|-------------------|-----|\n`;
    
    const categories = Object.keys(this.scores).filter(key => key !== 'overall');
    const competitorScores = this._calculateCompetitorAverageScores();
    
    categories.forEach((category, index) => {
      const yourScore = Math.round(this.scores[category]);
      const competitorScore = Math.round(competitorScores[index]);
      const gap = yourScore - competitorScore;
      const gapText = gap >= 0 ? `+${gap}%` : `${gap}%`;
      const gapIcon = gap >= 0 ? '✅' : '❌';
      
      report += `| ${category.charAt(0).toUpperCase() + category.slice(1)} | ${yourScore}% | ${competitorScore}% | ${gapIcon} ${gapText} |\n`;
    });
    
    // Top Opportunities
    report += `\n## Top Opportunities\n\n`;
    
    const topOpportunities = this.getOpportunitiesSortedByImpact().slice(0, 5);
    
    topOpportunities.forEach((opportunity, index) => {
      report += `### ${index + 1}. ${opportunity.title}\n\n`;
      report += `**Impact Score:** ${opportunity.impactScore}/5\n\n`;
      report += `${opportunity.description}\n\n`;
      report += `**Recommended Actions:**\n\n`;
      
      opportunity.actions.forEach(action => {
        report += `- ${action}\n`;
      });
      
      report += `\n`;
    });
    
    // Most Critical Gaps
    report += `## Most Critical Gaps\n\n`;
    
    const criticalGaps = this.getGapsSortedByImpact()
      .filter(gap => gap.impactScore >= 4)
      .slice(0, 5);
    
    if (criticalGaps.length === 0) {
      report += `No critical gaps identified.\n\n`;
    } else {
      criticalGaps.forEach((gap, index) => {
        report += `### ${index + 1}. ${gap.title} (${gap.category})\n\n`;
        report += `**Impact Score:** ${gap.impactScore}/5\n\n`;
        report += `${gap.description}\n\n`;
        
        if (gap.data) {
          report += `**Details:**\n\n`;
          report += `- Current Value: ${gap.data.clientValue}\n`;
          report += `- Competitor Average: ${gap.data.competitorAverage}\n`;
          report += `- Difference: ${gap.data.difference}\n\n`;
        }
      });
    }
    
    return report;
  }
}

module.exports = GapAnalysis;
