/**
 * Gap Analysis Module Tests
 * 
 * These tests verify the functionality of the gap analysis module.
 */

const { expect } = require('chai');
const sinon = require('sinon');
const path = require('path');
const { createGapAnalysisService } = require('../services/gap-analysis');
const GapAnalysis = require('../models/gap-analysis');

describe('Gap Analysis Module', () => {
  // Test data
  const clientData = {
    summary: {
      pagesAnalyzed: 50,
      averagePerformance: {
        domContentLoaded: 1500,
        load: 3000,
        firstPaint: 1000
      },
      contentStats: {
        averageTitleLength: 45,
        averageDescriptionLength: 120,
        headingsDistribution: {
          h1: 45,
          h2: 120,
          h3: 200
        }
      },
      seoHealth: {
        missingTitlesPercent: 10,
        missingDescriptionsPercent: 15,
        hasSchemaMarkupPercent: 30,
        hasCanonicalPercent: 80,
        hasMobileViewportPercent: 90
      }
    },
    seo: {
      images: {
        withAlt: 120,
        withoutAlt: 40
      },
      links: {
        internal: 450,
        external: 100
      }
    }
  };
  
  const competitorsData = {
    'https://competitor1.com': {
      summary: {
        pagesAnalyzed: 60,
        averagePerformance: {
          domContentLoaded: 1200,
          load: 2500,
          firstPaint: 800
        },
        contentStats: {
          averageTitleLength: 55,
          averageDescriptionLength: 145,
          headingsDistribution: {
            h1: 58,
            h2: 150,
            h3: 250
          }
        },
        seoHealth: {
          missingTitlesPercent: 5,
          missingDescriptionsPercent: 8,
          hasSchemaMarkupPercent: 60,
          hasCanonicalPercent: 90,
          hasMobileViewportPercent: 95
        }
      },
      seo: {
        images: {
          withAlt: 180,
          withoutAlt: 20
        },
        links: {
          internal: 600,
          external: 120
        }
      }
    },
    'https://competitor2.com': {
      summary: {
        pagesAnalyzed: 45,
        averagePerformance: {
          domContentLoaded: 1100,
          load: 2300,
          firstPaint: 750
        },
        contentStats: {
          averageTitleLength: 52,
          averageDescriptionLength: 150,
          headingsDistribution: {
            h1: 43,
            h2: 130,
            h3: 220
          }
        },
        seoHealth: {
          missingTitlesPercent: 3,
          missingDescriptionsPercent: 7,
          hasSchemaMarkupPercent: 50,
          hasCanonicalPercent: 85,
          hasMobileViewportPercent: 100
        }
      },
      seo: {
        images: {
          withAlt: 150,
          withoutAlt: 10
        },
        links: {
          internal: 550,
          external: 90
        }
      }
    }
  };
  
  const keywords = ['keyword1', 'keyword2', 'keyword3'];
  
  describe('GapAnalysis Model', () => {
    let gapAnalysis;
    
    beforeEach(() => {
      gapAnalysis = new GapAnalysis(clientData, competitorsData, keywords);
    });
    
    it('should initialize with the correct properties', () => {
      expect(gapAnalysis.clientData).to.equal(clientData);
      expect(gapAnalysis.competitorsData).to.equal(competitorsData);
      expect(gapAnalysis.keywords).to.equal(keywords);
      expect(gapAnalysis.gaps).to.have.all.keys([
        'technical', 'content', 'keywords', 'performance', 'onPage', 'structure'
      ]);
      expect(gapAnalysis.scores).to.have.all.keys([
        'technical', 'content', 'keywords', 'performance', 'onPage', 'structure', 'overall'
      ]);
    });
    
    it('should add gaps correctly', () => {
      const gap = {
        title: 'Test Gap',
        description: 'A test gap',
        impactScore: 3.5
      };
      
      gapAnalysis.addGap('technical', gap);
      
      expect(gapAnalysis.gaps.technical).to.have.lengthOf(1);
      expect(gapAnalysis.gaps.technical[0]).to.deep.equal(gap);
    });
    
    it('should add opportunities correctly', () => {
      const opportunity = {
        title: 'Test Opportunity',
        description: 'A test opportunity',
        category: 'Technical SEO',
        impactScore: 4.2,
        actions: ['Action 1', 'Action 2']
      };
      
      gapAnalysis.addOpportunity(opportunity);
      
      expect(gapAnalysis.opportunities).to.have.lengthOf(1);
      expect(gapAnalysis.opportunities[0]).to.deep.equal(opportunity);
    });
    
    it('should calculate scores correctly', () => {
      // Add some gaps with known impact scores
      gapAnalysis.addGap('technical', { title: 'Gap 1', impactScore: 3 });
      gapAnalysis.addGap('technical', { title: 'Gap 2', impactScore: 4 });
      gapAnalysis.addGap('content', { title: 'Gap 3', impactScore: 2 });
      gapAnalysis.addGap('content', { title: 'Gap 4', impactScore: 5 });
      
      const scores = gapAnalysis.calculateScores();
      
      // Technical score: 3 + 4 out of max 10 = 30% impact = 70% score
      expect(scores.technical).to.be.closeTo(70, 1);
      
      // Content score: 2 + 5 out of max 10 = 70% impact = 30% score
      expect(scores.content).to.be.closeTo(30, 1);
      
      // Overall score is weighted average
      expect(scores.overall).to.be.lessThan(100);
      expect(scores.overall).to.be.greaterThan(0);
    });
    
    it('should sort gaps by impact', () => {
      gapAnalysis.addGap('technical', { title: 'Low Impact', impactScore: 2 });
      gapAnalysis.addGap('content', { title: 'High Impact', impactScore: 4.5 });
      gapAnalysis.addGap('performance', { title: 'Medium Impact', impactScore: 3.2 });
      
      const sortedGaps = gapAnalysis.getGapsSortedByImpact();
      
      expect(sortedGaps).to.have.lengthOf(3);
      expect(sortedGaps[0].title).to.equal('High Impact');
      expect(sortedGaps[1].title).to.equal('Medium Impact');
      expect(sortedGaps[2].title).to.equal('Low Impact');
    });
    
    it('should generate markdown report', () => {
      gapAnalysis.addGap('technical', { 
        title: 'Missing Schema Markup', 
        description: 'Schema markup is missing', 
        impactScore: 4.2,
        data: {
          clientValue: '30%',
          competitorAverage: '55%',
          difference: '25%'
        }
      });
      
      gapAnalysis.addOpportunity({
        title: 'Implement Schema Markup',
        description: 'Add schema markup to your site',
        category: 'Technical SEO',
        impactScore: 4.2,
        actions: ['Action 1', 'Action 2']
      });
      
      gapAnalysis.calculateScores();
      
      const report = gapAnalysis.generateMarkdownReport();
      
      expect(report).to.be.a('string');
      expect(report).to.include('Gap Analysis Report');
      expect(report).to.include('Implement Schema Markup');
      expect(report).to.include('Missing Schema Markup');
      expect(report).to.include('Action 1');
    });
  });
  
  describe('GapAnalyzer Service', () => {
    let gapAnalysisService;
    
    beforeEach(() => {
      gapAnalysisService = createGapAnalysisService();
    });
    
    it('should analyze gaps between client and competitors', async () => {
      const gapAnalysis = await gapAnalysisService.analyzeGaps(
        clientData,
        competitorsData,
        keywords
      );
      
      expect(gapAnalysis).to.be.an.instanceOf(GapAnalysis);
      expect(gapAnalysis.scores.overall).to.be.a('number');
      expect(gapAnalysis.getAllGaps()).to.be.an('object');
      expect(gapAnalysis.getAllOpportunities()).to.be.an('array');
    });
    
    it('should detect performance gaps', async () => {
      // Create a client with slow performance
      const slowClient = JSON.parse(JSON.stringify(clientData));
      slowClient.summary.averagePerformance.load = 5000; // 5 seconds load time
      
      const gapAnalysis = await gapAnalysisService.analyzeGaps(
        slowClient,
        competitorsData,
        keywords
      );
      
      // Should detect performance gaps
      expect(gapAnalysis.gaps.performance.length).to.be.greaterThan(0);
      
      // Should have a performance opportunity
      const performanceOpportunities = gapAnalysis.getAllOpportunities()
        .filter(o => o.category.includes('Performance'));
      
      expect(performanceOpportunities.length).to.be.greaterThan(0);
    });
    
    it('should detect technical SEO gaps', async () => {
      // Create a client with technical issues
      const technicallyPoorClient = JSON.parse(JSON.stringify(clientData));
      technicallyPoorClient.summary.seoHealth.hasSchemaMarkupPercent = 5; // Very low schema usage
      technicallyPoorClient.summary.seoHealth.missingTitlesPercent = 25; // Many missing titles
      
      const gapAnalysis = await gapAnalysisService.analyzeGaps(
        technicallyPoorClient,
        competitorsData,
        keywords
      );
      
      // Should detect technical gaps
      expect(gapAnalysis.gaps.technical.length).to.be.greaterThan(0);
      
      // Check if it detected schema markup and title issues
      const schemaGap = gapAnalysis.gaps.technical.find(g => g.title.includes('Schema'));
      const titleGap = gapAnalysis.gaps.technical.find(g => g.title.includes('Title'));
      
      expect(schemaGap).to.exist;
      expect(titleGap).to.exist;
    });
  });
  
  describe('VisualizationService', () => {
    let gapAnalysisService;
    let gapAnalysis;
    let fs;
    
    before(async () => {
      // Create a sample gap analysis
      gapAnalysisService = createGapAnalysisService({
        outputDir: path.join(__dirname, 'output')
      });
      
      gapAnalysis = await gapAnalysisService.analyzeGaps(
        clientData,
        competitorsData,
        keywords
      );
      
      // Mock filesystem
      fs = {
        mkdir: sinon.stub().resolves(),
        writeFile: sinon.stub().resolves()
      };
    });
    
    it('should generate visualization data', () => {
      const visualizationData = gapAnalysis.generateVisualizationData();
      
      expect(visualizationData).to.have.keys(['radar', 'comparison', 'opportunities']);
      expect(visualizationData.radar).to.have.keys(['categories', 'clientScores', 'competitorScores']);
      expect(visualizationData.comparison).to.have.keys(['categories', 'clientScore', 'competitorScores']);
      expect(visualizationData.opportunities).to.have.keys(['categories', 'counts', 'impactDistribution']);
    });
  });
});
