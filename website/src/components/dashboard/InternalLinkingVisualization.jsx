import React, { useState, useRef, useCallback } from 'react';
import { ForceGraph2D } from 'react-force-graph';

const InternalLinkingVisualization = ({ data = null }) => {
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [highlightedLinks, setHighlightedLinks] = useState(new Set());
  const graphRef = useRef(null);
  
  // Sample data if no data is provided
  const sampleData = {
    nodes: [
      { id: 'homepage', url: '/', label: 'Homepage', pageRank: 1.0, depth: 0 },
      { id: 'about', url: '/about', label: 'About Us', pageRank: 0.7, depth: 1 },
      { id: 'services', url: '/services', label: 'Services', pageRank: 0.8, depth: 1 },
      { id: 'products', url: '/products', label: 'Products', pageRank: 0.9, depth: 1 },
      { id: 'blog', url: '/blog', label: 'Blog', pageRank: 0.6, depth: 1 },
      { id: 'contact', url: '/contact', label: 'Contact', pageRank: 0.5, depth: 1 },
      { id: 'product1', url: '/products/product1', label: 'Product 1', pageRank: 0.4, depth: 2 },
      { id: 'product2', url: '/products/product2', label: 'Product 2', pageRank: 0.4, depth: 2 },
      { id: 'product3', url: '/products/product3', label: 'Product 3', pageRank: 0.3, depth: 2 },
      { id: 'blog1', url: '/blog/post1', label: 'Blog Post 1', pageRank: 0.3, depth: 2 },
      { id: 'blog2', url: '/blog/post2', label: 'Blog Post 2', pageRank: 0.3, depth: 2 },
      { id: 'service1', url: '/services/service1', label: 'Service 1', pageRank: 0.4, depth: 2 },
      { id: 'service2', url: '/services/service2', label: 'Service 2', pageRank: 0.4, depth: 2 },
    ],
    links: [
      { source: 'homepage', target: 'about' },
      { source: 'homepage', target: 'services' },
      { source: 'homepage', target: 'products' },
      { source: 'homepage', target: 'blog' },
      { source: 'homepage', target: 'contact' },
      { source: 'products', target: 'product1' },
      { source: 'products', target: 'product2' },
      { source: 'products', target: 'product3' },
      { source: 'blog', target: 'blog1' },
      { source: 'blog', target: 'blog2' },
      { source: 'services', target: 'service1' },
      { source: 'services', target: 'service2' },
      { source: 'product1', target: 'product2' },
      { source: 'product2', target: 'product3' },
      { source: 'product3', target: 'product1' },
      { source: 'blog1', target: 'blog2' },
      { source: 'about', target: 'contact' },
      { source: 'service1', target: 'service2' },
      { source: 'product1', target: 'homepage' },
      { source: 'blog1', target: 'homepage' },
    ]
  };

  const graphData = data || sampleData;
  
  // Handle node hover
  const handleNodeHover = useCallback(node => {
    setHighlightedNode(node);
    
    // Reset links highlights
    setHighlightedLinks(new Set());
    
    if (node) {
      // Get all links connected to this node
      const connectedLinks = new Set();
      graphData.links.forEach(link => {
        if (link.source.id === node.id || link.source === node.id || 
            link.target.id === node.id || link.target === node.id) {
          connectedLinks.add(link);
        }
      });
      setHighlightedLinks(connectedLinks);
    }
  }, [graphData]);

  // Calculate node color based on pageRank and highlight status
  const getNodeColor = node => {
    if (highlightedNode === node) return '#ff5500';
    if (highlightedNode) {
      // Check if this node is connected to the highlighted node
      if (Array.from(highlightedLinks).some(link => {
        return (link.source.id === node.id || link.source === node.id || 
                link.target.id === node.id || link.target === node.id);
      })) {
        return '#ffaa00';
      }
      return '#aaaaaa';
    }
    
    // Color based on pageRank if no highlighting is active
    const r = Math.floor(50 + 205 * node.pageRank);
    const g = Math.floor(100 + 155 * (1 - node.pageRank));
    const b = Math.floor(50 + 100 * (1 - node.pageRank));
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Calculate node size based on pageRank
  const getNodeSize = node => {
    return 5 + (node.pageRank * 10);
  };

  // Calculate link color based on highlight status
  const getLinkColor = link => {
    return highlightedLinks.has(link) ? '#ffaa00' : '#cccccc';
  };

  // Calculate link width based on highlight status
  const getLinkWidth = link => {
    return highlightedLinks.has(link) ? 2 : 1;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Internal Linking Structure</h2>
      </div>
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-4">
          This visualization shows the internal linking structure of your website. Larger nodes represent pages with higher importance. Hover over nodes to see connections.
        </div>
        
        <div className="h-96 border border-gray-200 rounded-lg">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeId="id"
            nodeLabel="label"
            nodeColor={getNodeColor}
            nodeVal={getNodeSize}
            linkColor={getLinkColor}
            linkWidth={getLinkWidth}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            onNodeHover={handleNodeHover}
            cooldownTicks={100}
            nodeCanvasObjectMode={() => 'after'}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'black';
              
              // Draw label for highlighted node or on zoom
              if (node === highlightedNode || globalScale > 1.5) {
                ctx.fillText(label, node.x, node.y + 8);
              }
            }}
          />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 inline-block rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm text-gray-600">High Importance</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 inline-block rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-sm text-gray-600">Medium Importance</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 inline-block rounded-full bg-blue-500 mr-2"></span>
            <span className="text-sm text-gray-600">Low Importance</span>
          </div>
        </div>
        
        <div className="mt-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mr-2">
            Zoom to Fit
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Export Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalLinkingVisualization;