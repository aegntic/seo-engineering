const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Stripe customer and subscription management
router.post('/create-customer', authenticateToken, paymentController.createCustomer);
router.post('/create-subscription', authenticateToken, paymentController.createSubscription);
router.post('/create-payment-intent', authenticateToken, paymentController.createPaymentIntent);
router.get('/subscription/:userId', authenticateToken, paymentController.getSubscription);
router.put('/subscription/:subscriptionId', authenticateToken, paymentController.updateSubscription);
router.delete('/subscription/:subscriptionId', authenticateToken, paymentController.cancelSubscription);

// Stripe webhook - no authentication needed as it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;