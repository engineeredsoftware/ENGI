#!/usr/bin/env node
"use strict";
/**
 * APPLY DOC-CODE TRANSFORM - Script to apply doc-code transformations
 *
 * This script processes tool files and applies doc-code transforms
 * to automatically attach DocCodeToolPrompt instances.
 *
 * Usage:
 *   npm run transform        # Transform tools
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const glob_1 = require("glob");
const index_1 = require("../src/index");
async function main() {
    console.log(`[DocCode] Applying doc-code-tool transforms...`);
    // Create the transform
    const transform = (0, index_1.createTransform)();
    const patterns = [
        'packages/generic-tools/**/src/**/*.ts',
        'packages/tools-generics/src/**/*.ts'
    ];
    let transformedCount = 0;
    let processedCount = 0;
    for (const pattern of patterns) {
        const files = await (0, glob_1.glob)(pattern, {
            cwd: (0, path_1.join)(__dirname, '../../..'),
            absolute: true
        });
        console.log(`[DocCode] Found ${files.length} files matching pattern: ${pattern}`);
        for (const filePath of files) {
            // Skip test files
            if (filePath.includes('.test.') || filePath.includes('.spec.')) {
                continue;
            }
            const source = (0, fs_1.readFileSync)(filePath, 'utf-8');
            // Check if file has doc-code-tool annotations
            if (!source.includes('@doc-code-tool')) {
                continue;
            }
            processedCount++;
            // Apply transform
            const transformed = await transform.transform(source, filePath);
            // Only write if changed
            if (transformed !== source) {
                (0, fs_1.writeFileSync)(filePath, transformed);
                console.log(`[DocCode] ✅ Transformed: ${filePath}`);
                transformedCount++;
            }
            else {
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
