# Refactoring - Production-Grade Code Refactoring System

## Overview

Lightweight code refactoring system providing atomic symbol renaming with LSP integration, transaction support, and comprehensive error handling. Built for production environments with rollback capabilities and multi-file operation support.

## Core Functionality

### Symbol Renaming
- **LSP Integration**: Language Server Protocol integration for accurate symbol resolution
- **Multi-File Operations**: Atomic renaming across entire codebase
- **Backup Management**: Automatic backup creation before modifications
- **Rollback Support**: Complete operation rollback on failure

### Atomic Operations
- **Transaction Safety**: All operations are atomic with commit/rollback capability
- **File Locking**: Prevents concurrent modifications during operations
- **Progress Tracking**: Detailed operation progress and statistics
- **Error Recovery**: Comprehensive error handling with automatic cleanup

### Language Support
- **Universal LSP**: Works with any language that supports LSP
- **TypeScript**: Full TypeScript symbol renaming support
- **JavaScript**: JavaScript and JSX refactoring capabilities
- **Multi-Language**: Cross-language symbol resolution and renaming

### Advanced Capabilities
- **Scope Analysis**: Accurate symbol scope detection and validation
- **Reference Tracking**: Complete reference tracking across files
- **Import Updates**: Automatic import/export statement updates
- **Documentation Updates**: Symbol reference updates in comments and docs

## API Reference

### Symbol Renaming
```typescript
import { renameSymbol, RenameSymbolParams } from '@bitcode/refactoring';

// Rename symbol with position hint
const result = await renameSymbol({
  symbolName: 'oldFunctionName',
  newName: 'newFunctionName',
  filePath: '/project/src/utils/helpers.ts',
  line: 15,
  character: 10
});

console.log('Refactoring completed:', {
  filesChanged: result.filesChanged,
  totalEdits: result.totalEdits,
  operationId: result.operationId,
  backupCreated: result.backupCreated
});
```

### Parameter Validation
```typescript
import { renameSymbolParamsSchema } from '@bitcode/refactoring';

// Validate parameters before operation
const params = {
  symbolName: 'ComponentName',
  newName: 'UpdatedComponentName',
  filePath: '/project/src/components/Component.tsx',
  line: 0,
  character: 15
};

// Schema validation ensures type safety
const validatedParams = renameSymbolParamsSchema.parse(params);

// Execute with validated parameters
const result = await renameSymbol(validatedParams);
```

### Error Handling
```typescript
import { renameSymbol, LspError } from '@bitcode/refactoring';

try {
  const result = await renameSymbol({
    symbolName: 'myVariable',
    newName: 'myRenamedVariable',
    filePath: '/project/src/index.ts',
    line: 5,
    character: 6
  });

  console.log(`Successfully renamed symbol in ${result.filesChanged} files`);
  
} catch (error) {
  if (error instanceof LspError) {
    console.error('LSP error:', error.message);
    console.error('LSP details:', error.details);
  } else {
    console.error('Refactoring failed:', error.message);
  }
  
  // All changes are automatically rolled back on error
}
```

### Batch Operations
```typescript
// Sequential symbol renaming with error isolation
const symbols = [
  { old: 'getUserData', new: 'fetchUserData', file: 'api.ts', line: 10, char: 0 },
  { old: 'UserInfo', new: 'UserProfile', file: 'types.ts', line: 5, char: 0 },
  { old: 'validateUser', new: 'validateUserProfile', file: 'validation.ts', line: 20, char: 0 }
];

const results = [];
for (const symbol of symbols) {
  try {
    const result = await renameSymbol({
      symbolName: symbol.old,
      newName: symbol.new,
      filePath: `/project/src/${symbol.file}`,
      line: symbol.line,
      character: symbol.char
    });
    results.push({ ...symbol, success: true, ...result });
  } catch (error) {
    results.push({ ...symbol, success: false, error: error.message });
  }
}

// Report batch operation results
console.log('Batch refactoring completed:', results);
```

## Performance Characteristics

### LSP Integration
- **Persistent Connection**: Maintains persistent LSP server connections
- **Request Optimization**: Efficient LSP request batching and caching
- **Server Management**: Automatic LSP server lifecycle management
- **Protocol Efficiency**: Optimized LSP protocol usage for performance

### File Operations
- **Atomic Writes**: All file modifications are atomic using temporary files
- **Backup Strategy**: Efficient backup creation with minimal storage overhead
- **Concurrent Safety**: Thread-safe operations with file locking
- **Memory Management**: Optimized memory usage for large codebases

### Error Recovery
- **Automatic Rollback**: Failed operations trigger complete rollback
- **Partial Recovery**: Recovery from partial operation failures
- **State Consistency**: Maintains consistent file system state
- **Resource Cleanup**: Automatic cleanup of temporary files and resources

### Scalability
- **Large Codebases**: Efficient handling of multi-thousand file projects
- **Memory Optimization**: Streaming file processing for large files
- **Progress Reporting**: Real-time progress updates for long operations
- **Operation Batching**: Efficient batching of multiple edit operations

## Security Features

### Input Validation
- **Parameter Validation**: Comprehensive input validation with Zod schemas
- **Path Security**: Secure file path handling and validation
- **Symbol Validation**: Symbol name validation and sanitization
- **Position Validation**: Line and character position boundary checking

### File System Security
- **Permission Checking**: Respects file system permissions
- **Backup Protection**: Secure backup file creation and management
- **Atomic Operations**: Prevents partial file corruption
- **Access Control**: Integration with system access controls

### Error Information
- **Sanitized Errors**: Error messages sanitized for security
- **Audit Logging**: Comprehensive operation logging for security audits
- **Operation Tracking**: Complete operation history with attribution
- **Resource Monitoring**: Resource usage monitoring and limits

## Integration Features

### LSP Server Integration
- **Multi-Language Support**: Works with TypeScript, JavaScript, Python, Go, etc.
- **Server Discovery**: Automatic LSP server discovery and configuration
- **Protocol Compliance**: Full LSP protocol compliance for maximum compatibility
- **Custom Servers**: Support for custom LSP server configurations

### Development Environment
- **IDE Integration**: Compatible with VS Code, Vim, Emacs, and other LSP clients
- **Build System**: Integration with build systems and watch modes
- **Version Control**: Git-aware operations with conflict detection
- **Linting Integration**: Automatic linting after refactoring operations

### Monitoring and Observability
- **Operation Metrics**: Detailed metrics for operation performance
- **Success Tracking**: Success/failure rates and error categorization
- **Performance Profiling**: Operation profiling and optimization insights
- **Resource Usage**: Memory and CPU usage monitoring

## Advanced Features

### Symbol Resolution
- **Cross-Reference Analysis**: Complete symbol reference analysis
- **Scope Detection**: Accurate symbol scope and visibility detection
- **Import Resolution**: Automatic import/export statement handling
- **Type Preservation**: Maintains type information during renaming

### Code Analysis
- **Dependency Tracking**: Tracks symbol dependencies across files
- **Usage Analysis**: Analyzes symbol usage patterns and frequency
- **Impact Assessment**: Assesses refactoring impact before execution
- **Conflict Detection**: Detects naming conflicts before renaming

### Quality Assurance
- **Pre-Flight Checks**: Validates refactoring safety before execution
- **Post-Operation Validation**: Validates code integrity after refactoring
- **Backup Verification**: Verifies backup completeness and integrity
- **Rollback Testing**: Tests rollback capability before operations

## Error Handling

### Comprehensive Error Types
- **LSP Errors**: Language server communication and response errors
- **File System Errors**: File access, permission, and I/O errors
- **Validation Errors**: Parameter and symbol validation errors
- **Operation Errors**: Refactoring operation and conflict errors

### Recovery Strategies
- **Automatic Retry**: Intelligent retry for transient failures
- **Partial Recovery**: Recovery strategies for partially completed operations
- **Manual Intervention**: Clear guidance for manual recovery when needed
- **State Restoration**: Complete state restoration from backups

### Logging and Diagnostics
- **Structured Logging**: Comprehensive structured logging for debugging
- **Operation Context**: Full context preservation for error analysis
- **Performance Diagnostics**: Performance issue detection and reporting
- **Debug Information**: Detailed debug information for troubleshooting