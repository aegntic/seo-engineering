# Summary of borderedText.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/simple-update-notifier/src/borderedText.ts`

## Content Preview
```
const borderedText = (text: string) => {
  const lines = text.split('\n');
  const width = Math.max(...lines.map((l) => l.length));
  const res = [`┌${'─'.repeat(width + 2)}┐`];
  for (const line of lines) {
    res.push(`│ ${line.padEnd(width)} │`);
  }
  res.push(`└${'─'.repeat(width + 2)}┘`);
  return res.join('\n');
};
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 355 characters
- Lines: 13
