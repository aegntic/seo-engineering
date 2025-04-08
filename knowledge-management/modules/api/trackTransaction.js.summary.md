# Summary of trackTransaction.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/mongoose/lib/plugins/trackTransaction.js`

## Content Preview
```
'use strict';

const arrayAtomicsSymbol = require('../helpers/symbols').arrayAtomicsSymbol;
const sessionNewDocuments = require('../helpers/symbols').sessionNewDocuments;
const utils = require('../utils');

module.exports = function trackTransaction(schema) {
  schema.pre('save', function trackTransactionPreSave() {
    const session = this.$session();
    if (session == null) {
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 2728 characters
- Lines: 86
