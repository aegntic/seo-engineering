# Summary of socksclient.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/socks/typings/client/socksclient.d.ts`

## Content Preview
```
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { SocksClientOptions, SocksClientChainOptions, SocksRemoteHost, SocksProxy, SocksClientBoundEvent, SocksClientEstablishedEvent, SocksUDPFrameDetails } from '../common/constants';
import { SocksClientError } from '../common/util';
import { Duplex } from 'stream';
declare interface SocksClient {
    on(event: 'error', listener: (err: SocksClientError) => void): this;
    on(event: 'bound', listener: (info: SocksClientBoundEvent) => void): this;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 6122 characters
- Lines: 163
