# Summary of isSSLError.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/helpers/topology/isSSLError.js`

## Content Preview
```
'use strict';

const getConstructorName = require('../getConstructorName');

const nonSSLMessage = 'Client network socket disconnected before secure TLS ' +
  'connection was established';

module.exports = function isSSLError(topologyDescription) {
  if (getConstructorName(topologyDescription) !== 'TopologyDescription') {
    return false;
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 559 characters
- Lines: 17
