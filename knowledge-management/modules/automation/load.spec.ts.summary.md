# Summary of load.spec.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/src/load.spec.ts`

## Content Preview
```
import { describe, it, expect } from 'vitest';
import { load } from './index.js';

describe('.load', () => {
  it('(html) : should retain original root after creating a new node', () => {
    const $ = load('<body><ul id="fruits"></ul></body>');
    expect($('body')).toHaveLength(1);
    $('<script>');
    expect($('body')).toHaveLength(1);
  });
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 988 characters
- Lines: 32
