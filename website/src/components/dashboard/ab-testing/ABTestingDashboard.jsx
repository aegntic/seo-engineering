/**
 * A/B Testing Dashboard Component
 * 
 * Displays A/B tests and their results for a site.
 * 
 * Last updated: April 4, 2025
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Grid,
  Typography,
  Button,
  Chip,
  Alert,
  Box,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Beaker, 
  CheckCircle, 
  XCircle, 
  Clock, 
  PauseCircle,
  Trophy,
  LineChart,
  Plus,
  ArrowRight,
  Zap
} from 'lucide-react';
import api from '../../../services/api';
import { formatDate, formatPercent } from '../../../utils/formatters';
import TestStatusBadge from './TestStatusBadge';
import NewTestDialog from './NewTestDialog';
import ABTestChart from './ABTestChart';

/**
 * A/B Testing Dashboard component
 */
const ABTestingDashboard = () => {
  const { siteId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tests, setTests] = useState([]);
  const [openNewTestDialog, setOpenNewTestDialog] = useState(false);
  
  useEffect(() => {
    fetchTests();
  }, [siteId]);
  
  /**
   * Fetches A/B tests for the site
   */
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ab-testing/tests?siteId=${siteId}`);
      setTests(response.data.tests);
      setError(null);
    } catch (err) {
      setError('Failed to load A/B tests. Please try again.');
      console.error('Error fetching A/B tests:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handles creating a new test
   * 
   * @param {Object} testConfig - Test configuration
   */
  const handleCreateTest = async (testConfig) => {
    try {
      setLoading(true);
      await api.post('/ab-testing/tests', {
        ...testConfig,
        siteId
      });
      setOpenNewTestDialog(false);
      fetchTests();
    } catch (err) {
      setError('Failed to create A/B test. Please try again.');
      console.error('Error creating A/B test:', err);
      setLoading(false);
    }
  };
  
  /**
   * Handles starting a test
   * 
   * @param {string} testId - ID of the test to start
   */
  const handleStartTest = async (testId) => {
    try {
      setLoading(true);
      await api.post(`/ab-testing/tests/${testId}/start`);
      fetchTests();
    } catch (err) {
      setError('Failed to start A/B test. Please try again.');
      console.error('Error starting A/B test:', err);
      setLoading(false);
    }
  };
  
  /**
   * Handles stopping a test
   * 
   * @param {string} testId - ID of the test to stop
   * @param {boolean} implementWinner - Whether to implement the winner
   */
  const handleStopTest = async (testId, implementWinner = true) => {
    try {
      setLoading(true);
      await api.post(`/ab-testing/tests/${testId}/stop`, { implementWinner });
      fetchTests();
    } catch (err) {
      setError('Failed to stop A/B test. Please try again.');
      console.error('Error stopping A/B test:', err);
      setLoading(false);
    }
  };
  
  if (loading && tests.length === 0) {
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
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          A/B Testing
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenNewTestDialog(true)}
        >
          New A/B Test
        </Button>
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
      
      {tests.length === 0 ? (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4
              }}
            >
              <Beaker size={48} strokeWidth={1.5} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                No A/B Tests Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
                Create your first A/B test to start optimizing your site's SEO performance.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenNewTestDialog(true)}
              >
                Create Your First Test
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Active Tests"
                  action={
                    <Button
                      component={Link}
                      to={`/dashboard/sites/${siteId}/ab-testing/history`}
                      endIcon={<ArrowRight size={16} />}
                    >
                      View Test History
                    </Button>
                  }
                />
                <Divider />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Test Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Variants</TableCell>
                        <TableCell>Primary Metric</TableCell>
                        <TableCell>Leader</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tests
                        .filter(test => test.status !== 'completed' && test.status !== 'stopped')
                        .map(test => (
                          <TableRow key={test.id}>
                            <TableCell>
                              <Link to={`/dashboard/sites/${siteId}/ab-testing/${test.id}`}>
                                <Typography variant="subtitle2" component="span">
                                  {test.name}
                                </Typography>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <TestStatusBadge status={test.status} />
                            </TableCell>
                            <TableCell>
                              {test.startDate ? formatDate(test.startDate) : 'Not started'}
                            </TableCell>
                            <TableCell>
                              {test.duration} days
                            </TableCell>
                            <TableCell>
                              {test.variants?.length || 0}
                            </TableCell>
                            <TableCell>
                              {test.metrics?.primary || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {test.hasWinner ? (
                                <Chip 
                                  icon={<Trophy size={14} />} 
                                  label={`${test.winner?.name} (${formatPercent(test.improvementPercentage)})`}
                                  color="success"
                                  size="small"
                                />
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No winner yet
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {test.status === 'created' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Zap size={14} />}
                                  onClick={() => handleStartTest(test.id)}
                                >
                                  Start
                                </Button>
                              )}
                              {test.status === 'running' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="warning"
                                  startIcon={<PauseCircle size={14} />}
                                  onClick={() => handleStopTest(test.id)}
                                >
                                  Stop
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {tests.filter(test => test.status !== 'completed' && test.status !== 'stopped').length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No active tests. Create a new test to get started.
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Recently Completed Tests" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    {tests
                      .filter(test => test.status === 'completed' || test.status === 'stopped')
                      .slice(0, 3)
                      .map(test => (
                        <Grid item xs={12} md={4} key={test.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h6" component="h3">
                                  {test.name}
                                </Typography>
                                <TestStatusBadge status={test.status} />
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                {formatDate(test.startDate)} - {formatDate(test.endDate)}
                              </Typography>
                              
                              {test.hasWinner ? (
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <Trophy size={16} color="gold" />
                                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                      Winner: {test.winner?.name}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <LineChart size={16} />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      Improvement: {formatPercent(test.improvementPercentage)}
                                    </Typography>
                                  </Box>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                  <XCircle size={16} />
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    No significant winner found
                                  </Typography>
                                </Box>
                              )}
                              
                              <Box sx={{ mt: 3 }}>
                                <Button
                                  component={Link}
                                  to={`/dashboard/sites/${siteId}/ab-testing/${test.id}`}
                                  endIcon={<ArrowRight size={16} />}
                                  fullWidth
                                >
                                  View Details
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                  
                  {tests.filter(test => test.status === 'completed' || test.status === 'stopped').length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No completed tests yet. Tests will appear here once they're finished.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      
      <NewTestDialog
        open={openNewTestDialog}
        onClose={() => setOpenNewTestDialog(false)}
        onSubmit={handleCreateTest}
      />
    </div>
  );
};

export default ABTestingDashboard;
