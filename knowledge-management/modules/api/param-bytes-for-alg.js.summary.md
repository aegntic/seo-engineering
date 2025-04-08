# Summary of param-bytes-for-alg.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js`

## Content Preview
```
'use strict';

function getParamSize(keySize) {
	var result = ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
	return result;
}

var paramBytesForAlg = {
	ES256: getParamSize(256),
	ES384: getParamSize(384),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 456 characters
- Lines: 24
