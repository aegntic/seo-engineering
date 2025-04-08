# Summary of timeout.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb/src/timeout.ts`

## Content Preview
```
import { clearTimeout, setTimeout } from 'timers';

import { type Document } from './bson';
import { MongoInvalidArgumentError, MongoOperationTimeoutError, MongoRuntimeError } from './error';
import { type ClientSession } from './sessions';
import { csotMin, noop, squashError } from './utils';

/** @internal */
export class TimeoutError extends Error {
  duration: number;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 12548 characters
- Lines: 406
