# Summary of completion.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/completion.d.ts`

## Content Preview
```
import { CommandInstance } from './command';
import { UsageInstance } from './usage';
import { YargsInstance } from './yargs';
import { Arguments, DetailedArguments } from 'yargs-parser';
export declare function completion(yargs: YargsInstance, usage: UsageInstance, command: CommandInstance): CompletionInstance;
/** Instance of the completion module. */
export interface CompletionInstance {
    completionKey: string;
    generateCompletionScript($0: string, cmd: string): string;
    getCompletion(args: string[], done: (completions: string[]) => any): any;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 994 characters
- Lines: 22
