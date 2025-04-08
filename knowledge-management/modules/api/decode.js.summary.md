# Summary of decode.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/jsonwebtoken/decode.js`

## Content Preview
```
var jws = require('jws');

module.exports = function (jwt, options) {
  options = options || {};
  var decoded = jws.decode(jwt, options);
  if (!decoded) { return null; }
  var payload = decoded.payload;

  //try parse the payload
  if(typeof payload === 'string') {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 767 characters
- Lines: 31
