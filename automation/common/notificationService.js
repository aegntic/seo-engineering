/**
 * Notification Service
 * 
 * Handles sending notifications about verification results,
 * errors, and scheduled events to various channels.
 */

const logger = require('./logger');
const siteRepository = require('../../api/repositories/siteRepository');
const userRepository = require('../../api/repositories/userRepository');
const config = require('../../config');

/**
 * Send verification failure notification
 * 
 * @param {string} siteId - The site identifier
 * @param {Object} result - Verification result
 * @returns {Promise<void>}
 */
exports.sendVerificationFailureNotification = async (siteId, result) => {
  try {
    logger.info(`Sending verification failure notification for site ${siteId}`);
    
    // Get site details
    const site = await siteRepository.getSiteById(siteId);
    
    if (!site) {
      logger.warn(`Site not found for notification: ${siteId}`);
      return;
    }
    
    // Get site owners/admins
    const users = await userRepository.getSiteUsers(siteId);
    
    if (!users || users.length === 0) {
      logger.warn(`No users found for site notification: ${siteId}`);
      return;
    }
    
    // Format the notification message
    const message = formatVerificationFailureMessage(site, result);
    
    // Send notification to each user based on their preferences
    for (const user of users) {
      await sendUserNotification(user, {
        type: 'verification_failure',
        title: `Verification Failed: ${site.name}`,
        message,
        data: {
          siteId,
          verificationId: result.id,
          timestamp: result.timestamp,
          summary: result.summary
        }
      });
    }
    
    logger.info(`Sent verification failure notifications for site ${siteId}`);
    
  } catch (error) {
    logger.error(`Error sending verification failure notification: ${error.message}`);
  }
};

/**
 * Send verification error notification
 * 
 * @param {string} siteId - The site identifier
 * @param {Error} error - Error object
 * @returns {Promise<void>}
 */
exports.sendVerificationErrorNotification = async (siteId, error) => {
  try {
    logger.info(`Sending verification error notification for site ${siteId}`);
    
    // Get site details
    const site = await siteRepository.getSiteById(siteId);
    
    if (!site) {
      logger.warn(`Site not found for notification: ${siteId}`);
      return;
    }
    
    // Get site owners/admins
    const users = await userRepository.getSiteUsers(siteId);
    
    if (!users || users.length === 0) {
      logger.warn(`No users found for site notification: ${siteId}`);
      return;
    }
    
    // Format the notification message
    const message = `
      An error occurred while verifying site "${site.name}".
      
      Error: ${error.message}
      
      This issue requires manual investigation. Please check the system logs for more details.
    `;
    
    // Send notification to each user based on their preferences
    for (const user of users) {
      await sendUserNotification(user, {
        type: 'verification_error',
        title: `Verification Error: ${site.name}`,
        message,
        data: {
          siteId,
          error: error.message,
          timestamp: new Date()
        }
      });
    }
    
    logger.info(`Sent verification error notifications for site ${siteId}`);
    
  } catch (error) {
    logger.error(`Error sending verification error notification: ${error.message}`);
  }
};

/**
 * Send verification success notification
 * 
 * @param {string} siteId - The site identifier
 * @param {Object} result - Verification result
 * @returns {Promise<void>}
 */
exports.sendVerificationSuccessNotification = async (siteId, result) => {
  try {
    logger.info(`Sending verification success notification for site ${siteId}`);
    
    // Get site details
    const site = await siteRepository.getSiteById(siteId);
    
    if (!site) {
      logger.warn(`Site not found for notification: ${siteId}`);
      return;
    }
    
    // Get site owners/admins
    const users = await userRepository.getSiteUsers(siteId);
    
    if (!users || users.length === 0) {
      logger.warn(`No users found for site notification: ${siteId}`);
      return;
    }
    
    // Format the notification message
    const message = formatVerificationSuccessMessage(site, result);
    
    // Send notification to each user based on their preferences
    for (const user of users) {
      await sendUserNotification(user, {
        type: 'verification_success',
        title: `Verification Succeeded: ${site.name}`,
        message,
        data: {
          siteId,
          verificationId: result.id,
          timestamp: result.timestamp,
          summary: result.summary
        }
      });
    }
    
    logger.info(`Sent verification success notifications for site ${siteId}`);
    
  } catch (error) {
    logger.error(`Error sending verification success notification: ${error.message}`);
  }
};

/**
 * Send verification scheduled notification
 * 
 * @param {string} siteId - The site identifier
 * @param {string} schedule - Cron schedule
 * @param {Date} nextRun - Next scheduled run
 * @returns {Promise<void>}
 */
exports.sendVerificationScheduledNotification = async (siteId, schedule, nextRun) => {
  try {
    logger.info(`Sending verification scheduled notification for site ${siteId}`);
    
    // Get site details
    const site = await siteRepository.getSiteById(siteId);
    
    if (!site) {
      logger.warn(`Site not found for notification: ${siteId}`);
      return;
    }
    
    // Get site owners/admins
    const users = await userRepository.getSiteUsers(siteId);
    
    if (!users || users.length === 0) {
      logger.warn(`No users found for site notification: ${siteId}`);
      return;
    }
    
    // Format the notification message
    const message = `
      Verification has been scheduled for site "${site.name}".
      
      Schedule: ${formatCronSchedule(schedule)}
      Next verification: ${nextRun.toLocaleString()}
    `;
    
    // Send notification to each user based on their preferences
    for (const user of users) {
      await sendUserNotification(user, {
        type: 'verification_scheduled',
        title: `Verification Scheduled: ${site.name}`,
        message,
        data: {
          siteId,
          schedule,
          nextRun
        }
      });
    }
    
    logger.info(`Sent verification scheduled notifications for site ${siteId}`);
    
  } catch (error) {
    logger.error(`Error sending verification scheduled notification: ${error.message}`);
  }
};

/**
 * Send a notification to a user
 * 
 * @param {Object} user - User object
 * @param {Object} notification - Notification details
 * @returns {Promise<void>}
 */
async function sendUserNotification(user, notification) {
  try {
    // Check user notification preferences
    const preferences = user.notificationPreferences || {
      email: true,
      dashboard: true,
      slack: false
    };
    
    // Send email notification
    if (preferences.email) {
      await sendEmailNotification(user.email, notification);
    }
    
    // Send dashboard notification
    if (preferences.dashboard) {
      await saveDashboardNotification(user.id, notification);
    }
    
    // Send Slack notification
    if (preferences.slack && user.slackWebhook) {
      await sendSlackNotification(user.slackWebhook, notification);
    }
    
  } catch (error) {
    logger.error(`Error sending user notification: ${error.message}`);
  }
}

/**
 * Send an email notification
 * 
 * @param {string} email - Recipient email
 * @param {Object} notification - Notification details
 * @returns {Promise<void>}
 */
async function sendEmailNotification(email, notification) {
  try {
    logger.debug(`Sending email notification to ${email}`);
    
    // In a real implementation, this would use a proper email service like Sendgrid, Mailgun, etc.
    // For this example, we'll just log the email
    
    logger.info(`[EMAIL] To: ${email}, Subject: ${notification.title}`);
    logger.info(`[EMAIL] Body: ${notification.message}`);
    
    // Example implementation with a mail service would look like:
    /*
    const mailService = require('./mailService');
    
    await mailService.sendMail({
      to: email,
      subject: notification.title,
      text: notification.message,
      html: formatEmailHtml(notification)
    });
    */
    
  } catch (error) {
    logger.error(`Error sending email notification: ${error.message}`);
  }
}

/**
 * Save a dashboard notification
 * 
 * @param {string} userId - User ID
 * @param {Object} notification - Notification details
 * @returns {Promise<void>}
 */
async function saveDashboardNotification(userId, notification) {
  try {
    logger.debug(`Saving dashboard notification for user ${userId}`);
    
    // In a real implementation, this would save to a database
    // For this example, we'll just log the notification
    
    logger.info(`[DASHBOARD] User: ${userId}, Type: ${notification.type}, Title: ${notification.title}`);
    
    // Example implementation with a database would look like:
    /*
    const notificationRepository = require('../../api/repositories/notificationRepository');
    
    await notificationRepository.createNotification({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date(),
      read: false
    });
    */
    
  } catch (error) {
    logger.error(`Error saving dashboard notification: ${error.message}`);
  }
}

/**
 * Send a Slack notification
 * 
 * @param {string} webhookUrl - Slack webhook URL
 * @param {Object} notification - Notification details
 * @returns {Promise<void>}
 */
async function sendSlackNotification(webhookUrl, notification) {
  try {
    logger.debug(`Sending Slack notification to webhook`);
    
    // In a real implementation, this would use the Slack API
    // For this example, we'll just log the notification
    
    logger.info(`[SLACK] Webhook: ${webhookUrl}, Title: ${notification.title}`);
    
    // Example implementation with Slack API would look like:
    /*
    const { WebClient } = require('@slack/web-api');
    const slack = new WebClient(config.slack.token);
    
    await slack.chat.postMessage({
      channel: webhookUrl,
      text: notification.title,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${notification.title}*\n${notification.message}`
          }
        }
      ]
    });
    */
    
  } catch (error) {
    logger.error(`Error sending Slack notification: ${error.message}`);
  }
}

/**
 * Format verification failure message
 * 
 * @param {Object} site - Site object
 * @param {Object} result - Verification result
 * @returns {string} - Formatted message
 */
function formatVerificationFailureMessage(site, result) {
  let message = `
    Verification failed for site "${site.name}".
    
    Summary:
    - Total Fixes: ${result.summary.totalFixes}
    - Successful: ${result.summary.successfulFixes}
    - Failed: ${result.summary.failedFixes}
    - Success Rate: ${result.summary.successRate.toFixed(1)}%
    - Average Improvement: ${result.summary.averageImprovementPercentage.toFixed(1)}%
    
    Failed Fixes:
  `;
  
  // Add details for each failed fix
  const failedFixes = result.fixes.filter(fix => !fix.success);
  
  failedFixes.forEach((fix, index) => {
    message += `
    ${index + 1}. ${fix.fixType}:
    `;
    
    // Add strategy failures
    Object.entries(fix.strategyResults || {}).forEach(([strategy, strategyResult]) => {
      if (!strategyResult.success) {
        message += `
       - ${formatStrategyName(strategy)}: ${strategyResult.message}
        `;
      }
    });
  });
  
  message += `
    Please review these issues in the dashboard for more details.
  `;
  
  return message;
}

/**
 * Format verification success message
 * 
 * @param {Object} site - Site object
 * @param {Object} result - Verification result
 * @returns {string} - Formatted message
 */
function formatVerificationSuccessMessage(site, result) {
  return `
    Verification succeeded for site "${site.name}".
    
    Summary:
    - Total Fixes: ${result.summary.totalFixes}
    - Success Rate: 100%
    - Average Improvement: ${result.summary.averageImprovementPercentage.toFixed(1)}%
    
    All fixes were successfully verified. You can view the details in the dashboard.
  `;
}

/**
 * Format cron schedule for human readability
 * 
 * @param {string} cronExpression - Cron expression
 * @returns {string} - Human-readable schedule
 */
function formatCronSchedule(cronExpression) {
  const expressions = {
    '0 0 * * *': 'Daily at midnight',
    '0 0 * * 0': 'Weekly on Sunday at midnight',
    '0 0 1 * *': 'Monthly on the 1st at midnight',
    '0 * * * *': 'Hourly at the start of each hour'
  };
  
  return expressions[cronExpression] || cronExpression;
}

/**
 * Format strategy name for display
 * 
 * @param {string} strategy - Strategy name
 * @returns {string} - Formatted name
 */
function formatStrategyName(strategy) {
  switch (strategy) {
    case 'beforeAfter':
      return 'Before/After Comparison';
    case 'performance':
      return 'Performance Impact';
    case 'regression':
      return 'Regression Testing';
    case 'visual':
      return 'Visual Comparison';
    default:
      return strategy;
  }
}
