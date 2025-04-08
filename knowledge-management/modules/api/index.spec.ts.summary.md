# Summary of index.spec.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/simple-update-notifier/src/index.spec.ts`

## Content Preview
```
import simpleUpdateNotifier from '.';
import hasNewVersion from './hasNewVersion';

const consoleSpy = jest.spyOn(console, 'error');

jest.mock('./hasNewVersion', () => jest.fn().mockResolvedValue('2.0.0'));

beforeEach(jest.clearAllMocks);

test('it logs message if update is available', async () => {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 744 characters
- Lines: 28
