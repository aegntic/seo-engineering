/**
 * Test Status Badge Component
 * 
 * Displays the status of an A/B test with appropriate styling.
 * 
 * Last updated: April 4, 2025
 */

import React from 'react';
import { Chip } from '@mui/material';
import { 
  Clock,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from 'lucide-react';

/**
 * Test Status Badge component
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Test status
 * @returns {JSX.Element} - Rendered component
 */
const TestStatusBadge = ({ status }) => {
  // Define badge configurations based on status
  const statusConfig = {
    created: {
      label: 'Created',
      color: 'default',
      icon: <Clock size={14} />
    },
    running: {
      label: 'Running',
      color: 'primary',
      icon: <Play size={14} />
    },
    paused: {
      label: 'Paused',
      color: 'warning',
      icon: <Pause size={14} />
    },
    stopped: {
      label: 'Stopped',
      color: 'error',
      icon: <XCircle size={14} />
    },
    completed: {
      label: 'Completed',
      color: 'success',
      icon: <CheckCircle size={14} />
    }
  };
  
  // Use default configuration if status is not recognized
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'default',
    icon: <Clock size={14} />
  };
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      icon={config.icon}
    />
  );
};

export default TestStatusBadge;
