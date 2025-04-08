# Summary of OAuth.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/stripe/types/OAuth.d.ts`

## Content Preview
```
declare module 'stripe' {
  namespace Stripe {
    interface OAuthToken {
      /**
       * The access token you can use to make requests on behalf of this Stripe account. Use it as you would any Stripe secret API key.
       * This key does not expire, but may be revoked by the user at any time (you'll get a account.application.deauthorized webhook event when this happens).
       */
      access_token?: string;

      /**
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 13052 characters
- Lines: 356
