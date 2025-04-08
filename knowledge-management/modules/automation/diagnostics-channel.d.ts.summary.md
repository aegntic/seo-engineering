# Summary of diagnostics-channel.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/diagnostics-channel.d.ts`

## Content Preview
```
import { Socket } from "net";
import { URL } from "url";
import Connector from "./connector";
import Dispatcher from "./dispatcher";

declare namespace DiagnosticsChannel {
  interface Request {
    origin?: string | URL;
    completed: boolean;
    method?: Dispatcher.HttpMethod;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1579 characters
- Lines: 67
