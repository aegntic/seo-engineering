/**
 * Error Notification System
 * 
 * Sends notifications for critical errors through various channels.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../logger');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Load environment variables
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SLACK_WEBHOOK_URL,
  NOTIFICATION_EMAIL,
  ENVIRONMENT
} = process.env;

/**
 * Formats an error for notifications
 * 
 * @param {Error} error - Error to format
 * @returns {string} - Formatted error message
 */
function formatErrorForNotification(error) {
  const timestamp = error.timestamp ? error.timestamp.toISOString() : new Date().toISOString();
  
  let formattedMessage = `
[${ENVIRONMENT || 'development'}] ${error.severity?.toUpperCase() || 'ERROR'} ALERT - ${timestamp}

Message: ${error.message}
Type: ${error.type || 'unknown'}
Module: ${error.module || 'unknown'}
Operation: ${error.operation || 'unknown'}
  `;
  
  if (error.data) {
    formattedMessage += `\nAdditional Data: ${JSON.stringify(error.data, null, 2)}`;
  }
  
  if (error.originalError) {
    formattedMessage += `\nOriginal Error: ${error.originalError.message}`;
    formattedMessage += `\nStack Trace: ${error.originalError.stack}`;
  } else if (error.stack) {
    formattedMessage += `\nStack Trace: ${error.stack}`;
  }
  
  return formattedMessage;
}

/**
 * Sends an email notification
 * 
 * @param {Error} error - Error to send notification for
 * @returns {Promise<void>} - Resolves when email is sent
 */
async function sendEmailNotification(error) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !NOTIFICATION_EMAIL) {
    logger.warn('Email notification not sent: Missing SMTP configuration');
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    
    const formattedError = formatErrorForNotification(error);
    
    const mailOptions = {
      from: SMTP_USER,
      to: NOTIFICATION_EMAIL,
      subject: `[${ENVIRONMENT || 'development'}] ${error.severity?.toUpperCase() || 'ERROR'} ALERT: ${error.message}`,
      text: formattedError
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Email notification sent for error: ${error.message}`);
  } catch (emailError) {
    logger.error(`Failed to send email notification: ${emailError.message}`, { emailError });
  }
}

/**
 * Sends a Slack notification
 * 
 * @param {Error} error - Error to send notification for
 * @returns {Promise<void>} - Resolves when Slack message is sent
 */
async function sendSlackNotification(error) {
  if (!SLACK_WEBHOOK_URL) {
    logger.warn('Slack notification not sent: Missing webhook URL');
    return;
  }
  
  try {
    const formattedError = formatErrorForNotification(error);
    
    const severityColors = {
      critical: '#FF0000',  // Red
      high: '#FFA500',      // Orange
      medium: '#FFFF00',    // Yellow
      low: '#00FF00',       // Green
      info: '#0000FF'       // Blue
    };
    
    const color = severityColors[error.severity] || '#808080'; // Default gray
    
    const payload = {
      text: `*${error.severity?.toUpperCase() || 'ERROR'} ALERT*`,
      attachments: [
        {
          color,
          title: error.message,
          text: formattedError,
          footer: `Environment: ${ENVIRONMENT || 'development'} | ${error.timestamp ? error.timestamp.toISOString() : new Date().toISOString()}`
        }
      ]
    };
    
    await axios.post(SLACK_WEBHOOK_URL, payload);
    logger.info(`Slack notification sent for error: ${error.message}`);
  } catch (slackError) {
    logger.error(`Failed to send Slack notification: ${slackError.message}`, { slackError });
  }
}

/**
 * Sends notifications through configured channels
 * 
 * @param {Error} error - Error to send notifications for
 * @returns {Promise<void>} - Resolves when all notifications are sent
 */
async function sendNotification(error) {
  const notificationPromises = [];
  
  // Email notifications
  notificationPromises.push(sendEmailNotification(error));
  
  // Slack notifications
  notificationPromises.push(sendSlackNotification(error));
  
  // Wait for all notifications to be sent
  await Promise.allSettled(notificationPromises);
}

module.exports = {
  sendNotification,
  formatErrorForNotification,
  sendEmailNotification,
  sendSlackNotification
};
