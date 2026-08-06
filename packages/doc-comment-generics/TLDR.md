# Doc-Comment TLDR

**What**: Plugin infrastructure for doc-comment metadata extraction

**Purpose**: Enable build-time intelligence through structured comments

**Pattern**:
```typescript
/**
 * @doc-comment-*
 * @field value
 */
```

**Key Concepts**:
- Plugin registry system
- Metadata extraction only (no runtime effects)
- Base classes for creating plugins

**Usage**: Import and extend `BaseDocCommentPlugin`

**Current Plugins**:
- `@doc-comment-developing-promptpartdevelopment`
- `@doc-comment-developing-promptdevelopment`
- `@doc-comment-promptdryrun`