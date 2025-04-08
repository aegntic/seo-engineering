# Summary of tree.js
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/pstree.remy/lib/tree.js`

## Content Preview
```
const spawn = require('child_process').spawn;

module.exports = function (rootPid, callback) {
  const pidsOfInterest = new Set([parseInt(rootPid, 10)]);
  var output = '';

  // *nix
  const ps = spawn('ps', ['-A', '-o', 'ppid,pid']);
  ps.stdout.on('data', (data) => {
    output += data.toString('ascii');
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 857 characters
- Lines: 38
