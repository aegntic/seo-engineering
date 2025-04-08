# Summary of ecdsa-sig-formatter.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.d.ts`

## Content Preview
```
/// <reference types="node" />

declare module "ecdsa-sig-formatter" {
	/**
	 * Convert the ASN.1/DER encoded signature to a JOSE-style concatenated signature. Returns a base64 url encoded String.
	 *    If signature is a String, it should be base64 encoded
	 *    alg must be one of ES256, ES384 or ES512
	 */
	export function derToJose(signature: Buffer | string, alg: string): string;

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 694 characters
- Lines: 18
