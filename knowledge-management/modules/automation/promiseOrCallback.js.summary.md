# Summary of promiseOrCallback.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/lib/helpers/promiseOrCallback.js`

## Content Preview
```
'use strict';

const immediate = require('./immediate');

const emittedSymbol = Symbol('mongoose#emitted');

module.exports = function promiseOrCallback(callback, fn, ee, Promise) {
  if (typeof callback === 'function') {
    try {
      return fn(function(error) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1512 characters
- Lines: 55
