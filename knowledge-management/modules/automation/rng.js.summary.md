# Summary of rng.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/istanbul-lib-processinfo/node_modules/uuid/dist/esm-browser/rng.js`

## Content Preview
```
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
export default function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1040 characters
- Lines: 19
