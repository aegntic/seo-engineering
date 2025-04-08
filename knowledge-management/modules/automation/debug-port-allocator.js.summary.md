# Summary of debug-port-allocator.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/workerpool/src/debug-port-allocator.js`

## Content Preview
```
'use strict';

var MAX_PORTS = 65535;
module.exports = DebugPortAllocator;
function DebugPortAllocator() {
  this.ports = Object.create(null);
  this.length = 0;
}

DebugPortAllocator.prototype.nextAvailableStartingAt = function(starting) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 613 characters
- Lines: 29
