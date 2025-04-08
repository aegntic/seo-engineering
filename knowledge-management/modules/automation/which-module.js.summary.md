# Summary of which-module.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/yargs/build/lib/utils/which-module.js`

## Content Preview
```
export default function whichModule(exported) {
    if (typeof require === 'undefined')
        return null;
    for (let i = 0, files = Object.keys(require.cache), mod; i < files.length; i++) {
        mod = require.cache[files[i]];
        if (mod.exports === exported)
            return mod;
    }
    return null;
}
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 321 characters
- Lines: 11
