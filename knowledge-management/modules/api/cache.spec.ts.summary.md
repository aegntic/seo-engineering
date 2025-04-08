# Summary of cache.spec.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/simple-update-notifier/src/cache.spec.ts`

## Content Preview
```
import { createConfigDir, getLastUpdate, saveLastUpdate } from './cache';

createConfigDir();

jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));

const fakeTime = new Date('2022-01-01').getTime();

test('can save update then get the update details', () => {
  saveLastUpdate('test');
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 527 characters
- Lines: 18
