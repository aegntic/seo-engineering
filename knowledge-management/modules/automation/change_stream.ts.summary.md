# Summary of change_stream.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/change_stream.ts`

## Content Preview
```
import type { Readable } from 'stream';

import type { Binary, Document, Timestamp } from './bson';
import { Collection } from './collection';
import { CHANGE, CLOSE, END, ERROR, INIT, MORE, RESPONSE, RESUME_TOKEN_CHANGED } from './constants';
import type { AbstractCursorEvents, CursorStreamOptions } from './cursor/abstract_cursor';
import { ChangeStreamCursor, type ChangeStreamCursorOptions } from './cursor/change_stream_cursor';
import { Db } from './db';
import {
  type AnyError,
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 32394 characters
- Lines: 974
