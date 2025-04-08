# Summary of usage.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/usage.d.ts`

## Content Preview
```
import { Dictionary } from './common-types';
import { YargsInstance } from './yargs';
import { YError } from './yerror';
import { Y18N } from 'y18n';
export declare function usage(yargs: YargsInstance, y18n: Y18N): UsageInstance;
/** Instance of the usage module. */
export interface UsageInstance {
    cacheHelpMessage(): void;
    clearCachedHelpMessage(): void;
    command(cmd: string, description: string | undefined, isDefault: boolean, aliases: string[], deprecated?: boolean): void;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2100 characters
- Lines: 50
