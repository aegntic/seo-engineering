# Summary of process-argv.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/process-argv.js`

## Content Preview
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcessArgvBin = exports.getProcessArgvWithoutBin = void 0;
function getProcessArgvBinIndex() {
    // The binary name is the first command line argument for:
    // - bundled Electron apps: bin argv1 argv2 ... argvn
    if (isBundledElectronApp())
        return 0;
    // or the second one (default) for:
    // - standard node apps: node bin.js argv1 argv2 ... argvn
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1382 characters
- Lines: 32
