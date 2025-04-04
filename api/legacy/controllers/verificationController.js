/**
 * Verification Controller
 * 
 * Handles API requests related to the verification system,
 * processing inputs and returning structured responses.
 */

const VerificationSystem = require('../../automation/verification');
const verificationRepository = require('../repositories/verificationRepository');
const siteRepository = require('../repositories/siteRepository');
const fixRepository = require('../repositories/fixRepository');
const logger = require('../../automation/common/logger');

// Initialize verification system
const verificationSystem = new VerificationSystem();

/**
 * Get verification results for a site
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getVerificationResults = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    // Check site access permission for the authenticated user
    const hasAccess = await siteRepository.checkUserSiteAccess(req.user.id, siteId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this site'
      });
    }
    
    // Get the latest verification result
    const result = await verificationRepository.getLatestVerificationResult(siteId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No verification results found for this site'
      });
    }
    
    // Format response for client consumption
    return res.json({
      success: true,
      data: result.toClientFormat()
    });
    
  } catch (error) {
    logger.error(`Error retrieving verification results: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving verification results',
      error: error.message
    });
  }
};

/**
 * Get verification history for a site
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getVerificationHistory = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    // Check site access permission
    const hasAccess = await siteRepository.checkUserSiteAccess(req.user.id, siteId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this site'
      });
    }
    
    // Get verification history
    const history = await verificationRepository.getVerificationHistory(
      siteId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    // Get total count for pagination
    const totalCount = await verificationRepository.getVerificationHistoryCount(siteId);
    
    // Format response for client consumption
    return res.json({
      success: true,
      data: {
        history: history.map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          success: item.success,
          summary: item.summary
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
    
  } catch (error) {
    logger.error(`Error retrieving verification history: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving verification history',
      error: error.message
    });
  }
};

/**
 * Trigger verification for a site
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.triggerVerification = async (req, res) => {
  try {
    const { siteId } = req.params;
    const options = req.body.options || {};
    
    // Check site access permission
    const hasAccess = await siteRepository.checkUserSiteAccess(req.user.id, siteId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this site'
      });
    }
    
    // Check if site exists
    const site = await siteRepository.getSiteById(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }
    
    // Start verification in the background
    // Send immediate response to client
    res.json({
      success: true,
      message: 'Verification started',
      verificationId: options.trackingId || Date.now().toString()
    });
    
    // Perform verification (async)
    try {
      logger.info(`Starting verification for site ${siteId}`);
      const result = await verificationSystem.verifySite(siteId, options);
      
      // Save verification result
      await verificationRepository.saveVerificationResult(siteId, result);
      
      logger.info(`Verification completed for site ${siteId}, success: ${result.success}`);
      
    } catch (verificationError) {
      logger.error(`Verification failed for site ${siteId}: ${verificationError.message}`);
      
      // Save failed verification result
      await verificationRepository.saveVerificationError(siteId, verificationError);
    }
    
  } catch (error) {
    logger.error(`Error triggering verification: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error triggering verification',
      error: error.message
    });
  }
};

/**
 * Get verification results for a specific fix
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getFixVerificationResults = async (req, res) => {
  try {
    const { siteId, fixId } = req.params;
    
    // Check site access permission
    const hasAccess = await siteRepository.checkUserSiteAccess(req.user.id, siteId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this site'
      });
    }
    
    // Get fix verification result
    const result = await verificationRepository.getFixVerificationResult(siteId, fixId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No verification results found for this fix'
      });
    }
    
    return res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error(`Error retrieving fix verification results: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving fix verification results',
      error: error.message
    });
  }
};

/**
 * Trigger verification for a specific fix
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.triggerFixVerification = async (req, res) => {
  try {
    const { siteId, fixId } = req.params;
    const options = req.body.options || {};
    
    // Check site access permission
    const hasAccess = await siteRepository.checkUserSiteAccess(req.user.id, siteId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this site'
      });
    }
    
    // Check if fix exists
    const fix = await fixRepository.getFixById(siteId, fixId);
    if (!fix) {
      return res.status(404).json({
        success: false,
        message: 'Fix not found'
      });
    }
    
    // Start verification in the background
    // Send immediate response to client
    res.json({
      success: true,
      message: 'Fix verification started',
      verificationId: options.trackingId || Date.now().toString()
    });
    
    // Perform verification (async)
    try {
      logger.info(`Starting verification for fix ${fixId} on site ${siteId}`);
      
      // Verify the specific fix
      const result = await verificationSystem.verifyFix(siteId, fix, options);
      
      // Save verification result
      await verificationRepository.saveFixVerificationResult(siteId, fixId, result);
      
      logger.info(`Verification completed for fix ${fixId}, success: ${result.success}`);
      
    } catch (verificationError) {
      logger.error(`Verification failed for fix ${fixId}: ${verificationError.message}`);
      
      // Save failed verification result
      await verificationRepository.saveFixVerificationError(siteId, fixId, verificationError);
    }
    
  } catch (error) {
    logger.error(`Error triggering fix verification: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error triggering fix verification',
      error: error.message
    });
  }
};

/**
 * Get screenshots from a verification
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getVerificationScreenshots = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { type = 'all' } = req.query; // 'before', 'after', 'diff', or 'all'
    
    // Get the verification to check permissions
    const verification = await verificationRepository.getVerificationById(verificationId);
    
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }
    
    // Check site access permission for the verification's site
    const hasAccess = await siteRepository.checkUserSiteAccess(req.user.id, verification.siteId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this verification'
      });
    }
    
    // Get screenshots
    const screenshots = await verificationRepository.getVerificationScreenshots(verificationId, type);
    
    if (!screenshots || screenshots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No screenshots found for this verification'
      });
    }
    
    return res.json({
      success: true,
      data: screenshots
    });
    
  } catch (error) {
    logger.error(`Error retrieving verification screenshots: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving verification screenshots',
      error: error.message
    });
  }
};
