import React, { useState } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LegendLinear } from '@visx/legend';

const ContentDuplicationMap = ({ data = null }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [threshold, setThreshold] = useState(60);
  
  // Sample data if no data is provided
  const sampleData = {
    bins: [
      {
        bin: 0,
        label: 'Homepage',
        counts: [
          { bin: 0, count: 100 },
          { bin: 1, count: 35 },
          { bin: 2, count: 28 },
          { bin: 3, count: 12 },
          { bin: 4, count: 15 },
          { bin: 5, count: 8 },
          { bin: 6, count: 10 },
          { bin: 7, count: 5 },
          { bin: 8, count: 15 },
          { bin: 9, count: 20 },
        ],
      },
      {
        bin: 1,
        label: 'About',
        counts: [
          { bin: 0, count: 35 },
          { bin: 1, count: 100 },
          { bin: 2, count: 45 },
          { bin: 3, count: 30 },
          { bin: 4, count: 20 },
          { bin: 5, count: 25 },
          { bin: 6, count: 15 },
          { bin: 7, count: 5 },
          { bin: 8, count: 20 },
          { bin: 9, count: 25 },
        ],
      },
      {
        bin: 2,
        label: 'Products',
        counts: [
          { bin: 0, count: 28 },
          { bin: 1, count: 45 },
          { bin: 2, count: 100 },
          { bin: 3, count: 75 },
          { bin: 4, count: 82 },
          { bin: 5, count: 40 },
          { bin: 6, count: 35 },
          { bin: 7, count: 25 },
          { bin: 8, count: 15 },
          { bin: 9, count: 22 },
        ],
      },
      {
        bin: 3,
        label: 'Product-1',
        counts: [
          { bin: 0, count: 12 },
          { bin: 1, count: 30 },
          { bin: 2, count: 75 },
          { bin: 3, count: 100 },
          { bin: 4, count: 88 },
          { bin: 5, count: 42 },
          { bin: 6, count: 30 },
          { bin: 7, count: 28 },
          { bin: 8, count: 12 },
          { bin: 9, count: 18 },
        ],
      },
      {
        bin: 4,
        label: 'Product-2',
        counts: [
          { bin: 0, count: 15 },
          { bin: 1, count: 20 },
          { bin: 2, count: 82 },
          { bin: 3, count: 88 },
          { bin: 4, count: 100 },
          { bin: 5, count: 45 },
          { bin: 6, count: 32 },
          { bin: 7, count: 35 },
          { bin: 8, count: 10 },
          { bin: 9, count: 15 },
        ],
      },
      {
        bin: 5,
        label: 'Services',
        counts: [
          { bin: 0, count: 8 },
          { bin: 1, count: 25 },
          { bin: 2, count: 40 },
          { bin: 3, count: 42 },
          { bin: 4, count: 45 },
          { bin: 5, count: 100 },
          { bin: 6, count: 78 },
          { bin: 7, count: 68 },
          { bin: 8, count: 25 },
          { bin: 9, count: 35 },
        ],
      },
      {
        bin: 6,
        label: 'Service-1',
        counts: [
          { bin: 0, count: 10 },
          { bin: 1, count: 15 },
          { bin: 2, count: 35 },
          { bin: 3, count: 30 },
          { bin: 4, count: 32 },
          { bin: 5, count: 78 },
          { bin: 6, count: 100 },
          { bin: 7, count: 85 },
          { bin: 8, count: 32 },
          { bin: 9, count: 38 },
        ],
      },
      {
        bin: 7,
        label: 'Service-2',
        counts: [
          { bin: 0, count: 5 },
          { bin: 1, count: 5 },
          { bin: 2, count: 25 },
          { bin: 3, count: 28 },
          { bin: 4, count: 35 },
          { bin: 5, count: 68 },
          { bin: 6, count: 85 },
          { bin: 7, count: 100 },
          { bin: 8, count: 30 },
          { bin: 9, count: 42 },
        ],
      },
      {
        bin: 8,
        label: 'Blog',
        counts: [
          { bin: 0, count: 15 },
          { bin: 1, count: 20 },
          { bin: 2, count: 15 },
          { bin: 3, count: 12 },
          { bin: 4, count: 10 },
          { bin: 5, count: 25 },
          { bin: 6, count: 32 },
          { bin: 7, count: 30 },
          { bin: 8, count: 100 },
          { bin: 9, count: 88 },
        ],
      },
      {
        bin: 9,
        label: 'Contact',
        counts: [
          { bin: 0, count: 20 },
          { bin: 1, count: 25 },
          { bin: 2, count: 22 },
          { bin: 3, count: 18 },
          { bin: 4, count: 15 },
          { bin: 5, count: 35 },
          { bin: 6, count: 38 },
          { bin: 7, count: 42 },
          { bin: 8, count: 88 },
          { bin: 9, count: 100 },
        ],
      },
    ],
    // Page URLs for tooltips
    urls: [
      '/',
      '/about',
      '/products',
      '/products/product-1',
      '/products/product-2',
      '/services',
      '/services/service-1',
      '/services/service-2',
      '/blog',
      '/contact',
    ],
  };

  const heatmapData = data || sampleData;
  
  // Calculate dimensions
  const width = 600;
  const height = 400;
  const margin = { top: 60, right: 80, bottom: 100, left: 100 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const binWidth = xMax / heatmapData.bins[0].counts.length;
  const binHeight = yMax / heatmapData.bins.length;

  // Scales
  const xScale = scaleLinear({
    domain: [0, heatmapData.bins[0].counts.length],
    range: [0, xMax],
  });

  const yScale = scaleLinear({
    domain: [0, heatmapData.bins.length],
    range: [0, yMax],
  });

  const colorScale = scaleLinear({
    domain: [0, 100],
    range: ["#ebf5ee", "#ff0000"],  // Light green to red
  });

  // Filter by threshold
  const filteredData = {
    ...heatmapData,
    bins: heatmapData.bins.map(bin => ({
      ...bin,
      counts: bin.counts.map(count => ({
        ...count,
        count: count.count < threshold ? 0 : count.count,
      })),
    })),
  };

  // Handle cell click
  const handleCellClick = (bin, count) => {
    setSelectedCell({
      page1: heatmapData.bins[bin.bin].label,
      page2: heatmapData.bins[count.bin].label,
      similarity: count.count,
      url1: heatmapData.urls[bin.bin],
      url2: heatmapData.urls[count.bin],
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Content Duplication Map</h2>
      </div>
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-4">
          This heatmap shows content similarity between pages. Red cells indicate higher similarity which may suggest duplicate content issues.
        </div>
        
        <div className="mb-4">
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-1">
            Similarity Threshold: {threshold}%
          </label>
          <input
            type="range"
            id="threshold"
            name="threshold"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="overflow-auto">
          <svg width={width} height={height}>
            <Group left={margin.left} top={margin.top}>
              <HeatmapRect
                data={filteredData.bins}
                xScale={xScale}
                yScale={yScale}
                colorScale={colorScale}
                binWidth={binWidth}
                binHeight={binHeight}
                gap={2}
                onClick={handleCellClick}
              />
              
              <AxisBottom
                scale={xScale}
                top={yMax}
                tickFormat={(d) => heatmapData.bins[d] ? heatmapData.bins[d].label : ''}
                numTicks={heatmapData.bins.length}
                tickLabelProps={() => ({
                  angle: -45,
                  textAnchor: 'end',
                  fontSize: 10,
                  fill: '#6b7280',
                })}
              />
              
              <AxisLeft
                scale={yScale}
                tickFormat={(d) => heatmapData.bins[d] ? heatmapData.bins[d].label : ''}
                numTicks={heatmapData.bins.length}
                tickLabelProps={() => ({
                  fontSize: 10,
                  textAnchor: 'end',
                  dx: '-0.25em',
                  dy: '0.25em',
                  fill: '#6b7280',
                })}
              />
              
              <text
                x={-yMax / 2}
                y={-60}
                transform="rotate(-90)"
                fontSize={12}
                textAnchor="middle"
                fill="#4b5563"
              >
                Page
              </text>
              
              <text
                x={xMax / 2}
                y={yMax + 60}
                fontSize={12}
                textAnchor="middle"
                fill="#4b5563"
              >
                Page
              </text>
            </Group>
            
            <Group left={width - margin.right + 20} top={margin.top}>
              <LegendLinear
                scale={colorScale}
                steps={5}
                labelFormat={(d) => `${Math.round(d)}%`}
                shape="rect"
                itemHeight={15}
                itemWidth={25}
              />
            </Group>
          </svg>
        </div>
        
        {selectedCell && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-2">Duplicate Content Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Page 1:</p>
                <p className="font-medium">{selectedCell.page1}</p>
                <p className="text-sm text-blue-600">{selectedCell.url1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Page 2:</p>
                <p className="font-medium">{selectedCell.page2}</p>
                <p className="text-sm text-blue-600">{selectedCell.url2}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">Similarity:</p>
              <p className="font-medium">{selectedCell.similarity}%</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                View Details
              </button>
              <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                Resolve Issue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDuplicationMap;