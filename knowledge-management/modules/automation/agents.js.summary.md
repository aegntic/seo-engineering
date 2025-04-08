# Summary of agents.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/caniuse-lite/dist/unpacker/agents.js`

## Content Preview
```
'use strict'

const browsers = require('./browsers').browsers
const versions = require('./browserVersions').browserVersions
const agentsData = require('../../data/agents')

function unpackBrowserVersions(versionsData) {
  return Object.keys(versionsData).reduce((usage, version) => {
    usage[versions[version]] = versionsData[version]
    return usage
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1439 characters
- Lines: 48
