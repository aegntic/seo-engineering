# Summary of parse-proxy-response.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/https-proxy-agent/dist/parse-proxy-response.d.ts`

## Content Preview
```
/// <reference types="node" />
import { Readable } from 'stream';
export interface ProxyResponse {
    statusCode: number;
    buffered: Buffer;
}
export default function parseProxyResponse(socket: Readable): Promise<ProxyResponse>;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 233 characters
- Lines: 8
