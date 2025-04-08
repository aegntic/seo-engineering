# Summary of connection.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/connection.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');
  import events = require('events');

  /** The Mongoose module's default connection. Equivalent to `mongoose.connections[0]`, see [`connections`](#mongoose_Mongoose-connections). */
  const connection: Connection;

  /** An array containing all connections associated with this Mongoose instance. */
  const connections: Connection[];

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 10646 characters
- Lines: 262
