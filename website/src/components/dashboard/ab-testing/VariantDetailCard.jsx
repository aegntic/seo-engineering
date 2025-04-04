/**
 * Variant Detail Card Component
 * 
 * Displays detailed information about a test variant.
 * 
 * Last updated: April 4, 2025
 */

import React, { useState } from 'react';
import { 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  ChevronDown,
  ChevronUp,
  Code,
  Trophy,
  FileText,
  Hash,
  Calendar,
  Clock,
  ArrowRight,
  Beaker,
  Check,
  BarChart
} from 'lucide-react';
import { formatDate, formatNumber, formatPercent } from '../../../utils/formatters';

/**
 * Variant Detail Card component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.variant - Variant data
 * @param {Object} props.test - Test data
 * @param {boolean} props.isWinner - Whether this variant is the winner
 * @param {Object} props.controlVariant - Control variant for comparison
 * @param {Object} props.stats - Variant statistics
 * @param {Object} props.testResult - Statistical test result
 * @returns {JSX.Element} - Rendered component
 */
const VariantDetailCard = ({ 
  variant,
  test,
  isWinner = false,
  controlVariant,
  stats,
  testResult
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Handle expanding/collapsing the card
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Calculate improvement vs control if stats are available
  const improvement = React.useMemo(() => {
    if (!stats || !controlVariant || variant.id === controlVariant.id) {
      return null;
    }
    
    const controlStats = stats || { mean: 0 };
    const controlMean = controlStats.mean || 0;
    
    if (controlMean === 0) {
      return null;
    }
    
    return ((stats.mean - controlMean) / controlMean) * 100;
  }, [stats, controlVariant, variant]);
  
  return (
    <Card 
      sx={{ 
        position: 'relative',
        border: isWinner ? '2px solid' : '1px solid',
        borderColor: isWinner ? 'success.main' : 'divider'
      }}
    >
      {isWinner && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'success.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderBottomLeftRadius: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Trophy size={14} />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              Winner
            </Typography>
          </Box>
        </Box>
      )}
      
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="span">
              {variant.name}
            </Typography>
            {variant.type === 'control' && (
              <Chip 
                label="Control" 
                size="small" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        }
        subheader={variant.description}
        action={
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        }
      />
      
      <Divider />
      
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" component="div">
              Status
            </Typography>
            <Typography variant="body2">
              {variant.status || 'Created'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" component="div">
              Type
            </Typography>
            <Typography variant="body2">
              {variant.type === 'control' ? 'Control' : 'Variant'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" component="div">
              Traffic
            </Typography>
            <Typography variant="body2">
              {variant.trafficAllocation ? formatPercent(variant.trafficAllocation) : 'Equal Split'}
            </Typography>
          </Box>
        </Box>
        
        {stats && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Performance
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" component="div">
                  Average
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatNumber(stats.mean)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary" component="div">
                  Samples
                </Typography>
                <Typography variant="body2">
                  {stats.count}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary" component="div">
                  vs Control
                </Typography>
                {improvement !== null ? (
                  <Typography 
                    variant="body2"
                    color={improvement > 0 ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {improvement > 0 ? '+' : ''}{formatPercent(improvement / 100)}
                  </Typography>
                ) : (
                  <Typography variant="body2">-</Typography>
                )}
              </Box>
            </Box>
            
            {testResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" component="div">
                  Confidence: {formatPercent(testResult.confidenceLevel)}
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    height: 4,
                    backgroundColor: 'background.default',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${testResult.confidenceLevel * 100}%`,
                      backgroundColor: testResult.isSignificant ? 'success.main' : 'warning.main',
                      borderRadius: 2
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Changes Made
            </Typography>
            
            {variant.changes && variant.changes.length > 0 ? (
              <List disablePadding>
                {variant.changes.map((change, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {change.type === 'meta' && <Hash size={18} />}
                      {change.type === 'content' && <FileText size={18} />}
                      {change.type === 'schema' && <Code size={18} />}
                      {(change.type === 'header' || change.type === 'robots') && <FileText size={18} />}
                      {change.type === 'image' && <FileText size={18} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={change.element}
                      secondary={change.path}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No changes recorded for this variant.
              </Typography>
            )}
            
            {variant.implementedAt && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Calendar size={16} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Implemented on {formatDate(variant.implementedAt)}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default VariantDetailCard;
