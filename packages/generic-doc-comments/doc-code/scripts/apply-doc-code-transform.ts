#!/usr/bin/env node
/**
 * APPLY DOC-CODE TRANSFORM - Script to apply doc-code transformations
 * 
 * This script processes tool files and applies doc-code transforms
 * to automatically attach DocCodeToolPrompt instances.
 * 
 * Usage:
 *   npm run transform        # Transform tools
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import { createTransform } from '../src/index';

async function main() {
  console.log(`[DocCode] Applying doc-code-tool transforms...`);
  
  // Create the transform
  const transform = createTransform();
  
  const patterns = [
    'packages/generic-tools/**/src/**/*.ts',
    'packages/tools-generics/src/**/*.ts'
  ];
  
  let transformedCount = 0;
  let processedCount = 0;
  
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: join(__dirname, '../../..'),
      absolute: true
    });
    
    console.log(`[DocCode] Found ${files.length} files matching pattern: ${pattern}`);
    
    for (const filePath of files) {
      // Skip test files
      if (filePath.includes('.test.') || filePath.includes('.spec.')) {
        continue;
      }
      
      const source = readFileSync(filePath, 'utf-8');
      
      // Check if file has doc-code-tool annotations
      if (!source.includes('@doc-code-tool')) {
        continue;
      }
      
      processedCount++;
      
      // Apply transform
      const transformed = await transform.transform(source, filePath);
      
      // Only write if changed
      if (transformed !== source) {
        writeFileSync(filePath, transformed);
        console.log(`[DocCode] ✅ Transformed: ${filePath}`);
        transformedCount++;
      } else {
        console.log(`[DocCode] ⏭️  No changes: ${filePath}`);
      }
    }
  }
  
  console.log(`[DocCode] Transform complete. Processed ${processedCount} files, transformed ${transformedCount} files.`);
}

main().catch(err => {
  console.error('[DocCode] Transform failed:', err);
  process.exit(1);
});