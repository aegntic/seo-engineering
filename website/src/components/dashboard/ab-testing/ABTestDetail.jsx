/**
 * A/B Test Detail Component
 * 
 * Displays detailed information about a specific A/B test.
 * 
 * Last updated: April 4, 2025
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { 
  ArrowLeft,
  Clock,
  Beaker,
  LineChart,
  Users,
  Zap,
  Trophy,
  BarChart,
  XCircle,
  CheckCircle,
  PauseCircle
} from 'lucide-react';
import api from '../../../services/api';
import { formatDate, formatDateRange, formatNumber, formatPercent } from '../../../utils/formatters';
import ABTestChart from './ABTestChart';
import TestStatusBadge from './TestStatusBadge';
import VariantDetailCard from './VariantDetailCard';
import ConfirmDialog from '../../common/ConfirmDialog';

/**
 * A/B Test Detail component
 */
const ABTestDetail = () => {
  const { siteId, testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(null);
  const [variants, setVariants] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmStop, setConfirmStop] = useState(false);
  
  useEffect(() => {
    fetchTestData();
  }, [testId]);
  
  /**
   * Fetches all test data
   */
  const fetchTestData = async () => {
    try {
      setLoading(true);
      
      // Get test details
      const testResponse = await api.get(`/ab-testing/tests/${testId}`);
      setTest(testResponse.data.test);
      
      // Get variants
      const variantsResponse = await api.get(`/ab-testing/tests/${testId}/variants`);
      setVariants(variantsResponse.data.variants);
      
      // Get metrics
      const metricsResponse = await api.get(`/ab-testing/tests/${testId}/metrics`);
      setMetrics(metricsResponse.data.metrics);
      
      // Get analysis if test is running
      if (testResponse.data.test.status === 'running' || 
          testResponse.data.test.status === 'completed' || 
          testResponse.data.test.status === 'stopped') {
        const analysisResponse = await api.get(`/ab-testing/tests/${testId}/analysis`);
        setAnalysis(analysisResponse.data.analysis);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load test data. Please try again.');
      console.error('Error fetching test data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handles starting the test
   */
  const handleStartTest = async () => {
    try {
      setLoading(true);
      await api.post(`/ab-testing/tests/${testId}/start`);
      fetchTestData();
    } catch (err) {
      setError('Failed to start test. Please try again.');
      console.error('Error starting test:', err);
      setLoading(false);
    }
  };
  
  /**
   * Handles stopping the test
   * 
   * @param {boolean} implementWinner - Whether to implement the winner
   */
  const handleStopTest = async (implementWinner = true) => {
    try {
      setLoading(true);
      setConfirmStop(false);
      
      await api.post(`/ab-testing/tests/${testId}/stop`, { implementWinner });
      fetchTestData();
    } catch (err) {
      setError('Failed to stop test. Please try again.');
      console.error('Error stopping test:', err);
      setLoading(false);
    }
  };
  
  /**
   * Handles tab change
   * 
   * @param {object} event - Event object
   * @param {number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading && !test) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (!test) {
    return (
      <Alert severity="error">
        Test not found or failed to load. Please try again.
      </Alert>
    );
  }
  
  // Find control variant
  const controlVariant = variants.find(v => v.type === 'control');
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(`/dashboard/sites/${siteId}/ab-testing`)}
        >
          Back to A/B Tests
        </Button>
        
        {test.status === 'created' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Zap size={18} />}
            onClick={handleStartTest}
          >
            Start Test
          </Button>
        )}
        {test.status === 'running' && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<PauseCircle size={18} />}
            onClick={() => setConfirmStop(true)}
          >
            Stop Test
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h1" gutterBottom>
                {test.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {test.description || 'No description provided.'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TestStatusBadge status={test.status} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Created: {formatDate(test.createdAt)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Beaker size={20} strokeWidth={1.5} />
                    <Typography variant="h6">
                      {variants.length}
                    </Typography>
                    <Typography variant="caption">Variants</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Clock size={20} strokeWidth={1.5} />
                    <Typography variant="h6">
                      {test.duration}
                    </Typography>
                    <Typography variant="caption">Days</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Users size={20} strokeWidth={1.5} />
                    <Typography variant="h6">
                      {analysis ? formatNumber(Object.values(analysis.sampleSizes).reduce((sum, size) => sum + size, 0)) : 'N/A'}
                    </Typography>
                    <Typography variant="caption">Visitors</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <BarChart size={20} strokeWidth={1.5} />
                    <Typography variant="h6">
                      {formatPercent(test.confidenceThreshold || 0.95)}
                    </Typography>
                    <Typography variant="caption">Confidence</Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {test.startDate && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Test period: {test.endDate ? formatDateRange(test.startDate, test.endDate) : `Started ${formatDate(test.startDate)}`}
                  </Typography>
                </Box>
              )}
              
              {analysis && analysis.hasWinner && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'success.light',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trophy size={24} color="gold" />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1">
                      Winner: {analysis.winner?.id ? variants.find(v => v.id === analysis.winner.id)?.name : 'Unknown'}
                    </Typography>
                    <Typography variant="body2">
                      Improvement: {formatPercent(analysis.improvementPercentage)} with {formatPercent(analysis.winner.confidence)} confidence
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Variants" />
          <Tab label="Metrics" />
          <Tab label="Analysis" />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Test Performance" />
              <Divider />
              <CardContent>
                {metrics.length > 0 ? (
                  <ABTestChart
                    data={metrics}
                    variants={variants}
                    primaryMetric={test.metrics?.primary}
                    hasWinner={analysis?.hasWinner}
                    winnerId={analysis?.winner?.id}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No performance data available yet. Start the test to collect data.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Test Configuration" />
              <Divider />
              <CardContent>
                <Typography variant="subtitle2">Primary Metric</Typography>
                <Typography variant="body2" paragraph>
                  {test.metrics?.primary || 'Not specified'}
                </Typography>
                
                <Typography variant="subtitle2">Secondary Metrics</Typography>
                <Typography variant="body2" paragraph>
                  {test.metrics?.secondary?.length > 0 
                    ? test.metrics.secondary.join(', ')
                    : 'None specified'}
                </Typography>
                
                <Typography variant="subtitle2">Traffic Allocation</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Variant</TableCell>
                        <TableCell align="right">Allocation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {variants.map(variant => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            {variant.name}
                            {variant.type === 'control' && (
                              <Chip
                                label="Control"
                                size="small"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {variant.trafficAllocation 
                              ? formatPercent(variant.trafficAllocation)
                              : 'Equal'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Results Summary" />
              <Divider />
              <CardContent>
                {analysis ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2">Statistical Significance</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {analysis.hasWinner ? (
                          <>
                            <CheckCircle size={20} color="green" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              Statistically significant result found
                            </Typography>
                          </>
                        ) : (
                          <>
                            <XCircle size={20} color="gray" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              No statistically significant result yet
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="subtitle2">Sample Sizes</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1, mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Variant</TableCell>
                            <TableCell align="right">Visitors</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(analysis.sampleSizes).map(([variantId, count]) => {
                            const variant = variants.find(v => v.id === variantId);
                            return (
                              <TableRow key={variantId}>
                                <TableCell>{variant?.name || 'Unknown'}</TableCell>
                                <TableCell align="right">{formatNumber(count)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <Typography variant="subtitle2">Performance Comparison</Typography>
                    {analysis.variantStats && (
                      <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Variant</TableCell>
                              <TableCell align="right">Mean</TableCell>
                              <TableCell align="right">vs Control</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(analysis.variantStats).map(([variantId, stats]) => {
                              const variant = variants.find(v => v.id === variantId);
                              const isControl = variant?.type === 'control';
                              const controlMean = controlVariant ? analysis.variantStats[controlVariant.id]?.mean : 0;
                              const difference = isControl ? 0 : ((stats.mean - controlMean) / controlMean) * 100;
                              
                              return (
                                <TableRow key={variantId}>
                                  <TableCell>
                                    {variant?.name || 'Unknown'}
                                    {isControl && (
                                      <Chip
                                        label="Control"
                                        size="small"
                                        variant="outlined"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatNumber(stats.mean)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {isControl ? (
                                      '-'
                                    ) : (
                                      <Typography
                                        component="span"
                                        color={difference > 0 ? 'success.main' : 'error.main'}
                                      >
                                        {difference > 0 ? '+' : ''}{formatPercent(difference / 100)}
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No analysis data available yet. Start the test to collect data.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Variants Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {variants.map(variant => (
            <Grid item xs={12} md={6} key={variant.id}>
              <VariantDetailCard
                variant={variant}
                test={test}
                isWinner={analysis?.hasWinner && analysis?.winner?.id === variant.id}
                controlVariant={controlVariant}
                stats={analysis?.variantStats?.[variant.id]}
                testResult={analysis?.testResults?.[variant.id]}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Metrics Tab */}
      {activeTab === 2 && (
        <Card>
          <CardHeader title="Performance Metrics" />
          <Divider />
          <CardContent>
            {metrics.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Page Speed</TableCell>
                      <TableCell>Mobile Score</TableCell>
                      <TableCell>SEO Score</TableCell>
                      <TableCell>LCP</TableCell>
                      <TableCell>CLS</TableCell>
                      <TableCell>FID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.map(metric => {
                      const variant = variants.find(v => v.id === metric.variantId);
                      return (
                        <TableRow key={metric.id}>
                          <TableCell>{formatDate(metric.timestamp)}</TableCell>
                          <TableCell>{variant?.name || 'Unknown'}</TableCell>
                          <TableCell>{metric.metrics.pageSpeed}</TableCell>
                          <TableCell>{metric.metrics.mobileScore}</TableCell>
                          <TableCell>{metric.metrics.seoScore}</TableCell>
                          <TableCell>{metric.metrics.coreWebVitals?.lcp || 'N/A'}</TableCell>
                          <TableCell>{metric.metrics.coreWebVitals?.cls || 'N/A'}</TableCell>
                          <TableCell>{metric.metrics.coreWebVitals?.fid || 'N/A'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No metrics available yet. Start the test to collect data.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Analysis Tab */}
      {activeTab === 3 && (
        <Card>
          <CardHeader title="Statistical Analysis" />
          <Divider />
          <CardContent>
            {analysis ? (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Test Results
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Variant</TableCell>
                        <TableCell>T-Value</TableCell>
                        <TableCell>P-Value</TableCell>
                        <TableCell>Degrees of Freedom</TableCell>
                        <TableCell>Significant</TableCell>
                        <TableCell>Confidence</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(analysis.testResults || {}).map(([variantId, result]) => {
                        const variant = variants.find(v => v.id === variantId);
                        return (
                          <TableRow key={variantId}>
                            <TableCell>{variant?.name || 'Unknown'}</TableCell>
                            <TableCell>{formatNumber(result.tValue)}</TableCell>
                            <TableCell>{formatNumber(result.pValue)}</TableCell>
                            <TableCell>{result.df}</TableCell>
                            <TableCell>
                              {result.isSignificant ? (
                                <CheckCircle size={16} color="green" />
                              ) : (
                                <XCircle size={16} color="gray" />
                              )}
                            </TableCell>
                            <TableCell>{formatPercent(result.confidenceLevel)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Typography variant="subtitle1" gutterBottom>
                  Variant Statistics
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Variant</TableCell>
                        <TableCell>Mean</TableCell>
                        <TableCell>Median</TableCell>
                        <TableCell>Min</TableCell>
                        <TableCell>Max</TableCell>
                        <TableCell>Std Dev</TableCell>
                        <TableCell>Sample Size</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(analysis.variantStats || {}).map(([variantId, stats]) => {
                        const variant = variants.find(v => v.id === variantId);
                        return (
                          <TableRow key={variantId}>
                            <TableCell>{variant?.name || 'Unknown'}</TableCell>
                            <TableCell>{formatNumber(stats.mean)}</TableCell>
                            <TableCell>{formatNumber(stats.median)}</TableCell>
                            <TableCell>{formatNumber(stats.min)}</TableCell>
                            <TableCell>{formatNumber(stats.max)}</TableCell>
                            <TableCell>{formatNumber(stats.stdDev)}</TableCell>
                            <TableCell>{stats.count}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No analysis data available yet. Start the test to collect data.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      <ConfirmDialog
        open={confirmStop}
        title="Stop A/B Test"
        message={
          analysis && analysis.hasWinner
            ? `This test has a winning variant. Would you like to implement the winner (${variants.find(v => v.id === analysis.winner.id)?.name}) on the live site?`
            : "This test doesn't have a clear winner yet. Are you sure you want to stop it?"
        }
        confirmText={analysis && analysis.hasWinner ? "Implement Winner" : "Stop Test"}
        cancelText={analysis && analysis.hasWinner ? "Stop Without Implementing" : "Cancel"}
        onConfirm={() => handleStopTest(true)}
        onCancel={() => analysis && analysis.hasWinner ? handleStopTest(false) : setConfirmStop(false)}
      />
    </div>
  );
};

export default ABTestDetail;
