/**
 * A/B Test Chart Component
 * 
 * Visualizes A/B test performance data over time.
 * 
 * Last updated: April 4, 2025
 */

import React, { useState, useMemo } from 'react';
import { 
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatDate, formatNumber } from '../../../utils/formatters';

/**
 * A/B Test Chart component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Performance data
 * @param {Array} props.variants - Test variants
 * @param {string} props.primaryMetric - Primary metric to display
 * @param {boolean} props.hasWinner - Whether the test has a winner
 * @param {string} props.winnerId - ID of the winning variant
 * @returns {JSX.Element} - Rendered component
 */
const ABTestChart = ({ 
  data, 
  variants, 
  primaryMetric = 'seoScore',
  hasWinner = false,
  winnerId = null
}) => {
  const theme = useTheme();
  const [metric, setMetric] = useState(primaryMetric);
  
  // Define available metrics with labels
  const availableMetrics = [
    { value: 'seoScore', label: 'SEO Score' },
    { value: 'pageSpeed', label: 'Page Speed' },
    { value: 'mobileScore', label: 'Mobile Score' },
    { value: 'coreWebVitals.lcp', label: 'Largest Contentful Paint (LCP)' },
    { value: 'coreWebVitals.cls', label: 'Cumulative Layout Shift (CLS)' },
    { value: 'coreWebVitals.fid', label: 'First Input Delay (FID)' },
    { value: 'coreWebVitals.inp', label: 'Interaction to Next Paint (INP)' }
  ];
  
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || !data.length) return [];
    
    // Group data by date
    const groupedByDate = {};
    
    data.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          timestamp: new Date(item.timestamp).getTime()
        };
      }
      
      // Get the metric value using dot notation
      let value = item.metrics;
      const metricPath = metric.split('.');
      
      for (const part of metricPath) {
        value = value && value[part];
      }
      
      groupedByDate[date][item.variantId] = value;
    });
    
    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data, metric]);
  
  // Generate unique colors for each variant
  const variantColors = useMemo(() => {
    const colors = {
      default: theme.palette.primary.main,
      winner: theme.palette.success.main,
      others: [
        theme.palette.secondary.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        '#8884d8',
        '#82ca9d',
        '#ffc658'
      ]
    };
    
    const variantColors = {};
    let colorIndex = 0;
    
    variants.forEach(variant => {
      if (hasWinner && variant.id === winnerId) {
        variantColors[variant.id] = colors.winner;
      } else if (variant.type === 'control') {
        variantColors[variant.id] = colors.default;
      } else {
        variantColors[variant.id] = colors.others[colorIndex % colors.others.length];
        colorIndex++;
      }
    });
    
    return variantColors;
  }, [variants, hasWinner, winnerId, theme]);
  
  // Handle metric change
  const handleMetricChange = (event) => {
    setMetric(event.target.value);
  };
  
  // Find display name for the current metric
  const metricLabel = availableMetrics.find(m => m.value === metric)?.label || metric;
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: 1
          }}
        >
          <Typography variant="subtitle2">{label}</Typography>
          <Box sx={{ mt: 1 }}>
            {payload.map((entry, index) => {
              const variant = variants.find(v => v.id === entry.dataKey);
              return (
                <Box
                  key={`item-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 0.5
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: entry.color,
                      mr: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {variant?.name || entry.dataKey}:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatNumber(entry.value)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    }
    
    return null;
  };
  
  if (!chartData.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No performance data available yet.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mb: 2
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="metric-select-label">Metric</InputLabel>
          <Select
            labelId="metric-select-label"
            id="metric-select"
            value={metric}
            label="Metric"
            onChange={handleMetricChange}
          >
            {availableMetrics.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {metricLabel} Over Time
      </Typography>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => formatDate(tick, 'short')}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {variants.map(variant => (
            <Line
              key={variant.id}
              type="monotone"
              dataKey={variant.id}
              name={variant.name}
              stroke={variantColors[variant.id]}
              strokeWidth={hasWinner && variant.id === winnerId ? 3 : 2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ABTestChart;
