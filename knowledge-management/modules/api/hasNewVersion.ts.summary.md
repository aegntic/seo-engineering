# Summary of hasNewVersion.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/simple-update-notifier/src/hasNewVersion.ts`

## Content Preview
```
import semver from 'semver';
import { createConfigDir, getLastUpdate, saveLastUpdate } from './cache';
import getDistVersion from './getDistVersion';
import { IUpdate } from './types';

const hasNewVersion = async ({
  pkg,
  updateCheckInterval = 1000 * 60 * 60 * 24,
  distTag = 'latest',
  alwaysRun,
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1147 characters
- Lines: 41
