# Summary of lrucache.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/semver/internal/lrucache.js`

## Content Preview
```
class LRUCache {
  constructor () {
    this.max = 1000
    this.map = new Map()
  }

  get (key) {
    const value = this.map.get(key)
    if (value === undefined) {
      return undefined
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 788 characters
- Lines: 41
