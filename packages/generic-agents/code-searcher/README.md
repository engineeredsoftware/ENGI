# Code Searcher Agent

Advanced RAG-based code analysis agent using LSP semantic search for high-precision code discovery.

## Overview

The Code Searcher Agent provides sophisticated code search capabilities through Language Server Protocol (LSP) integration. It performs semantic analysis to identify relevant code snippets, symbols, and structures across codebases, returning contextual matches with relevance scoring.

## Core Capabilities

### 1. LSP-Powered Semantic Search
- Workspace-wide symbol search for functions, classes, and variables
- Document structure analysis for contextual understanding
- Hover information extraction for enhanced context
- Symbol kind classification (function, class, method, etc.)

### 2. Code Snippet Extraction
- Intelligent snippet boundaries based on code structure
- Multi-line context preservation
- Relevance scoring based on semantic matching
- Reason explanations for each match

### 3. Fallback Strategies
- Text-based search when LSP is unavailable
- Pattern matching for technical terms
- CamelCase and underscore notation detection
- Graceful degradation for non-LSP file types

### 4. Performance Optimization
- Chunked processing for large codebases
- Parallel document analysis
- Result limiting to prevent overload
- Relevance-based sorting and filtering

## Technical Implementation

### Dependencies
- `@bitcode/generic-tools-lsp-query` - LSP tool integration
- `@bitcode/agent-generics` - Base agent framework
- `FileTracker` - File content management
- `zod` - Schema validation

### Supported File Types
Primary support (with LSP):
- JavaScript (.js)
- TypeScript (.ts)
- JSX (.jsx)
- TSX (.tsx)

Fallback support:
- Any text-based code file

### PTRR Implementation
- **Plan**: Analyzes repository structure and identifies search strategy
- **Try**: Executes semantic search using LSP tools
- **Refine**: Assesses search quality and coverage
- **Retry**: Deepens search with additional patterns if needed

## Usage

The agent processes code search requests through semantic analysis:

```typescript
const snippets = await findCodeSnippetsToolEnhanced({
 files: ['src/components/Button.tsx', 'src/utils/helpers.ts'],
 fileTracker: fileTrackerInstance,
 taskDescription: "Find authentication handling code",
 maxSnippets: 20
});
```

## Output Structure

### Code Snippet Result
```typescript
{
 file: string, // Relative file path
 snippet: string, // Extracted code snippet
 startLine: number, // Starting line number
 endLine: number, // Ending line number
 relevance: number, // Relevance score (0-1)
 reason: string // Explanation of match
}
```

## Search Strategy

### Semantic Keyword Extraction
1. CamelCase pattern detection (`getUserData`, `handleClick`)
2. Underscore notation (`user_data`, `handle_click`)
3. Technical term identification (function, class, component, etc.)
4. Minimum length filtering (3-50 characters)

### Relevance Calculation
- Symbol name matching
- Context similarity scoring
- Technical term density
- Code structure alignment

## Performance Characteristics
- Relevance threshold: 0.3 minimum
- Maximum 3 snippets per file
- Result limit: 20 snippets by default
- Average relevance tracking for quality metrics

## Integration Points
- Works with FileTracker for efficient file content access
- Integrates with LSP servers for semantic understanding
- Compatible with discovery phase pipeline architecture
- Provides structured data for downstream agents

## Error Handling
- Graceful LSP failure recovery
- File-level error isolation
- Fallback to text-based search
- Comprehensive error logging with context