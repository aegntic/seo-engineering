# Summary of america.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/@colors/colors/lib/maps/america.js`

## Content Preview
```
module['exports'] = function(colors) {
  return function(letter, i, exploded) {
    if (letter === ' ') return letter;
    switch (i%3) {
      case 0: return colors.red(letter);
      case 1: return colors.white(letter);
      case 2: return colors.blue(letter);
    }
  };
};
[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 278 characters
- Lines: 11
