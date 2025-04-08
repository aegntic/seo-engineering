# Summary of ToObject.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/es-object-atoms/ToObject.d.ts`

## Content Preview
```
declare function ToObject<T extends object>(value: number): Number;
declare function ToObject<T extends object>(value: boolean): Boolean;
declare function ToObject<T extends object>(value: string): String;
declare function ToObject<T extends object>(value: bigint): BigInt;
declare function ToObject<T extends object>(value: T): T;

export = ToObject;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 352 characters
- Lines: 8
