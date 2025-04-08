# Summary of connector.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/connector.d.ts`

## Content Preview
```
import { TLSSocket, ConnectionOptions } from 'tls'
import { IpcNetConnectOpts, Socket, TcpNetConnectOpts } from 'net'

export default buildConnector
declare function buildConnector (options?: buildConnector.BuildOptions): buildConnector.connector

declare namespace buildConnector {
  export type BuildOptions = (ConnectionOptions | TcpNetConnectOpts | IpcNetConnectOpts) & {
    allowH2?: boolean;
    maxCachedSessions?: number | null;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1029 characters
- Lines: 35
