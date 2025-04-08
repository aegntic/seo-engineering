# Summary of glob.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/glob/glob.js`

## Content Preview
```
// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 19445 characters
- Lines: 791
