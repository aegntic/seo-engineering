# Summary of client.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/undici-types/client.d.ts`

## Content Preview
```
import { URL } from 'url'
import { TlsOptions } from 'tls'
import Dispatcher from './dispatcher'
import buildConnector from "./connector";

type ClientConnectOptions = Omit<Dispatcher.ConnectOptions, "origin">;

/**
 * A basic HTTP/1.1 client, mapped on top a single TCP/TLS connection. Pipelining is disabled by default.
 */
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 4964 characters
- Lines: 109
