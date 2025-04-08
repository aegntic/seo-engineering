const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth.middleware');

// Stripe customer and subscription management
router.post('/create-customer', authenticate, paymentController.createCustomer);
router.post('/create-subscription', authenticate, paymentController.createSubscription);
router.post('/create-payment-intent', authenticate, paymentController.createPaymentIntent);
router.get('/subscription/:userId', authenticate, paymentController.getSubscription);
router.put('/subscription/:subscriptionId', authenticate, paymentController.updateSubscription);
router.delete('/subscription/:subscriptionId', authenticate, paymentController.cancelSubscription);

// Stripe webhook - no authentication needed as it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;