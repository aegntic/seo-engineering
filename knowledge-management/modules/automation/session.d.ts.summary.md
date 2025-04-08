# Summary of session.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/session.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');

  type ClientSessionOptions = mongodb.ClientSessionOptions;
  type ClientSession = mongodb.ClientSession;

  /**
   * _Requires MongoDB >= 3.6.0._ Starts a [MongoDB session](https://www.mongodb.com/docs/manual/release-notes/3.6/#client-sessions)
   * for benefits like causal consistency, [retryable writes](https://www.mongodb.com/docs/manual/core/retryable-writes/),
   * and [transactions](http://thecodebarbarian.com/a-node-js-perspective-on-mongodb-4-transactions.html).
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1342 characters
- Lines: 33
