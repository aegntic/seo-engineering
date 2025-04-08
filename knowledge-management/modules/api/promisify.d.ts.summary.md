# Summary of promisify.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/agent-base/dist/src/promisify.d.ts`

## Content Preview
```
import { ClientRequest, RequestOptions, AgentCallbackCallback, AgentCallbackPromise } from './index';
declare type LegacyCallback = (req: ClientRequest, opts: RequestOptions, fn: AgentCallbackCallback) => void;
export default function promisify(fn: LegacyCallback): AgentCallbackPromise;
export {};

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 299 characters
- Lines: 5
