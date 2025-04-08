# Summary of redact.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongodb-connection-string-url/lib/redact.d.ts`

## Content Preview
```
import ConnectionString from './index';
export interface ConnectionStringRedactionOptions {
    redactUsernames?: boolean;
    replacementString?: string;
}
export declare function redactValidConnectionString(inputUrl: Readonly<ConnectionString>, options?: ConnectionStringRedactionOptions): ConnectionString;
export declare function redactConnectionString(uri: string, options?: ConnectionStringRedactionOptions): string;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 423 characters
- Lines: 8
