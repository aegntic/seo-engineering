/**
 * Client Controller
 * Handles client CRUD operations and related functionality
 */

const { Client, User } = require('../models');

/**
 * Get all clients for the authenticated user
 */
exports.getClients = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find user's clients
    const clients = await Client.find({ owner: userId });
    
    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single client by ID
 */
exports.getClient = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = req.params.id;
    
    // Find client by ID and ensure it belongs to the user
    const client = await Client.findOne({
      _id: clientId,
      owner: userId
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new client
 */
exports.createClient = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const {
      name,
      websiteUrl,
      gitRepository,
      crawlSettings
    } = req.body;
    
    // Create client
    const client = await Client.create({
      name,
      websiteUrl,
      owner: userId,
      gitRepository,
      crawlSettings: crawlSettings || {}
    });
    
    // Add client reference to user
    await User.findByIdAndUpdate(userId, {
      $push: { clients: client._id }
    });
    
    return res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a client
 */
exports.updateClient = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = req.params.id;
    
    const {
      name,
      websiteUrl,
      status,
      gitRepository,
      crawlSettings,
      apiAccess
    } = req.body;
    
    // Find client and verify ownership
    let client = await Client.findOne({
      _id: clientId,
      owner: userId
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Update client
    client = await Client.findByIdAndUpdate(clientId, {
      name,
      websiteUrl,
      status,
      gitRepository,
      crawlSettings,
      apiAccess
    }, {
      new: true,
      runValidators: true
    });
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a client
 */
exports.deleteClient = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = req.params.id;
    
    // Find client and verify ownership
    const client = await Client.findOne({
      _id: clientId,
      owner: userId
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Remove client reference from user
    await User.findByIdAndUpdate(userId, {
      $pull: { clients: clientId }
    });
    
    // Delete client
    await Client.findByIdAndDelete(clientId);
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get client SEO score and summary
 */
exports.getClientSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = req.params.id;
    
    // Find client and verify ownership
    const client = await Client.findOne({
      _id: clientId,
      owner: userId
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Get the latest report for this client
    const latestReport = await Report.findOne({ client: clientId })
      .sort({ createdAt: -1 })
      .select('seoScore summary crawlDate pagesScanned');
    
    const summary = {
      seoScore: client.seoScore,
      websiteUrl: client.websiteUrl,
      status: client.status,
      lastCrawled: client.crawlSettings.lastCrawled,
      latestReport: latestReport || null
    };
    
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update client crawl settings
 */
exports.updateCrawlSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = req.params.id;
    
    const { crawlSettings } = req.body;
    
    // Find client and verify ownership
    let client = await Client.findOne({
      _id: clientId,
      owner: userId
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Update crawl settings
    client = await Client.findByIdAndUpdate(clientId, {
      crawlSettings
    }, {
      new: true,
      runValidators: true
    });
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};