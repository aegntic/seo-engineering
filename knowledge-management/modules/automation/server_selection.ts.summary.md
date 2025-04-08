# Summary of server_selection.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/mongodb/src/sdam/server_selection.ts`

## Content Preview
```
import { MongoCompatibilityError, MongoInvalidArgumentError } from '../error';
import { ReadPreference } from '../read_preference';
import { ServerType, TopologyType } from './common';
import type { ServerDescription, TagSet } from './server_description';
import type { TopologyDescription } from './topology_description';

// max staleness constants
const IDLE_WRITE_PERIOD = 10000;
const SMALLEST_MAX_STALENESS_SECONDS = 90;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 10394 characters
- Lines: 325
