# Summary of authenticate.js
  
## File Path
`/home/tabs/seo-engineering/api/middleware/authenticate.js`

## Content Preview
```
/**
 * Authentication Middleware
 * 
 * Verifies user JWT tokens and attaches user information to the request.
 * Ensures that only authenticated users can access protected routes.
 */

const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
const { AgencyUser } = require('../src/models');
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2404 characters
- Lines: 93
