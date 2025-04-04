/**
 * New Test Dialog Component
 * 
 * Dialog for creating a new A/B test.
 * 
 * Last updated: April 4, 2025
 */

import React, { useState } from 'react';
import { 
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormHelperText,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  Trash2
} from 'lucide-react';

/**
 * New Test Dialog component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Function to close the dialog
 * @param {function} props.onSubmit - Function to submit the new test
 * @returns {JSX.Element} - Rendered component
 */
const NewTestDialog = ({ open, onClose, onSubmit }) => {
  // Step counter
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form values
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [primaryMetric, setPrimaryMetric] = useState('seoScore');
  const [secondaryMetrics, setSecondaryMetrics] = useState([]);
  const [testDuration, setTestDuration] = useState(14);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.95);
  const [variants, setVariants] = useState([
    {
      name: 'Control',
      description: 'The current version',
      type: 'control',
      trafficAllocation: 0.5,
      changes: []
    },
    {
      name: 'Variant A',
      description: 'Test variant',
      type: 'variant',
      trafficAllocation: 0.5,
      changes: []
    }
  ]);
  
  // Define available metrics with labels
  const availableMetrics = [
    { value: 'seoScore', label: 'SEO Score' },
    { value: 'pageSpeed', label: 'Page Speed' },
    { value: 'mobileScore', label: 'Mobile Score' },
    { value: 'coreWebVitals.lcp', label: 'Largest Contentful Paint (LCP)' },
    { value: 'coreWebVitals.cls', label: 'Cumulative Layout Shift (CLS)' },
    { value: 'coreWebVitals.fid', label: 'First Input Delay (FID)' },
    { value: 'coreWebVitals.inp', label: 'Interaction to Next Paint (INP)' },
    { value: 'impressions', label: 'Search Impressions' },
    { value: 'clicks', label: 'Search Clicks' },
    { value: 'ctr', label: 'Click-Through Rate' },
    { value: 'averagePosition', label: 'Average Position' }
  ];
  
  // Define steps
  const steps = [
    'Test Configuration',
    'Variants',
    'Review & Create'
  ];
  
  // Reset form on close
  const handleClose = () => {
    setActiveStep(0);
    setTestName('');
    setTestDescription('');
    setPrimaryMetric('seoScore');
    setSecondaryMetrics([]);
    setTestDuration(14);
    setConfidenceThreshold(0.95);
    setVariants([
      {
        name: 'Control',
        description: 'The current version',
        type: 'control',
        trafficAllocation: 0.5,
        changes: []
      },
      {
        name: 'Variant A',
        description: 'Test variant',
        type: 'variant',
        trafficAllocation: 0.5,
        changes: []
      }
    ]);
    setError(null);
    onClose();
  };
  
  // Validate current step
  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return testName.trim() !== '';
      case 1:
        return variants.length >= 2 && variants.some(v => v.type === 'control');
      default:
        return true;
    }
  };
  
  // Handle step navigation
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare test configuration
      const testConfig = {
        name: testName,
        description: testDescription,
        metrics: {
          primary: primaryMetric,
          secondary: secondaryMetrics
        },
        duration: parseInt(testDuration),
        confidenceThreshold: parseFloat(confidenceThreshold),
        variants
      };
      
      await onSubmit(testConfig);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle variant changes
  const handleAddVariant = () => {
    const newVariantNumber = variants.filter(v => v.type === 'variant').length + 1;
    const letter = String.fromCharCode(65 + newVariantNumber - 1); // A, B, C, etc.
    
    setVariants([
      ...variants,
      {
        name: `Variant ${letter}`,
        description: 'Test variant',
        type: 'variant',
        trafficAllocation: 1 / (variants.length + 1),
        changes: []
      }
    ]);
    
    // Recalculate traffic allocation
    handleRecalculateTraffic(variants.length + 1);
  };
  
  const handleRemoveVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
    
    // Recalculate traffic allocation
    handleRecalculateTraffic(newVariants.length);
  };
  
  const handleUpdateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    };
    setVariants(newVariants);
  };
  
  const handleRecalculateTraffic = (count = variants.length) => {
    // Redistribute traffic equally
    const newVariants = variants.map(variant => ({
      ...variant,
      trafficAllocation: 1 / count
    }));
    
    setVariants(newVariants);
  };
  
  // Handle secondary metrics
  const handleSecondaryMetricChange = (event) => {
    setSecondaryMetrics(event.target.value);
  };
  
  // Render content for current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Basic Information
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Test Name"
              fullWidth
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              error={testName.trim() === ''}
              helperText={testName.trim() === '' ? 'Test name is required' : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Test Parameters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="primary-metric-label">Primary Metric</InputLabel>
                  <Select
                    labelId="primary-metric-label"
                    id="primary-metric"
                    value={primaryMetric}
                    label="Primary Metric"
                    onChange={(e) => setPrimaryMetric(e.target.value)}
                  >
                    {availableMetrics.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    The main metric used to determine the winner
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="secondary-metrics-label">Secondary Metrics</InputLabel>
                  <Select
                    labelId="secondary-metrics-label"
                    id="secondary-metrics"
                    multiple
                    value={secondaryMetrics}
                    label="Secondary Metrics"
                    onChange={handleSecondaryMetricChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const metric = availableMetrics.find(m => m.value === value);
                          return (
                            <Chip 
                              key={value} 
                              label={metric ? metric.label : value} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableMetrics
                      .filter(option => option.value !== primaryMetric)
                      .map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>
                    Additional metrics to track (optional)
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="duration"
                  label="Duration (days)"
                  fullWidth
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: 90 } }}
                  value={testDuration}
                  onChange={(e) => setTestDuration(e.target.value)}
                  helperText="Recommended: 14-30 days for reliable results"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="confidence"
                  label="Confidence Threshold"
                  fullWidth
                  type="number"
                  InputProps={{ inputProps: { min: 0.8, max: 0.99, step: 0.01 } }}
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(e.target.value)}
                  helperText="Statistical confidence required (0.8-0.99)"
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">
                Test Variants ({variants.length})
              </Typography>
              <Button
                startIcon={<Plus size={16} />}
                onClick={handleAddVariant}
                size="small"
              >
                Add Variant
              </Button>
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              You'll define the actual changes for each variant after the test is created.
            </Alert>
            
            {variants.map((variant, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  position: 'relative',
                  borderColor: variant.type === 'control' ? 'primary.main' : 'divider'
                }}
              >
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  {variant.type !== 'control' && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveVariant(index)}
                      aria-label="remove variant"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="dense"
                      label="Variant Name"
                      fullWidth
                      required
                      value={variant.name}
                      onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                      InputProps={{
                        startAdornment: variant.type === 'control' && (
                          <Chip 
                            label="Control" 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="dense"
                      label="Description"
                      fullWidth
                      value={variant.description}
                      onChange={(e) => handleUpdateVariant(index, 'description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Traffic Allocation: {Math.round(variant.trafficAllocation * 100)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                onClick={handleRecalculateTraffic}
                startIcon={<Info size={16} />}
                size="small"
              >
                Reset Traffic Allocation
              </Button>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Test Summary
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6">{testName}</Typography>
              {testDescription && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {testDescription}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Primary Metric
                  </Typography>
                  <Typography variant="body1">
                    {availableMetrics.find(m => m.value === primaryMetric)?.label || primaryMetric}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Test Duration
                  </Typography>
                  <Typography variant="body1">
                    {testDuration} days
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Confidence Threshold
                  </Typography>
                  <Typography variant="body1">
                    {Math.round(confidenceThreshold * 100)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Secondary Metrics
                  </Typography>
                  <Typography variant="body1">
                    {secondaryMetrics.length > 0 ? 
                      secondaryMetrics.map(metric => 
                        availableMetrics.find(m => m.value === metric)?.label || metric
                      ).join(', ') : 
                      'None'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Typography variant="subtitle2" gutterBottom>
              Variants ({variants.length})
            </Typography>
            
            <List>
              {variants.map((variant, index) => (
                <ListItem 
                  key={index}
                  divider={index < variants.length - 1}
                  secondaryAction={
                    <Typography variant="body2">
                      {Math.round(variant.trafficAllocation * 100)}%
                    </Typography>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {variant.name}
                        {variant.type === 'control' && (
                          <Chip 
                            label="Control" 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={variant.description}
                  />
                </ListItem>
              ))}
            </List>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Create New A/B Test
      </DialogTitle>
      
      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep > 0 && (
          <Button onClick={handleBack} startIcon={<ChevronLeft size={16} />}>
            Back
          </Button>
        )}
        <LoadingButton
          onClick={handleNext}
          variant="contained"
          loading={loading}
          endIcon={activeStep < steps.length - 1 ? <ChevronRight size={16} /> : null}
          disabled={!validateStep()}
        >
          {activeStep === steps.length - 1 ? 'Create Test' : 'Next'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default NewTestDialog;
