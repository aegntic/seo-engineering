# Summary of parse-command.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/parse-command.d.ts`

## Content Preview
```
import { NotEmptyArray } from './common-types';
export declare function parseCommand(cmd: string): ParsedCommand;
export interface ParsedCommand {
    cmd: string;
    demanded: Positional[];
    optional: Positional[];
}
export interface Positional {
    cmd: NotEmptyArray<string>;
    variadic: boolean;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 309 characters
- Lines: 12
