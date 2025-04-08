# Summary of paymentRoutes.js
  
## File Path
`/home/tabs/seo-engineering/api/src/routes/paymentRoutes.js`

## Content Preview
```
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Stripe customer and subscription management
router.post('/create-customer', authenticateToken, paymentController.createCustomer);
router.post('/create-subscription', authenticateToken, paymentController.createSubscription);
router.post('/create-payment-intent', authenticateToken, paymentController.createPaymentIntent);
router.get('/subscription/:userId', authenticateToken, paymentController.getSubscription);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1021 characters
- Lines: 17
