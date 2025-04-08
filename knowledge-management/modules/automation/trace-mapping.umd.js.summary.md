# Summary of trace-mapping.umd.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@jridgewell/trace-mapping/dist/trace-mapping.umd.js`

## Content Preview
```
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jridgewell/sourcemap-codec'), require('@jridgewell/resolve-uri')) :
    typeof define === 'function' && define.amd ? define(['exports', '@jridgewell/sourcemap-codec', '@jridgewell/resolve-uri'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.traceMapping = {}, global.sourcemapCodec, global.resolveURI));
})(this, (function (exports, sourcemapCodec, resolveUri) { 'use strict';

    function resolve(input, base) {
        // The base is always treated as a directory, if it's not empty.
        // https://github.com/mozilla/source-map/blob/8cb3ee57/lib/util.js#L327
        // https://github.com/chromium/chromium/blob/da4adbb3/third_party/blink/renderer/devtools/front_end/sdk/SourceMap.js#L400-L401
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 25530 characters
- Lines: 601
