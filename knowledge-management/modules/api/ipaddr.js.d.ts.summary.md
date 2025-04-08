# Summary of ipaddr.js.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/ipaddr.js/lib/ipaddr.js.d.ts`

## Content Preview
```
declare module "ipaddr.js" {
    type IPv4Range = 'unicast' | 'unspecified' | 'broadcast' | 'multicast' | 'linkLocal' | 'loopback' | 'carrierGradeNat' | 'private' | 'reserved';
    type IPv6Range = 'unicast' | 'unspecified' | 'linkLocal' | 'multicast' | 'loopback' | 'uniqueLocal' | 'ipv4Mapped' | 'rfc6145' | 'rfc6052' | '6to4' | 'teredo' | 'reserved';

    interface RangeList<T> {
        [name: string]: [T, number] | [T, number][];
    }

    // Common methods/properties for IPv4 and IPv6 classes.
    class IP {
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 2959 characters
- Lines: 69
