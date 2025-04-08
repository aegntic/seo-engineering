# Summary of https.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/@types/node/https.d.ts`

## Content Preview
```
/**
 * HTTPS is the HTTP protocol over TLS/SSL. In Node.js this is implemented as a
 * separate module.
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/https.js)
 */
declare module "https" {
    import { Duplex } from "node:stream";
    import * as tls from "node:tls";
    import * as http from "node:http";
    import { URL } from "node:url";
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 24807 characters
- Lines: 546
