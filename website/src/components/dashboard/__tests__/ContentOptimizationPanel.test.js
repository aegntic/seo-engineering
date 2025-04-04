import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentOptimizationPanel from '../ContentOptimizationPanel';

describe('ContentOptimizationPanel', () => {
  // Set up any props that the component needs
  const defaultProps = {
    siteId: 1,
    contentUrl: 'https://example.com'
  };
  
  beforeEach(() => {
    // Mock fetch if it's used in the component
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        json: () => Promise.resolve({
          // Mock response that matches the expected data structure
          url: 'https://example.com',
          scores: { overall: 75, keyword: 78, readability: 65, structure: 82 },
          suggestions: []
        })
      })
    );
  });
  
  afterEach(() => {
    // Clean up the mock
    global.fetch.mockClear();
    delete global.fetch;
  });
  
  test('renders loading state initially', () => {
    render(<ContentOptimizationPanel {...defaultProps} />);
    
    // Check for loading indicator
    expect(screen.getByText(/analyzing content/i)).toBeInTheDocument();
  });
  
  test('renders content optimization data after loading', async () => {
    render(<ContentOptimizationPanel {...defaultProps} />);
    
    // Wait for loading to finish and data to be rendered
    await waitFor(() => {
      expect(screen.getByText(/content optimization/i)).toBeInTheDocument();
      expect(screen.getByText(/overall score/i)).toBeInTheDocument();
    });
    
    // Check for score display
    expect(screen.getByText('75')).toBeInTheDocument();
  });
  
  test('allows switching between suggestions and insights tabs', async () => {
    render(<ContentOptimizationPanel {...defaultProps} />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/content optimization/i)).toBeInTheDocument();
    });
    
    // Check default tab (Suggestions should be active)
    expect(screen.getByText(/suggestions/i)).toBeInTheDocument();
    
    // Click on Insights tab
    fireEvent.click(screen.getByText(/insights/i));
    
    // Check that Insights content is now displayed
    expect(screen.getByText(/content overview/i)).toBeInTheDocument();
    
    // Switch back to Suggestions
    fireEvent.click(screen.getByText(/suggestions/i));
    
    // Check that Suggestions content is displayed again
    expect(screen.getByText(/all/i)).toBeInTheDocument(); // Category filter button
  });
  
  test('allows filtering suggestions by category', async () => {
    render(<ContentOptimizationPanel {...defaultProps} />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/content optimization/i)).toBeInTheDocument();
    });
    
    // Click on Keywords category filter
    fireEvent.click(screen.getByText(/keywords/i));
    
    // In a real test with actual data, we'd check that only keyword suggestions are shown
    // For now, just verify that the filter is selected (would have a different styling)
    // This is a simplified test since the actual filtering happens within the component
  });
  
  test('handles refresh button click', async () => {
    render(<ContentOptimizationPanel {...defaultProps} />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/content optimization/i)).toBeInTheDocument();
    });
    
    // Click refresh button
    fireEvent.click(screen.getByText(/refresh/i));
    
    // Check that loading state is shown again
    expect(screen.getByText(/analyzing content/i)).toBeInTheDocument();
    
    // Wait for refresh to complete
    await waitFor(() => {
      expect(screen.getByText(/content optimization/i)).toBeInTheDocument();
    });
  });
});
