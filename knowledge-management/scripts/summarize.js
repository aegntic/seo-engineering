#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const { glob } = require('glob');

async function summarize(content, filePath) {
  // TODO: Replace with actual LLM summarization
  // Current placeholder: first 10 lines + basic metadata
  return `# Summary of ${path.basename(filePath)}
  
## File Path
\`${filePath}\`

## Content Preview
\`\`\`
${content.split('\n').slice(0, 10).join('\n')}
[...truncated...]
\`\`\`

## Key Points
- File type: ${path.extname(filePath)}
- Estimated size: ${content.length} characters
- Lines: ${content.split('\n').length}
`;
}

async function processModule(module) {
  console.log(`Processing module: ${module.name}`);
  console.log(`Include patterns: ${module.includePatterns.join(', ')}`);
  
  // Make patterns absolute relative to project root
  const projectRoot = path.join(__dirname, '../../');
  const absoluteIncludes = module.includePatterns.map(p => path.join(projectRoot, p));
  const absoluteExcludes = (module.excludePatterns || []).map(p => path.join(projectRoot, p));
  
  const files = await glob(absoluteIncludes, {
    ignore: absoluteExcludes,
    nodir: true
  });

  console.log(`Found ${files.length} files to process`);
  console.log('Sample files:', files.slice(0, 3));

  for (const filePath of files) {
    console.log(`Processing: ${filePath}`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const summary = await summarize(content, filePath);
      
      const outputDir = path.join(__dirname, '../modules', module.name);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, 
        `${path.basename(filePath)}.summary.md`);
      
      fs.writeFileSync(outputPath, summary);
      console.log(`Created summary: ${outputPath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
}

async function main() {
  try {
    // Process each module in priority order
    const modules = [...config.modules].sort((a, b) => a.priority - b.priority);
    
    for (const module of modules) {
      await processModule(module);
    }
    
    console.log('Summary generation complete');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
