# Summary of hasNewVersion.spec.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/simple-update-notifier/src/hasNewVersion.spec.ts`

## Content Preview
```
import hasNewVersion from './hasNewVersion';
import { getLastUpdate } from './cache';
import getDistVersion from './getDistVersion';

jest.mock('./getDistVersion', () => jest.fn().mockReturnValue('1.0.0'));
jest.mock('./cache', () => ({
  getLastUpdate: jest.fn().mockReturnValue(undefined),
  createConfigDir: jest.fn(),
  saveLastUpdate: jest.fn(),
}));
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2375 characters
- Lines: 83
