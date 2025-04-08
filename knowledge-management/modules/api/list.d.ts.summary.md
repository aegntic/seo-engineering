# Summary of list.d.ts
  
## File Path
`/home/tabs/seo-engineering/api/node_modules/side-channel-list/list.d.ts`

## Content Preview
```
type ListNode<T, K> = {
	key: K;
	next: undefined | ListNode<T, K>;
	value: T;
};
type RootNode<T, K> = {
	next: undefined | ListNode<T, K>;
};

export function listGetNode<T, K>(list: RootNode<T, K>, key: ListNode<T, K>['key'], isDelete?: boolean): ListNode<T, K> | undefined;
[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 721 characters
- Lines: 15
