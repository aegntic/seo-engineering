/**
 * Formatters Utility
 * 
 * Provides formatting functions for dates, numbers, and percentages.
 * 
 * Last updated: April 4, 2025
 */

/**
 * Formats a date using Intl.DateTimeFormat
 * 
 * @param {string|Date} date - Date to format
 * @param {string} style - Format style ('full', 'long', 'medium', 'short')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, style = 'medium') => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj)) return 'Invalid Date';
  
  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[style] || {};
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Formats a date range
 * 
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @param {string} style - Format style ('full', 'long', 'medium', 'short')
 * @returns {string} - Formatted date range
 */
export const formatDateRange = (startDate, endDate, style = 'medium') => {
  if (!startDate || !endDate) return 'N/A';
  
  const start = formatDate(startDate, style);
  const end = formatDate(endDate, style);
  
  return `${start} - ${end}`;
};

/**
 * Formats a number using Intl.NumberFormat
 * 
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted number
 */
export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined) return 'N/A';
  
  const defaultOptions = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(value);
};

/**
 * Formats a percentage
 * 
 * @param {number} value - Value to format as percentage (0-1 or 0-100)
 * @returns {string} - Formatted percentage
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  
  // Convert to percentage if value is between 0-1
  const percentValue = Math.abs(value) < 1 ? value * 100 : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(percentValue / 100);
};

/**
 * Formats a file size
 * 
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formats a duration in milliseconds
 * 
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
export const formatDuration = (milliseconds) => {
  if (milliseconds === null || milliseconds === undefined) return 'N/A';
  
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.round((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
};

/**
 * Formats a URL for display
 * 
 * @param {string} url - URL to format
 * @param {boolean} showProtocol - Whether to show the protocol
 * @returns {string} - Formatted URL
 */
export const formatUrl = (url, showProtocol = false) => {
  if (!url) return 'N/A';
  
  try {
    const urlObj = new URL(url);
    const path = `${urlObj.hostname}${urlObj.pathname}`;
    return showProtocol ? `${urlObj.protocol}//${path}` : path;
  } catch (error) {
    return url;
  }
};
