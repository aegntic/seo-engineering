# Summary of UserController.js
  
## File Path
`/home/tabs/seo-engineering/api/controllers/agency/UserController.js`

## Content Preview
```
/**
 * UserController.js
 * 
 * Manages user entities within the agency context, including role assignment,
 * permissions management, and invitation workflows.
 */

const { AgencyUser, Role, Agency, Client } = require('../../src/models');
const mongoose = require('mongoose');
const { ValidationError, NotFoundError, AuthorizationError } = require('../../utils/errors');
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 15290 characters
- Lines: 514
