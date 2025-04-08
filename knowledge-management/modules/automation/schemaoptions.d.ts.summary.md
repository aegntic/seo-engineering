# Summary of schemaoptions.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongoose/types/schemaoptions.d.ts`

## Content Preview
```
declare module 'mongoose' {
  import mongodb = require('mongodb');

  interface SchemaTimestampsConfig {
    createdAt?: boolean | string;
    updatedAt?: boolean | string;
    currentTime?: () => (NativeDate | number);
  }

  type TypeKeyBaseType = string;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 11070 characters
- Lines: 271
