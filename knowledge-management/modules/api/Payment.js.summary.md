# Summary of Payment.js
  
## File Path
`/home/tabs/seo-engineering/api/src/models/Payment.js`

## Content Preview
```
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeCustomerId: {
    type: String,
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1346 characters
- Lines: 72
