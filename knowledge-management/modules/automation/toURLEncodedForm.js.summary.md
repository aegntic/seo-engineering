# Summary of toURLEncodedForm.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/axios/lib/helpers/toURLEncodedForm.js`

## Content Preview
```
'use strict';

import utils from '../utils.js';
import toFormData from './toFormData.js';
import platform from '../platform/index.js';

export default function toURLEncodedForm(data, options) {
  return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils.isBuffer(value)) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 548 characters
- Lines: 19
