# Summary of extendStringPrototype.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@colors/colors/lib/extendStringPrototype.js`

## Content Preview
```
var colors = require('./colors');

module['exports'] = function() {
  //
  // Extends prototype of native string object to allow for "foo".red syntax
  //
  var addProperty = function(color, func) {
    String.prototype.__defineGetter__(color, func);
  };

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3295 characters
- Lines: 111
