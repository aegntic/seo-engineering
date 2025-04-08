# Summary of bus.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/nodemon/lib/utils/bus.js`

## Content Preview
```
var events = require('events');
var debug = require('debug')('nodemon');
var util = require('util');

var Bus = function () {
  events.EventEmitter.call(this);
};

util.inherits(Bus, events.EventEmitter);

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 946 characters
- Lines: 45
