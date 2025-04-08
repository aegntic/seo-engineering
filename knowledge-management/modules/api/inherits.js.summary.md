# Summary of inherits.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/inherits/inherits.js`

## Content Preview
```
try {
  var util = require('util');
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  module.exports = require('./inherits_browser.js');
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 250 characters
- Lines: 10
