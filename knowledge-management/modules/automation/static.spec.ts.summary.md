# Summary of static.spec.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/cheerio/src/static.spec.ts`

## Content Preview
```
import { describe, it, expect, beforeEach } from 'vitest';
import { cheerio, food, eleven } from './__fixtures__/fixtures.js';
import { type CheerioAPI } from './index.js';

describe('cheerio', () => {
  describe('.html', () => {
    it('() : should return innerHTML; $.html(obj) should return outerHTML', () => {
      const $div = cheerio(
        'div',
        '<div><span>foo</span><span>bar</span></div>',
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 10967 characters
- Lines: 326
