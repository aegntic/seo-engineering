# Summary of Mutex.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async-mutex/lib/Mutex.d.ts`

## Content Preview
```
import MutexInterface from './MutexInterface';
declare class Mutex implements MutexInterface {
    constructor(cancelError?: Error);
    acquire(): Promise<MutexInterface.Releaser>;
    runExclusive<T>(callback: MutexInterface.Worker<T>): Promise<T>;
    isLocked(): boolean;
    waitForUnlock(): Promise<void>;
    release(): void;
    cancel(): void;
    private _semaphore;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 401 characters
- Lines: 13
