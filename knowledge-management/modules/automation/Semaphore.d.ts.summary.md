# Summary of Semaphore.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async-mutex/lib/Semaphore.d.ts`

## Content Preview
```
import SemaphoreInterface from './SemaphoreInterface';
declare class Semaphore implements SemaphoreInterface {
    private _value;
    private _cancelError;
    constructor(_value: number, _cancelError?: Error);
    acquire(weight?: number): Promise<[number, SemaphoreInterface.Releaser]>;
    runExclusive<T>(callback: SemaphoreInterface.Worker<T>, weight?: number): Promise<T>;
    waitForUnlock(weight?: number): Promise<void>;
    isLocked(): boolean;
    getValue(): number;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 740 characters
- Lines: 21
