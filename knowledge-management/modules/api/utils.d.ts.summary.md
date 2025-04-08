# Summary of utils.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/sift/lib/utils.d.ts`

## Content Preview
```
export type Key = string | number;
export type Comparator = (a: any, b: any) => boolean;
export declare const typeChecker: <TType>(type: any) => (value: any) => value is TType;
export declare const comparable: (value: any) => any;
export declare const coercePotentiallyNull: (value: any) => any;
export declare const isArray: (value: any) => value is any[];
export declare const isObject: (value: any) => value is Object;
export declare const isFunction: (value: any) => value is Function;
export declare const isProperty: (item: any, key: any) => boolean;
export declare const isVanillaObject: (value: any) => boolean;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 678 characters
- Lines: 12
