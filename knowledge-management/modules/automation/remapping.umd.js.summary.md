# Summary of remapping.umd.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@ampproject/remapping/dist/remapping.umd.js`

## Content Preview
```
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@jridgewell/trace-mapping'), require('@jridgewell/gen-mapping')) :
    typeof define === 'function' && define.amd ? define(['@jridgewell/trace-mapping', '@jridgewell/gen-mapping'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.remapping = factory(global.traceMapping, global.genMapping));
})(this, (function (traceMapping, genMapping) { 'use strict';

    const SOURCELESS_MAPPING = /* #__PURE__ */ SegmentObject('', -1, -1, '', null, false);
    const EMPTY_SOURCES = [];
    function SegmentObject(source, line, column, name, content, ignore) {
        return { source, line, column, name, content, ignore };
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 9726 characters
- Lines: 203
