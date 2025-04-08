# Summary of validateAsymmetricKey.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/jsonwebtoken/lib/validateAsymmetricKey.js`

## Content Preview
```
const ASYMMETRIC_KEY_DETAILS_SUPPORTED = require('./asymmetricKeyDetailsSupported');
const RSA_PSS_KEY_DETAILS_SUPPORTED = require('./rsaPssKeyDetailsSupported');

const allowedAlgorithmsForKeys = {
  'ec': ['ES256', 'ES384', 'ES512'],
  'rsa': ['RS256', 'PS256', 'RS384', 'PS384', 'RS512', 'PS512'],
  'rsa-pss': ['PS256', 'PS384', 'PS512']
};

const allowedCurves = {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2238 characters
- Lines: 67
