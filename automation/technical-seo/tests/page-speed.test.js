/**
 * Tests for the Page Speed Analyzer
 */

const PageSpeedAnalyzer = require('../analyzers/page-speed');

// Mock Playwright
jest.mock('playwright', () => {
  // Mock implementation for chromium
  const mockChromium = {
    launch: jest.fn().mockResolvedValue({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockResolvedValue({
            status: jest.fn().mockReturnValue(200)
          }),
          evaluate: jest.fn().mockResolvedValue({
            ttfb: 250,
            domInteractive: 850,
            domComplete: 1200,
            loadComplete: 1500,
            resources: {
              script: 10,
              css: 5,
              image: 15,
              font: 2,
              other: 3
            },
            totalResources: 35
          }),
          coverage: {
            startJSCoverage: jest.fn().mockResolvedValue(),
            startCSSCoverage: jest.fn().mockResolvedValue(),
            stopJSCoverage: jest.fn().mockResolvedValue([
              {
                url: 'https://example.com/script.js',
                text: 'function unused() {} function used() {}',
                ranges: [{ start: 20, end: 40 }]
              }
            ]),
            stopCSSCoverage: jest.fn().mockResolvedValue([
              {
                url: 'https://example.com/style.css',
                text: '.unused {} .used {}',
                ranges: [{ start: 10, end: 20 }]
              }
            ])
          }
        })
      }),
      close: jest.fn().mockResolvedValue()
    })
  };

  return {
    chromium: mockChromium
  };
});

describe('PageSpeedAnalyzer', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should analyze page speed successfully', async () => {
    // Arrange
    const url = 'https://example.com';
    const options = { timeout: 5000 };

    // Act
    const result = await PageSpeedAnalyzer.analyze(url, options);

    // Assert
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.loadTime).toBeDefined();
    expect(result.metrics.ttfb).toBe(250);
    expect(result.metrics.domComplete).toBe(1200);
    expect(result.metrics.totalResources).toBe(35);
    expect(result.issues).toBeDefined();
    expect(Array.isArray(result.issues)).toBe(true);
    expect(result.summary).toBeDefined();
  });

  it('should handle fast page speeds with high scores', async () => {
    // Arrange
    const url = 'https://fast-example.com';
    
    // Override the evaluate mock to return fast metrics
    require('playwright').chromium.launch.mockResolvedValueOnce({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockResolvedValue({
            status: jest.fn().mockReturnValue(200)
          }),
          evaluate: jest.fn().mockResolvedValue({
            ttfb: 100,
            domInteractive: 300,
            domComplete: 500,
            loadComplete: 700,
            resources: {
              script: 5,
              css: 2,
              image: 8,
              font: 1,
              other: 1
            },
            totalResources: 17
          }),
          coverage: {
            startJSCoverage: jest.fn().mockResolvedValue(),
            startCSSCoverage: jest.fn().mockResolvedValue(),
            stopJSCoverage: jest.fn().mockResolvedValue([
              {
                url: 'https://fast-example.com/script.js',
                text: 'function used() {}',
                ranges: [{ start: 0, end: 20 }]
              }
            ]),
            stopCSSCoverage: jest.fn().mockResolvedValue([
              {
                url: 'https://fast-example.com/style.css',
                text: '.used {}',
                ranges: [{ start: 0, end: 10 }]
              }
            ])
          }
        })
      }),
      close: jest.fn().mockResolvedValue()
    });

    // Act
    const result = await PageSpeedAnalyzer.analyze(url);

    // Assert
    expect(result.score).toBeGreaterThanOrEqual(80);  // Fast sites should have high scores
    expect(result.issues.length).toBeLessThan(3);     // Fast sites should have few issues
  });

  it('should handle slow page speeds with low scores', async () => {
    // Arrange
    const url = 'https://slow-example.com';
    
    // Override the evaluate mock to return slow metrics
    require('playwright').chromium.launch.mockResolvedValueOnce({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockResolvedValue({
            status: jest.fn().mockReturnValue(200)
          }),
          evaluate: jest.fn().mockResolvedValue({
            ttfb: 1200,
            domInteractive: 3500,
            domComplete: 6000,
            loadComplete: 8000,
            resources: {
              script: 30,
              css: 15,
              image: 50,
              font: 5,
              other: 10
            },
            totalResources: 110
          }),
          coverage: {
            startJSCoverage: jest.fn().mockResolvedValue(),
            startCSSCoverage: jest.fn().mockResolvedValue(),
            stopJSCoverage: jest.fn().mockResolvedValue([
              {
                url: 'https://slow-example.com/script.js',
                text: 'function unused() {} function used() {}',
                ranges: [{ start: 20, end: 40 }]
              }
            ]),
            stopCSSCoverage: jest.fn().mockResolvedValue([
              {
                url: 'https://slow-example.com/style.css',
                text: '.unused {} .unused2 {} .used {}',
                ranges: [{ start: 20, end: 30 }]
              }
            ])
          }
        })
      }),
      close: jest.fn().mockResolvedValue()
    });

    // Act
    const result = await PageSpeedAnalyzer.analyze(url);

    // Assert
    expect(result.score).toBeLessThanOrEqual(50);   // Slow sites should have low scores
    expect(result.issues.length).toBeGreaterThan(2); // Slow sites should have multiple issues
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const url = 'https://error-example.com';
    
    // Override the goto mock to throw an error
    require('playwright').chromium.launch.mockResolvedValueOnce({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockRejectedValue(new Error('Navigation timeout')),
          coverage: {
            startJSCoverage: jest.fn().mockResolvedValue(),
            startCSSCoverage: jest.fn().mockResolvedValue(),
            stopJSCoverage: jest.fn().mockResolvedValue([]),
            stopCSSCoverage: jest.fn().mockResolvedValue([])
          }
        })
      }),
      close: jest.fn().mockResolvedValue()
    });

    // Act
    const result = await PageSpeedAnalyzer.analyze(url);

    // Assert
    expect(result.score).toBe(0);
    expect(result.issues.length).toBe(1);
    expect(result.issues[0].title).toBe('Page Speed Analysis Failed');
    expect(result.issues[0].severity).toBe('high');
  });
});
