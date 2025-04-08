# Summary of dirs.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/commondir/test/dirs.js`

## Content Preview
```
var test = require('tape');
var commondir = require('../');

test('common', function (t) {
    t.equal(
        commondir([ '/foo', '//foo/bar', '/foo//bar/baz' ]),
        '/foo'
    );
    t.equal(
        commondir([ '/a/b/c', '/a/b', '/a/b/c/d/e' ]),
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 1365 characters
- Lines: 56
