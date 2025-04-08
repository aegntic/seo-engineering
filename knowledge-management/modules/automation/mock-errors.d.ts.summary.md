# Summary of mock-errors.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/undici/types/mock-errors.d.ts`

## Content Preview
```
import Errors from './errors'

export default MockErrors

declare namespace MockErrors {
  /** The request does not match any registered mock dispatches. */
  export class MockNotMatchedError extends Errors.UndiciError {
    constructor(message?: string);
    name: 'MockNotMatchedError';
    code: 'UND_MOCK_ERR_MOCK_NOT_MATCHED';
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 338 characters
- Lines: 13
