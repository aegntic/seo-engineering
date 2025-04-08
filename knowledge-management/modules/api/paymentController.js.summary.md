# Summary of paymentController.js
  
## File Path
`/home/tabs/seo-engineering/api/src/controllers/paymentController.js`

## Content Preview
```
const Payment = require('../models/Payment');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a stripe customer
exports.createCustomer = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get user from database
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 10680 characters
- Lines: 338
