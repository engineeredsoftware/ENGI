# Code Refactor Tool Suite

## Overview

Production-grade code refactoring tools providing semantic analysis-driven transformations for repository-wide code improvements. Built on LSP integration with atomic operation guarantees and comprehensive dependency tracking.

## Core Capabilities

### Symbol Management
- Repository-wide symbol renaming with semantic validation
- Cross-file dependency tracking and reference resolution
- Atomic operations with rollback support
- Conflict detection and resolution strategies

### Code Structure Optimization
- Method extraction with automated parameter detection
- Variable inlining with scope analysis
- Symbol relocation between modules
- Import statement organization and optimization

### Semantic Analysis
- LSP server integration for context-aware operations
- TypeScript compiler integration for type safety
- Comprehensive reference validation
- Dependency graph analysis

## Tool Operations

### RenameSymbolTool
**Function**: Repository-wide symbol renaming
**Parameters**: `filePath`, `position`, `newName`, `atomic`, `validateReferences`
**Output**: Rename report with affected files and change counts
**Safety**: Atomic transactions with rollback capability

### ExtractMethodTool
**Function**: Code block extraction to new methods
**Parameters**: `filePath`, `startPosition`, `endPosition`, `methodName`, `insertionPoint`
**Output**: Method extraction report with generated signatures
**Intelligence**: Automatic parameter detection and scope analysis

### OrganizeImportsTool
**Function**: Import statement optimization and cleanup
**Parameters**: `filePath`, `sortStyle`, `removeUnused`, `groupByType`
**Output**: Import organization report with optimization statistics
**Optimization**: Bundle size reduction and dependency cleanup

### InlineVariableTool
**Function**: Variable usage replacement with definitions
**Parameters**: `filePath`, `position`, `validateReferences`, `preserveComments`
**Output**: Inline operation report with replacement metrics
**Validation**: Semantic safety checks and side effect analysis

### MoveSymbolTool
**Function**: Symbol relocation with dependency management
**Parameters**: `sourceFile`, `targetFile`, `symbolName`, `updateImports`
**Output**: Move operation report with dependency resolution status
**Integration**: Automatic import statement updates

## Technical Implementation

### Architecture Pattern
```typescript
class RefactorTool extends Tool<typeof primitiveFunction> {
 use = primitiveFunction;
}
```

### LSP Integration
- Semantic analysis for safe transformations
- Real-time validation of refactoring operations
- Context-aware dependency tracking
- Multi-language support through LSP servers

### Transaction Management
- Atomic operation guarantees
- Comprehensive rollback mechanisms
- Change validation and conflict resolution
- Operation audit trails

### Type Safety
- Full TypeScript integration
- Runtime type validation
- Parameter schema enforcement
- Return type guarantees

## Usage Examples

### Repository-wide Symbol Rename
```typescript
import { renameSymbolTool } from '@bitcode/generic-tools-code-refactor';

const result = await renameSymbolTool.use({
 filePath: '/project/src/utils.ts',
 position: { line: 15, character: 8 },
 newName: 'parseConfiguration',
 atomic: true,
 validateReferences: true
});
```

### Method Extraction
```typescript
import { extractMethodTool } from '@bitcode/generic-tools-code-refactor';

const result = await extractMethodTool.use({
 filePath: '/project/src/service.ts',
 startPosition: { line: 45, character: 0 },
 endPosition: { line: 62, character: 15 },
 methodName: 'validateInput',
 insertionPoint: { line: 35, character: 0 }
});
```

### Import Organization
```typescript
import { organizeImportsTool } from '@bitcode/generic-tools-code-refactor';

const result = await organizeImportsTool.use({
 filePath: '/project/src/index.ts',
 sortStyle: 'alphabetical',
 removeUnused: true,
 groupByType: true
});
```

## Performance Characteristics

### Operation Complexity
- Symbol rename: O(n) where n = symbol references
- Method extraction: O(1) for single method, O(m) for dependencies
- Import organization: O(k) where k = import statements
- Variable inlining: O(r) where r = variable references

### Memory Usage
- Minimal memory footprint through streaming operations
- LSP server connection pooling
- Efficient dependency graph representation
- Garbage collection optimization for large codebases

### Scalability Metrics
- Supports repositories with 100k+ files
- Concurrent operation handling
- Incremental processing for large refactorings
- Background operation queuing

### Error Recovery
- Comprehensive error handling with detailed diagnostics
- Partial operation completion with rollback points
- Validation failure recovery mechanisms
- Operation retry logic with exponential backoff