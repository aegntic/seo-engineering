# Summary of applyBind.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/call-bind-apply-helpers/applyBind.js`

## Content Preview
```
'use strict';

var bind = require('function-bind');
var $apply = require('./functionApply');
var actualApply = require('./actualApply');

/** @type {import('./applyBind')} */
module.exports = function applyBind() {
	return actualApply(bind, $apply, arguments);
};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 264 characters
- Lines: 11
