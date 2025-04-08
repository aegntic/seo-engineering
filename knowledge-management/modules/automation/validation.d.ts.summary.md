# Summary of validation.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/validation.d.ts`

## Content Preview
```
import { Dictionary } from './common-types';
import { UsageInstance } from './usage';
import { YargsInstance, Arguments } from './yargs';
import { DetailedArguments } from 'yargs-parser';
import { Y18N } from 'y18n';
export declare function validation(yargs: YargsInstance, usage: UsageInstance, y18n: Y18N): ValidationInstance;
/** Instance of the validation module. */
export interface ValidationInstance {
    check(f: CustomCheck['func'], global: boolean): void;
    conflicting(argv: Arguments): void;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1746 characters
- Lines: 35
