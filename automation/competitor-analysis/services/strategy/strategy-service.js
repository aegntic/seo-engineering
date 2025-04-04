/**
 * Strategy Recommendation Service
 * 
 * This service generates strategic SEO recommendations based on benchmark
 * comparison and gap analysis data.
 */

const Strategy = require('../../models/strategy');
const StrategyVisualizationService = require('./visualization-service');
const logger = require('../../utils/logger');

class StrategyService {
  /**
   * Create a new strategy service
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = {
      timelineMonths: 6,
      enableRoiProjection: true,
      priorityThresholds: {
        critical: 4.5,
        high: 3.5,
        medium: 2.5,
        low: 1.0
      },
      resourceCategories: ['time', 'technical', 'content', 'cost'],
      outputDir: null,
      ...options
    };
    
    this.visualizationService = new StrategyVisualizationService({
      outputDir: this.options.outputDir
    });
  }

  /**
   * Initialize the service
   * @returns {Promise<void>}
   */
  async initialize() {
    // Initialize visualization service
    await this.visualizationService.initialize();
    
    logger.info('Strategy service initialized');
  }

  /**
   * Generate strategic recommendations based on gap analysis and benchmark comparison
   * @param {Object} gapAnalysis Gap analysis results
   * @param {Object} benchmarkComparison Benchmark comparison results
   * @param {Object} options Additional options
   * @returns {Promise<Strategy>} Strategic recommendations
   */
  async generateStrategy(gapAnalysis, benchmarkComparison, options = {}) {
    logger.info('Generating strategic recommendations');
    
    // Create strategy model
    const strategy = new Strategy(gapAnalysis, benchmarkComparison, {
      timelineMonths: this.options.timelineMonths,
      priorityThresholds: this.options.priorityThresholds,
      ...options
    });
    
    try {
      // Generate strategic recommendations
      await this._generateStrategicRecommendations(strategy);
      
      // Generate implementation timeline
      await this._generateImplementationTimeline(strategy);
      
      // Generate resource allocation
      await this._generateResourceAllocation(strategy, this.options.resourceCategories);
      
      // Generate ROI projections
      if (this.options.enableRoiProjection) {
        await this._generateRoiProjections(strategy);
      }
      
      // Generate strategy map
      await this._generateStrategyMap(strategy);
      
      logger.info('Strategic recommendations generated successfully');
      
      return strategy;
    } catch (error) {
      logger.error(`Failed to generate strategy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate visualizations for strategy
   * @param {Strategy} strategy Strategy model
   * @param {string} jobId Job ID for naming files
   * @returns {Promise<Object>} Generated visualization paths
   */
  async generateVisualizations(strategy, jobId) {
    try {
      return await this.visualizationService.generateVisualizations(strategy, jobId);
    } catch (error) {
      logger.error(`Failed to generate strategy visualizations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate strategic recommendations based on data
   * @param {Strategy} strategy Strategy model
   * @returns {Promise<void>}
   * @private
   */
  async _generateStrategicRecommendations(strategy) {
    logger.info('Generating strategic recommendations based on data');
    
    // Get gap analysis and benchmark comparison data
    const { gapAnalysis, benchmarkComparison } = strategy;
    
    // Collect all recommendations
    const allRecommendations = [];
    
    // Add recommendations from gap analysis
    const gapOpportunities = gapAnalysis.getAllOpportunities();
    
    for (const opportunity of gapOpportunities) {
      allRecommendations.push({
        title: opportunity.title,
        description: opportunity.description,
        category: opportunity.category,
        impactScore: opportunity.impactScore,
        actions: opportunity.actions || [],
        source: 'gap-analysis',
        relatedGaps: opportunity.relatedGaps || []
      });
    }
    
    // Add recommendations from benchmark comparison
    const benchmarkRecommendations = benchmarkComparison.getRecommendations();
    
    for (const recommendation of benchmarkRecommendations) {
      // Check if this recommendation is already included from gap analysis
      const existing = allRecommendations.find(r => 
        r.title === recommendation.title && 
        r.category === recommendation.category
      );
      
      if (!existing) {
        allRecommendations.push({
          title: recommendation.title,
          description: recommendation.description,
          category: recommendation.category,
          impactScore: this._getImpactFromText(recommendation.impact) || 3.0,
          actions: recommendation.actions || [],
          source: 'benchmark-comparison'
        });
      }
    }
    
    // Deduplicate and merge similar recommendations
    const mergedRecommendations = this._mergeRecommendations(allRecommendations);
    
    // Sort recommendations by impact score (highest first)
    mergedRecommendations.sort((a, b) => b.impactScore - a.impactScore);
    
    // Add merged recommendations to strategy
    for (const recommendation of mergedRecommendations) {
      strategy.addStrategicRecommendation({
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
        impactScore: recommendation.impactScore,
        priority: this._getPriorityFromScore(recommendation.impactScore),
        actions: recommendation.actions,
        source: recommendation.source,
        relatedItems: recommendation.relatedGaps
      });
    }
    
    logger.info(`Generated ${mergedRecommendations.length} strategic recommendations`);
  }

  /**
   * Generate implementation timeline
   * @param {Strategy} strategy Strategy model
   * @returns {Promise<void>}
   * @private
   */
  async _generateImplementationTimeline(strategy) {
    logger.info('Generating implementation timeline');
    
    // Get timeline months from options
    const { timelineMonths } = strategy.options;
    
    // Get all recommendations
    const recommendations = strategy.getAllRecommendations();
    
    // Create phases based on priority
    const phases = [
      {
        name: 'Phase 1: Quick Wins',
        durationMonths: 1,
        maxTasks: 5,
        priorities: ['critical', 'high']
      },
      {
        name: 'Phase 2: Core Improvements',
        durationMonths: 2,
        maxTasks: 8,
        priorities: ['high', 'medium']
      },
      {
        name: 'Phase 3: Advanced Optimization',
        durationMonths: 3,
        maxTasks: 12,
        priorities: ['medium', 'low']
      }
    ];
    
    // Calculate start and end months for each phase
    let currentMonth = 0;
    
    for (const phase of phases) {
      phase.startMonth = currentMonth;
      phase.endMonth = currentMonth + phase.durationMonths;
      currentMonth = phase.endMonth;
      
      // Ensure we don't exceed the timeline
      if (phase.endMonth > timelineMonths) {
        phase.endMonth = timelineMonths;
      }
      
      // Initialize tasks array
      phase.tasks = [];
    }
    
    // Distribute recommendations across phases based on priority
    for (const recommendation of recommendations) {
      // Find the appropriate phase for this recommendation
      let targetPhase = null;
      
      for (const phase of phases) {
        if (phase.priorities.includes(recommendation.priority) && phase.tasks.length < phase.maxTasks) {
          targetPhase = phase;
          break;
        }
      }
      
      // If no phase found, add to the last phase if there's room
      if (!targetPhase && phases[phases.length - 1].tasks.length < phases[phases.length - 1].maxTasks) {
        targetPhase = phases[phases.length - 1];
      }
      
      // If still no phase, skip this recommendation
      if (!targetPhase) {
        continue;
      }
      
      // Add recommendation to phase
      targetPhase.tasks.push({
        id: `task-${targetPhase.tasks.length + 1}`,
        name: recommendation.title,
        priority: recommendation.priority,
        impactScore: recommendation.impactScore,
        category: recommendation.category,
        actions: recommendation.actions,
        duration: this._estimateTaskDuration(recommendation)
      });
    }
    
    // Create a timeline with specific start and end dates for each task
    const timeline = {
      startDate: new Date().toISOString().split('T')[0], // Today
      endDate: this._addMonths(new Date(), timelineMonths).toISOString().split('T')[0], // X months from now
      phases: []
    };
    
    // Calculate specific dates for phases and tasks
    const startDate = new Date(timeline.startDate);
    
    for (const phase of phases) {
      // Calculate phase dates
      const phaseStartDate = this._addMonths(startDate, phase.startMonth);
      const phaseEndDate = this._addMonths(startDate, phase.endMonth);
      
      const timelinePhase = {
        name: phase.name,
        start: phaseStartDate.toISOString().split('T')[0],
        end: phaseEndDate.toISOString().split('T')[0],
        tasks: []
      };
      
      // Distribute tasks evenly within the phase
      const phaseDurationDays = Math.round((phaseEndDate - phaseStartDate) / (1000 * 60 * 60 * 24));
      const tasksPerDay = phase.tasks.length > 0 ? phaseDurationDays / phase.tasks.length : 0;
      
      for (let i = 0; i < phase.tasks.length; i++) {
        const task = phase.tasks[i];
        const taskStartOffset = Math.round(i * tasksPerDay);
        const taskStartDate = new Date(phaseStartDate);
        taskStartDate.setDate(taskStartDate.getDate() + taskStartOffset);
        
        const taskEndDate = new Date(taskStartDate);
        taskEndDate.setDate(taskEndDate.getDate() + task.duration);
        
        // Ensure task doesn't end after phase
        if (taskEndDate > phaseEndDate) {
          taskEndDate.setTime(phaseEndDate.getTime());
        }
        
        timelinePhase.tasks.push({
          id: task.id,
          name: task.name,
          priority: task.priority,
          category: task.category,
          start: taskStartDate.toISOString().split('T')[0],
          end: taskEndDate.toISOString().split('T')[0],
          dependencies: []
        });
      }
      
      timeline.phases.push(timelinePhase);
    }
    
    // Add the timeline to the strategy
    strategy.setTimeline(timeline);
    
    logger.info(`Generated implementation timeline with ${timeline.phases.length} phases`);
  }

  /**
   * Generate resource allocation for strategy
   * @param {Strategy} strategy Strategy model
   * @param {Array} resourceCategories Resource categories
   * @returns {Promise<void>}
   * @private
   */
  async _generateResourceAllocation(strategy, resourceCategories) {
    logger.info('Generating resource allocation');
    
    // Get all recommendations
    const recommendations = strategy.getAllRecommendations();
    
    // Initialize resource allocation
    const resourceAllocation = {
      total: {},
      byPriority: {},
      byCategory: {},
      byPhase: {}
    };
    
    // Initialize resource categories
    for (const category of resourceCategories) {
      resourceAllocation.total[category] = 0;
    }
    
    // Calculate resource allocation by priority
    const priorities = ['critical', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      resourceAllocation.byPriority[priority] = {};
      
      for (const category of resourceCategories) {
        resourceAllocation.byPriority[priority][category] = 0;
      }
    }
    
    // Calculate resource allocation by recommendation category
    const recommendationCategories = [...new Set(recommendations.map(r => r.category))];
    
    for (const category of recommendationCategories) {
      resourceAllocation.byCategory[category] = {};
      
      for (const resourceCategory of resourceCategories) {
        resourceAllocation.byCategory[category][resourceCategory] = 0;
      }
    }
    
    // Calculate resource allocation by phase
    const timeline = strategy.getTimeline();
    
    if (timeline && timeline.phases) {
      for (const phase of timeline.phases) {
        resourceAllocation.byPhase[phase.name] = {};
        
        for (const category of resourceCategories) {
          resourceAllocation.byPhase[phase.name][category] = 0;
        }
      }
    }
    
    // Allocate resources based on recommendations
    for (const recommendation of recommendations) {
      // Calculate resource requirements for this recommendation
      const resources = this._estimateResourceRequirements(recommendation, resourceCategories);
      
      // Add to total
      for (const category of resourceCategories) {
        resourceAllocation.total[category] += resources[category] || 0;
      }
      
      // Add to priority allocation
      for (const category of resourceCategories) {
        resourceAllocation.byPriority[recommendation.priority][category] += resources[category] || 0;
      }
      
      // Add to category allocation
      for (const category of resourceCategories) {
        resourceAllocation.byCategory[recommendation.category][category] += resources[category] || 0;
      }
      
      // Find the phase for this recommendation
      if (timeline && timeline.phases) {
        for (const phase of timeline.phases) {
          const task = phase.tasks.find(t => t.name === recommendation.title);
          
          if (task) {
            // Add to phase allocation
            for (const category of resourceCategories) {
              resourceAllocation.byPhase[phase.name][category] += resources[category] || 0;
            }
            
            break;
          }
        }
      }
    }
    
    // Format resource allocation for visualization
    const resources = [];
    
    // Format allocation by priority
    for (const priority of priorities) {
      resources.push({
        name: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`,
        type: 'priority',
        allocations: { ...resourceAllocation.byPriority[priority] }
      });
    }
    
    // Format allocation by category
    for (const category of recommendationCategories) {
      resources.push({
        name: category,
        type: 'category',
        allocations: { ...resourceAllocation.byCategory[category] }
      });
    }
    
    // Format allocation by phase
    if (timeline && timeline.phases) {
      for (const phase of timeline.phases) {
        resources.push({
          name: phase.name,
          type: 'phase',
          allocations: { ...resourceAllocation.byPhase[phase.name] }
        });
      }
    }
    
    // Add resource allocation to strategy
    strategy.setResourceAllocation({
      total: resourceAllocation.total,
      resources
    });
    
    logger.info('Resource allocation generated successfully');
  }

  /**
   * Generate ROI projections
   * @param {Strategy} strategy Strategy model
   * @returns {Promise<void>}
   * @private
   */
  async _generateRoiProjections(strategy) {
    logger.info('Generating ROI projections');
    
    // Get all recommendations
    const recommendations = strategy.getAllRecommendations();
    
    // Get timeline from strategy
    const timeline = strategy.getTimeline();
    
    // Generate months array for projection
    const months = [];
    let currentDate = new Date(timeline.startDate);
    const endDate = new Date(timeline.endDate);
    
    while (currentDate <= endDate) {
      months.push(currentDate.toISOString().split('T')[0]);
      currentDate = this._addMonths(currentDate, 1);
    }
    
    // Initialize data for projection
    const investment = Array(months.length).fill(0);
    const impact = Array(months.length).fill(0);
    const cumulativeRoi = Array(months.length).fill(0);
    
    // Calculate investment and impact by month
    if (timeline && timeline.phases) {
      for (const phase of timeline.phases) {
        for (const task of phase.tasks) {
          // Find corresponding recommendation
          const recommendation = recommendations.find(r => r.title === task.name);
          
          if (recommendation) {
            // Calculate investment for this task
            const taskInvestment = this._estimateTaskInvestment(recommendation);
            
            // Calculate impact for this task
            const taskImpact = this._estimateTaskImpact(recommendation);
            
            // Find the month index for task start and end
            const startDate = new Date(task.start);
            const endDate = new Date(task.end);
            
            let startMonthIndex = -1;
            let endMonthIndex = -1;
            
            for (let i = 0; i < months.length; i++) {
              const monthDate = new Date(months[i]);
              
              if (monthDate.getMonth() === startDate.getMonth() && 
                  monthDate.getFullYear() === startDate.getFullYear()) {
                startMonthIndex = i;
              }
              
              if (monthDate.getMonth() === endDate.getMonth() && 
                  monthDate.getFullYear() === endDate.getFullYear()) {
                endMonthIndex = i;
                break;
              }
            }
            
            // Distribute investment across implementation months
            if (startMonthIndex >= 0 && endMonthIndex >= 0) {
              const implementationMonths = endMonthIndex - startMonthIndex + 1;
              const monthlyInvestment = taskInvestment / implementationMonths;
              
              for (let i = startMonthIndex; i <= endMonthIndex; i++) {
                investment[i] += monthlyInvestment;
              }
              
              // Impact starts after implementation and continues
              for (let i = endMonthIndex + 1; i < months.length; i++) {
                impact[i] += taskImpact;
              }
            }
          }
        }
      }
    }
    
    // Calculate return (assuming impact translates to return with a multiplier)
    const returnMultiplier = 1.5; // Can be adjusted based on industry/specific case
    const returnValues = impact.map(impactValue => impactValue * returnMultiplier);
    
    // Calculate cumulative ROI
    let cumulativeInvestment = 0;
    let cumulativeReturn = 0;
    
    for (let i = 0; i < months.length; i++) {
      cumulativeInvestment += investment[i];
      cumulativeReturn += returnValues[i];
      
      cumulativeRoi[i] = cumulativeInvestment > 0 
        ? ((cumulativeReturn - cumulativeInvestment) / cumulativeInvestment) * 100 
        : 0;
    }
    
    // Add ROI projection to strategy
    strategy.setRoiProjection({
      months,
      investment,
      return: returnValues,
      cumulativeRoi
    });
    
    logger.info('ROI projections generated successfully');
  }

  /**
   * Generate strategy map
   * @param {Strategy} strategy Strategy model
   * @returns {Promise<void>}
   * @private
   */
  async _generateStrategyMap(strategy) {
    logger.info('Generating strategy map');
    
    // Get all recommendations
    const recommendations = strategy.getAllRecommendations();
    
    // Initialize strategy map
    const strategyMap = {
      nodes: [],
      links: []
    };
    
    // Create a node for each recommendation
    for (const recommendation of recommendations) {
      strategyMap.nodes.push({
        id: `rec-${strategyMap.nodes.length + 1}`,
        name: recommendation.title,
        type: 'recommendation',
        impact: recommendation.impactScore,
        category: recommendation.category,
        priority: recommendation.priority
      });
    }
    
    // Create nodes for categories
    const categories = [...new Set(recommendations.map(r => r.category))];
    
    for (const category of categories) {
      strategyMap.nodes.push({
        id: `cat-${category.replace(/\s+/g, '-').toLowerCase()}`,
        name: category,
        type: 'category',
        impact: 0,
        category: category
      });
    }
    
    // Create links between recommendations and categories
    for (let i = 0; i < recommendations.length; i++) {
      const recommendation = recommendations[i];
      const recommendationNode = strategyMap.nodes[i]; // Recommendation nodes are first in the array
      const categoryNode = strategyMap.nodes.find(n => n.type === 'category' && n.name === recommendation.category);
      
      if (categoryNode) {
        strategyMap.links.push({
          source: recommendationNode.id,
          target: categoryNode.id,
          value: recommendation.impactScore,
          type: 'recommendation-category'
        });
        
        // Update category impact
        categoryNode.impact += recommendation.impactScore;
      }
    }
    
    // Create links between related recommendations
    for (let i = 0; i < recommendations.length; i++) {
      const recommendation = recommendations[i];
      const recommendationNode = strategyMap.nodes[i];
      
      if (recommendation.relatedItems && recommendation.relatedItems.length > 0) {
        for (const relatedItem of recommendation.relatedItems) {
          // Find recommendations that could be related by title
          const relatedNodes = strategyMap.nodes.filter(
            n => n.type === 'recommendation' && n.name.includes(relatedItem)
          );
          
          for (const relatedNode of relatedNodes) {
            // Check if this link already exists
            const existingLink = strategyMap.links.find(
              l => (l.source === recommendationNode.id && l.target === relatedNode.id) ||
                   (l.source === relatedNode.id && l.target === recommendationNode.id)
            );
            
            if (!existingLink && relatedNode.id !== recommendationNode.id) {
              strategyMap.links.push({
                source: recommendationNode.id,
                target: relatedNode.id,
                value: 1, // Default relationship strength
                type: 'recommendation-recommendation'
              });
            }
          }
        }
      }
    }
    
    // Add the strategy map to the strategy
    strategy.setStrategyMap(strategyMap);
    
    logger.info(`Generated strategy map with ${strategyMap.nodes.length} nodes and ${strategyMap.links.length} links`);
  }

  /**
   * Merge similar recommendations
   * @param {Array} recommendations Array of recommendations
   * @returns {Array} Merged recommendations
   * @private
   */
  _mergeRecommendations(recommendations) {
    const mergedRecommendations = [];
    const processedIndices = new Set();
    
    for (let i = 0; i < recommendations.length; i++) {
      if (processedIndices.has(i)) {
        continue;
      }
      
      const recommendation = recommendations[i];
      const similar = [];
      
      // Find similar recommendations
      for (let j = i + 1; j < recommendations.length; j++) {
        if (processedIndices.has(j)) {
          continue;
        }
        
        const other = recommendations[j];
        
        // Check if recommendations are similar (same category and related title)
        if (recommendation.category === other.category && 
            (this._areSimilarTitles(recommendation.title, other.title) ||
             this._hasOverlappingActions(recommendation.actions, other.actions))) {
          similar.push(j);
        }
      }
      
      if (similar.length === 0) {
        // No similar recommendations found, add as is
        mergedRecommendations.push(recommendation);
      } else {
        // Merge with similar recommendations
        const merged = { ...recommendation };
        merged.actions = [...recommendation.actions];
        merged.relatedGaps = [...(recommendation.relatedGaps || [])];
        
        // Track highest impact score
        let maxImpactScore = recommendation.impactScore;
        
        for (const j of similar) {
          const other = recommendations[j];
          
          // Merge actions (avoid duplicates)
          if (other.actions) {
            for (const action of other.actions) {
              if (!merged.actions.includes(action)) {
                merged.actions.push(action);
              }
            }
          }
          
          // Merge related gaps
          if (other.relatedGaps) {
            for (const gap of other.relatedGaps) {
              if (!merged.relatedGaps.includes(gap)) {
                merged.relatedGaps.push(gap);
              }
            }
          }
          
          // Update impact score to the highest
          if (other.impactScore > maxImpactScore) {
            maxImpactScore = other.impactScore;
          }
          
          // Mark as processed
          processedIndices.add(j);
        }
        
        merged.impactScore = maxImpactScore;
        mergedRecommendations.push(merged);
      }
      
      // Mark current recommendation as processed
      processedIndices.add(i);
    }
    
    return mergedRecommendations;
  }

  /**
   * Check if two titles are similar
   * @param {string} title1 First title
   * @param {string} title2 Second title
   * @returns {boolean} True if titles are similar
   * @private
   */
  _areSimilarTitles(title1, title2) {
    if (!title1 || !title2) {
      return false;
    }
    
    // Remove common words and normalize
    const normalize = (title) => {
      return title.toLowerCase()
        .replace(/optimize|improve|enhance|increase|boost|strengthen|fix|implement/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const normalizedTitle1 = normalize(title1);
    const normalizedTitle2 = normalize(title2);
    
    // Check if one title contains the other
    return normalizedTitle1.includes(normalizedTitle2) || 
           normalizedTitle2.includes(normalizedTitle1) ||
           this._calculateSimilarity(normalizedTitle1, normalizedTitle2) > 0.7;
  }

  /**
   * Calculate similarity between two strings
   * @param {string} str1 First string
   * @param {string} str2 Second string
   * @returns {number} Similarity score (0-1)
   * @private
   */
  _calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Calculate Levenshtein distance
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    
    return maxLength > 0 ? 1 - distance / maxLength : 1;
  }

  /**
   * Check if two action lists have overlapping items
   * @param {Array} actions1 First action list
   * @param {Array} actions2 Second action list
   * @returns {boolean} True if action lists overlap
   * @private
   */
  _hasOverlappingActions(actions1, actions2) {
    if (!actions1 || !actions2 || actions1.length === 0 || actions2.length === 0) {
      return false;
    }
    
    // Normalize actions
    const normalize = (action) => {
      return action.toLowerCase().trim();
    };
    
    const normalizedActions1 = actions1.map(normalize);
    const normalizedActions2 = actions2.map(normalize);
    
    // Check for overlapping actions
    for (const action1 of normalizedActions1) {
      for (const action2 of normalizedActions2) {
        if (action1.includes(action2) || action2.includes(action1) || 
            this._calculateSimilarity(action1, action2) > 0.8) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Get impact score from impact text
   * @param {string} impactText Impact text
   * @returns {number} Impact score
   * @private
   */
  _getImpactFromText(impactText) {
    if (!impactText) {
      return 3.0; // Default medium impact
    }
    
    // Extract impact level from text
    if (impactText.toLowerCase().includes('critical')) {
      return 5.0;
    } else if (impactText.toLowerCase().includes('high')) {
      return 4.0;
    } else if (impactText.toLowerCase().includes('medium')) {
      return 3.0;
    } else if (impactText.toLowerCase().includes('low')) {
      return 2.0;
    }
    
    return 3.0; // Default medium impact
  }

  /**
   * Get priority from impact score
   * @param {number} impactScore Impact score
   * @returns {string} Priority level
   * @private
   */
  _getPriorityFromScore(impactScore) {
    const { priorityThresholds } = this.options;
    
    if (impactScore >= priorityThresholds.critical) {
      return 'critical';
    } else if (impactScore >= priorityThresholds.high) {
      return 'high';
    } else if (impactScore >= priorityThresholds.medium) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Estimate task duration in days
   * @param {Object} recommendation Recommendation object
   * @returns {number} Estimated duration in days
   * @private
   */
  _estimateTaskDuration(recommendation) {
    // Base duration based on priority
    let duration = 0;
    
    switch (recommendation.priority) {
      case 'critical':
        duration = 2; // 2 days for critical tasks
        break;
      case 'high':
        duration = 3; // 3 days for high priority tasks
        break;
      case 'medium':
        duration = 5; // 5 days for medium priority tasks
        break;
      case 'low':
        duration = 7; // 7 days for low priority tasks
        break;
      default:
        duration = 5; // Default to 5 days
    }
    
    // Adjust based on number of actions
    if (recommendation.actions && recommendation.actions.length > 0) {
      duration += Math.ceil(recommendation.actions.length / 2);
    }
    
    // Adjust based on category (some categories take longer)
    if (recommendation.category === 'Content' || recommendation.category === 'Technical SEO') {
      duration += 2;
    }
    
    return duration;
  }

  /**
   * Estimate resource requirements for a recommendation
   * @param {Object} recommendation Recommendation object
   * @param {Array} resourceCategories Resource categories
   * @returns {Object} Resource requirements
   * @private
   */
  _estimateResourceRequirements(recommendation, resourceCategories) {
    const resources = {};
    
    // Initialize resources
    for (const category of resourceCategories) {
      resources[category] = 0;
    }
    
    // Base resource requirements by priority
    switch (recommendation.priority) {
      case 'critical':
        resources.time = 16; // 16 hours for critical tasks
        resources.cost = 2000; // $2000 for critical tasks
        break;
      case 'high':
        resources.time = 12; // 12 hours for high priority tasks
        resources.cost = 1500; // $1500 for high priority tasks
        break;
      case 'medium':
        resources.time = 8; // 8 hours for medium priority tasks
        resources.cost = 1000; // $1000 for medium priority tasks
        break;
      case 'low':
        resources.time = 4; // 4 hours for low priority tasks
        resources.cost = 500; // $500 for low priority tasks
        break;
      default:
        resources.time = 8; // Default to 8 hours
        resources.cost = 1000; // Default to $1000
    }
    
    // Adjust based on category
    if (resources.technical !== undefined) {
      if (recommendation.category === 'Technical SEO') {
        resources.technical = 3; // High technical requirement
      } else if (recommendation.category === 'Performance' || recommendation.category === 'Mobile') {
        resources.technical = 2; // Medium technical requirement
      } else {
        resources.technical = 1; // Low technical requirement
      }
    }
    
    if (resources.content !== undefined) {
      if (recommendation.category === 'Content' || recommendation.category === 'Keywords') {
        resources.content = 3; // High content requirement
      } else if (recommendation.category === 'On-Page SEO') {
        resources.content = 2; // Medium content requirement
      } else {
        resources.content = 1; // Low content requirement
      }
    }
    
    // Adjust based on number of actions
    if (recommendation.actions && recommendation.actions.length > 0) {
      resources.time += recommendation.actions.length * 2; // 2 hours per action
      resources.cost += recommendation.actions.length * 100; // $100 per action
    }
    
    return resources;
  }

  /**
   * Estimate investment for a task
   * @param {Object} recommendation Recommendation object
   * @returns {number} Estimated investment amount
   * @private
   */
  _estimateTaskInvestment(recommendation) {
    // Use the cost from resource requirements
    const resources = this._estimateResourceRequirements(recommendation, ['cost']);
    return resources.cost;
  }

  /**
   * Estimate impact for a task
   * @param {Object} recommendation Recommendation object
   * @returns {number} Estimated impact value
   * @private
   */
  _estimateTaskImpact(recommendation) {
    // Base impact on impact score
    let impact = recommendation.impactScore * 200; // $200 per impact point
    
    // Adjust based on priority
    switch (recommendation.priority) {
      case 'critical':
        impact *= 2.0; // 2x impact for critical tasks
        break;
      case 'high':
        impact *= 1.5; // 1.5x impact for high priority tasks
        break;
      case 'medium':
        impact *= 1.0; // Normal impact for medium priority tasks
        break;
      case 'low':
        impact *= 0.5; // 0.5x impact for low priority tasks
        break;
    }
    
    // Adjust based on category
    if (recommendation.category === 'Performance' || recommendation.category === 'Technical SEO') {
      impact *= 1.2; // 1.2x impact for performance and technical tasks
    }
    
    return impact;
  }

  /**
   * Add months to a date
   * @param {Date} date Date object
   * @param {number} months Number of months to add
   * @returns {Date} New date
   * @private
   */
  _addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
}

module.exports = StrategyService;
