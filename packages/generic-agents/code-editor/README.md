# Code Editor Agent

Production-grade code editing agent implementing the **Divide|Apply|Correct** pattern for reliable file modifications.

## Overview

The Code Editor Agent provides systematic, transactional code editing with automatic validation and rollback capabilities. It transforms high-level change specifications into precise file edits while maintaining code quality and consistency.

## Core Pattern: Divide|Apply|Correct

### 1. **DIVIDE** (Plan Phase)
- Analyzes required changes across the codebase
- Creates atomic patch plans per file
- Identifies dependencies and execution order
- Estimates complexity and risk

### 2. **APPLY** (Try Phase)
- Executes file edits using `TransactionalFileEditor`
- Maintains transaction boundaries for rollback
- Creates automatic backups before changes
- Tracks success/failure per edit

### 3. **CORRECT** (Refine Phase)
- Validates syntax of modified files
- Identifies and fixes issues
- Applies corrective patches as needed
- Assesses overall code quality

## Usage

```typescript
import { codeEditorAgent } from '@bitcode/generic-agent-code-editor';

// Multi-file editing with Divide|Apply|Correct
const result = await codeEditorAgent({
 changes: [
 {
 filePath: 'src/auth/index.ts',
 patches: [
 {
 description: 'Add JWT validation',
 oldContent: 'function validateToken(token: string)',
 newContent: 'async function validateToken(token: string): Promise<boolean>'
 }
 ]
 }
 ],
 taskDescription: 'Implement JWT validation', // Edit intent supplied from a measured Bitcode Read.
 transactional: true,
 validateSyntax: true
}, execution);

// Simple single-file edit
const result = await codeEditorAgent({
 singleEdit: {
 command: 'str_replace',
 path: 'README.md',
 oldStr: 'old text',
 newStr: 'new text'
 },
 taskDescription: 'Update documentation' // Edit intent supplied from a measured Bitcode Read.
}, execution);
```

## Variations

### `divide-apply-correct`
Full PTRR cycle for complex multi-file edits with validation and correction.

### `simple-edit`
Direct single-file editing for simple changes without the full pattern.

## Integration

The agent uses `TransactionalFileEditor` from `@bitcode/file-editing` for:
- **Transactional Operations**: All edits can be rolled back as a unit
- **File Locking**: Prevents concurrent modifications
- **Automatic Backups**: Creates backups before changes
- **Precise Text Manipulation**: Line/character position-based editing

## Testing

The agent provides comprehensive test support through `@bitcode/testing`:
- Mock file system operations
- Dry-run mode for validation without changes
- Scenario-based testing with expected outcomes
- Transaction rollback testing

## Dependencies

- `@bitcode/agent-generics`: Agent factory and PTRR pattern
- `@bitcode/execution-generics`: Execution context and tool management
- `@bitcode/file-editing`: Transactional file editing primitives
- `@bitcode/prompts`: Prompt management

## Error Handling

All operations are wrapped in transactions with automatic rollback on failure:
- Syntax errors trigger correction attempts
- Failed edits preserve original files
- Transaction IDs enable manual recovery
- Detailed error reporting with file paths and line numbers
