# Summary of helpers.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/ip-address/src/v6/helpers.ts`

## Content Preview
```
import { sprintf } from 'sprintf-js';

/**
 * @returns {String} the string with all zeroes contained in a <span>
 */
export function spanAllZeroes(s: string): string {
  return s.replace(/(0+)/g, '<span class="zero">$1</span>');
}

/**
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1464 characters
- Lines: 61
