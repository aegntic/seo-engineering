# Summary of actualApply.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/call-bind-apply-helpers/actualApply.js`

## Content Preview
```
'use strict';

var bind = require('function-bind');

var $apply = require('./functionApply');
var $call = require('./functionCall');
var $reflectApply = require('./reflectApply');

/** @type {import('./actualApply')} */
module.exports = $reflectApply || bind.call($call, $apply);
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 280 characters
- Lines: 11
