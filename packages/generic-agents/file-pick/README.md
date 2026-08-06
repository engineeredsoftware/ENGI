# File Picker Agent

Intelligent repository file selection agent using heuristic analysis for task-relevant file identification.

## Overview

The File Picker Agent provides smart file selection capabilities through task-context analysis and repository structure understanding. It uses the digest helper system to identify and select the most relevant subset of repository files for specific development tasks, optimizing downstream agent performance.

## Core Capabilities

### 1. Task-Context Analysis
- Prompt parsing and search term extraction with stop-word filtering
- Expected file type detection based on task keywords
- Selection strategy determination through heuristic analysis
- Maximum file count optimization for processing efficiency

### 2. Intelligent File Selection
- Integration with digest helper for relevance-based file picking
- Pattern matching for technical terms and project structures
- File type prioritization based on task requirements
- Duplicate detection and invalid file path filtering

### 3. Quality Assurance and Filtering
- Repository structure validation (excludes node_modules, build artifacts)
- File relevance scoring with confidence measurement
- Selection refinement through multi-pass filtering
- Final optimization with task alignment scoring

### 4. Performance Optimization
- File count limiting to prevent processing overload (12-file default maximum)
- Relevance-based sorting and priority ranking
- Efficient selection algorithms with O(n log n) complexity
- Resource management with graceful degradation fallbacks

## Technical Implementation

### Dependencies
- `@bitcode/agent-generics` - Base agent framework with PTRR methodology
- `zod` - Schema validation for structured outputs
- File system integration for repository structure analysis

### File Type Detection Patterns
Context-based detection:
- `test` → .test.js, .spec.ts, testing utilities
- `config` → configuration files, setup scripts
- `component` → .tsx, .jsx React components
- `api` → .ts, .js API endpoints and services
- `style` → .css, .scss styling files
- `doc` → .md, .txt documentation files

### PTRR Implementation
- **Plan**: Analyzes task prompt and determines file selection strategy
- **Generate**: Executes file picking using digest helper integration
- **Refine**: Filters and validates selected files for quality
- **Intensify**: Optimizes selection for maximum task relevance

## Usage

The agent processes task descriptions to select relevant repository files:

```typescript
const fileSelection = await filePickerAgent.execute(
 "Find authentication components and API handlers for login flow"
);
// Returns: ['src/components/LoginForm.tsx', 'src/api/auth.ts', 'src/hooks/useAuth.ts']
```

## Output Structure

### File Selection Result
```typescript
{
 finalFiles: string[], // Array of selected file paths
 optimizations: string[], // Applied optimization strategies
 relevanceScore: number, // Overall selection relevance (0-1)
 taskAlignment: string // Description of task alignment
}
```

## Selection Strategy

### Search Term Extraction
1. Prompt tokenization with punctuation removal
2. Stop-word filtering (the, and, for, with, this, that)
3. Minimum length filtering (3+ characters)
4. Technical term prioritization and ranking

### Relevance Scoring Algorithm
- File type matching weight: 30%
- Search term presence weight: 40%
- Repository structure context: 20%
- File accessibility and validity: 10%

## Performance Characteristics
- Default maximum files: 12 selected files
- Processing timeout: 60 seconds for generation phase
- Confidence threshold: Minimum 0.3 relevance score
- Quality targets: 80% relevance, 90% efficiency, 70% completeness
- Selection accuracy: >85% task-relevant file identification

## Integration Points
- Provides file list context for downstream processing agents
- Compatible with artifact storage for selection audit trails
- Saves selection results in JSON and plain text formats
- Works with FileTracker for efficient file content access

## Error Handling
- Digest helper failure recovery with fallback selection
- Invalid file path detection and removal
- Empty selection handling with informative error messages
- Graceful degradation when repository structure is unclear
- Comprehensive logging with selection metrics and reasoning

## Filtering Rules

### Inclusion Criteria
- Files relevant to extracted search terms
- Expected file types based on task context
- Repository files with readable content
- Files within reasonable size limits for processing

### Exclusion Criteria
- node_modules directory contents
- Build artifacts (dist/, build/ directories)
- Version control files (.git/ directory)
- Binary files without text content
- Duplicate file paths and invalid references