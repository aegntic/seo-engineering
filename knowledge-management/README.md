# Knowledge Management System

This system manages project knowledge for AI assistance, addressing Claude's capacity limits through modular organization and summarization.

## Architecture

```
knowledge-management/
├── config.json         # Module definitions and settings
├── modules/           # Generated summaries by module
├── scripts/
│   └── summarize.js   # File processing and summarization
└── README.md          # This documentation
```

## Configuration

Edit `config.json` to:
- Define modules and their file patterns
- Set chunking and summarization parameters
- Configure vector database settings

Example module definition:
```json
{
  "name": "api",
  "description": "API endpoints and controllers",
  "includePatterns": ["api/**/*.js"],
  "excludePatterns": ["**/tests/**"]
}
```

## Usage

1. Install dependencies:
```bash
npm install glob
```

2. Run summarization:
```bash
node scripts/summarize.js
```

3. Expected output:
```
Processing module: api
Created summary: modules/api/server.js.summary.md
...
Summary generation complete
```

## Future Enhancements

- [ ] Integrate with LLM for actual summarization
- [ ] Add vector embedding generation
- [ ] Implement Weaviate/Pinecone integration
- [ ] Create retrieval-augmented query system

## Dependencies

- Node.js 16+
- `glob` package for file pattern matching
- (Future) Vector database client
