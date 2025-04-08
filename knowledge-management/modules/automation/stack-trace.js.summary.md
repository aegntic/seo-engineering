# Summary of stack-trace.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/stack-trace/lib/stack-trace.js`

## Content Preview
```
exports.get = function(belowFn) {
  var oldLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;

  var dummyObject = {};

  var v8Handler = Error.prepareStackTrace;
  Error.prepareStackTrace = function(dummyObject, v8StackTrace) {
    return v8StackTrace;
  };
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 3385 characters
- Lines: 137
