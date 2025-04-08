# Summary of errors.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/lib/util/errors.d.ts`

## Content Preview
```
export declare class StateError extends Error {
    wantedStates: string[];
    gotState: string;
    constructor(wantedStates: string[], gotState: string);
}
export declare class UnknownLockfileStatusError extends Error {
    status: number;
    constructor(status: number);
}
export declare class UnableToUnlockLockfileError extends Error {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 3655 characters
- Lines: 120
