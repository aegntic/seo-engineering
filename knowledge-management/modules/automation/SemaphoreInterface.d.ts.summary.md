# Summary of SemaphoreInterface.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/async-mutex/lib/SemaphoreInterface.d.ts`

## Content Preview
```
interface SemaphoreInterface {
    acquire(weight?: number): Promise<[number, SemaphoreInterface.Releaser]>;
    runExclusive<T>(callback: SemaphoreInterface.Worker<T>, weight?: number): Promise<T>;
    waitForUnlock(weight?: number): Promise<void>;
    isLocked(): boolean;
    getValue(): number;
    setValue(value: number): void;
    release(weight?: number): void;
    cancel(): void;
}
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 590 characters
- Lines: 20
