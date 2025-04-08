# Summary of timespan.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/jsonwebtoken/lib/timespan.js`

## Content Preview
```
var ms = require('ms');

module.exports = function (time, iat) {
  var timestamp = iat || Math.floor(Date.now() / 1000);

  if (typeof time === 'string') {
    var milliseconds = ms(time);
    if (typeof milliseconds === 'undefined') {
      return;
    }
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 412 characters
- Lines: 18
