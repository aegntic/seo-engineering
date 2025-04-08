# Summary of common-types.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/common-types.d.ts`

## Content Preview
```
/**
 * An object whose all properties have the same type.
 */
export declare type Dictionary<T = any> = {
    [key: string]: T;
};
/**
 * Returns the keys of T that match Dictionary<U> and are not arrays.
 */
export declare type DictionaryKeyof<T, U = any> = Exclude<KeyOf<T, Dictionary<U>>, KeyOf<T, any[]>>;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1209 characters
- Lines: 37
