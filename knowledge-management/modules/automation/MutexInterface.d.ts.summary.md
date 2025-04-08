# Summary of MutexInterface.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async-mutex/lib/MutexInterface.d.ts`

## Content Preview
```
interface MutexInterface {
    acquire(): Promise<MutexInterface.Releaser>;
    runExclusive<T>(callback: MutexInterface.Worker<T>): Promise<T>;
    waitForUnlock(): Promise<void>;
    isLocked(): boolean;
    release(): void;
    cancel(): void;
}
declare namespace MutexInterface {
    interface Releaser {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 426 characters
- Lines: 18
