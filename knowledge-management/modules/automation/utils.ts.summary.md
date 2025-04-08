# Summary of utils.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/mongodb-memory-server-core/node_modules/bson/src/parser/utils.ts`

## Content Preview
```
export function isAnyArrayBuffer(value: unknown): value is ArrayBuffer {
  return ['[object ArrayBuffer]', '[object SharedArrayBuffer]'].includes(
    Object.prototype.toString.call(value)
  );
}

export function isUint8Array(value: unknown): value is Uint8Array {
  return Object.prototype.toString.call(value) === '[object Uint8Array]';
}

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1018 characters
- Lines: 30
