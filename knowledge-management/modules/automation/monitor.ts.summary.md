# Summary of monitor.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/sdam/monitor.ts`

## Content Preview
```
import { clearTimeout, setTimeout } from 'timers';

import { type Document, Long } from '../bson';
import { connect } from '../cmap/connect';
import { Connection, type ConnectionOptions } from '../cmap/connection';
import { LEGACY_HELLO_COMMAND } from '../constants';
import { MongoError, MongoErrorLabel, MongoNetworkTimeoutError } from '../error';
import { CancellationToken, TypedEventEmitter } from '../mongo_types';
import type { Callback, EventEmitterWithState } from '../utils';
import { calculateDurationInMs, makeStateMachine, now, ns } from '../utils';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 17055 characters
- Lines: 596
