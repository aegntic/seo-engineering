# Summary of env-http-proxy-agent.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/env-http-proxy-agent.d.ts`

## Content Preview
```
import Agent from './agent'
import Dispatcher from './dispatcher'

export default EnvHttpProxyAgent

declare class EnvHttpProxyAgent extends Dispatcher {
  constructor(opts?: EnvHttpProxyAgent.Options)

  dispatch(options: Agent.DispatchOptions, handler: Dispatcher.DispatchHandlers): boolean;
}
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 675 characters
- Lines: 22
