# Summary of getDistVersion.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/simple-update-notifier/src/getDistVersion.ts`

## Content Preview
```
import https from 'https';

const getDistVersion = async (packageName: string, distTag: string) => {
  const url = `https://registry.npmjs.org/-/package/${packageName}/dist-tags`;

  return new Promise<string>((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = '';

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 811 characters
- Lines: 30
