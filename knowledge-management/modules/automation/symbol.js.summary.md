# Summary of symbol.js
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/loupe/lib/symbol.js`

## Content Preview
```
export default function inspectSymbol(value) {
  if ('description' in Symbol.prototype) {
    return value.description ? `Symbol(${value.description})` : 'Symbol()'
  }
  return value.toString()
}

[...truncated...]
```

## Key Points
- File type: .js
- Estimated size: 197 characters
- Lines: 7
