# @bitcode/doc-comment-generics

> BC alias: `@bitcode/doc-comment`


V26 status: admitted `ingress-or-support` primitive for build-time parsing and metadata extraction.
This package is not a direct Bitcode product or inference-runtime authority by itself, but it may still serve admitted Bitcode build-time prompt injection when explicit corridors such as `@bitcode/doc-code` consume it.
Examples and implementation notes in this corridor are preserved to support careful reform work, not to silently define the active product path.

Pure infrastructure package for doc-comment plugins. This package contains ONLY:
- Plugin interfaces and base classes
- Plugin registry system
- Core types for doc-comment parsing

## NO PLUGIN IMPLEMENTATIONS

This package contains NO plugin implementations. Plugins are located in:
- Their respective packages (co-located)
- Standalone plugin packages

## Core Exports

```typescript
// Base infrastructure
import { 
  BaseDocCommentPlugin,
  DocCommentPlugin,
  DocComment,
  ValidationResult 
} from '@bitcode/doc-comment';

// Plugin registry
import { 
  registerPlugin,
  getPlugin,
  getAllPlugins 
} from '@bitcode/doc-comment';
```

## Creating a Plugin

```typescript
import { BaseDocCommentPlugin, ValidationResult } from '@bitcode/doc-comment';

export class MyPlugin extends BaseDocCommentPlugin<MyMetadata> {
  name = 'doc-myplugin';
  pattern = /@doc-myplugin/;
  
  protected parseMetadata(comment: DocComment): MyMetadata {
    // Parse comment into metadata
  }
  
  protected validateMetadata(metadata: MyMetadata): ValidationResult {
    // Validate the metadata
  }
  
  protected getDefaultMetadata(comment: DocComment): MyMetadata {
    // Return default when parsing fails
  }
}
```

## Plugin Locations

### Doc-Comment Plugins (Metadata only)
- `@bitcode/generic-doc-comment-plugins/doc-developing` - reference-only development metadata and instrumentation plugins
- prompt-package developing/doc-plugin experiments remain internal/reference-only; retained consumers should not treat `packages/prompts/src/*` locations as public API

### Doc-Code Plugins (Runtime injection)
- `@bitcode/tools-generics/src/plugins` - Tool documentation (@doc-code-tool)
- `@bitcode/generic-doc-code-plugins/doc-promptpart` - PromptPart injection (@doc-code-promptpart)

## Philosophy

Infrastructure without implementation. The doc-comment package is the foundation upon which all doc-comment plugins are built, but it contains no opinions about what those plugins do.
Under V26, that also means it does not get to imply live Bitcode product ownership without explicit promotion, package-boundary reform, and proof coverage, even while the base primitive remains available to support explicit Bitcode-owned build-time injection paths.

## Key Distinction: Doc-Comment vs Doc-Code

- **@doc-comment-*** plugins: Build-time metadata extraction only
- **@doc-code-*** plugins: Runtime code injection and transformation

This naming convention makes it immediately clear whether a plugin affects runtime behavior.

## V26 reform note

The examples under `packages/doc-comment-generics/examples/*` are illustrative reference material.
They may describe intricate non-Bitcode tactics for comments-as-prompts, but they are not by themselves proof that the same behavior is admitted on the live Bitcode path.
The admitted use of this package is the base parsing primitive, not the blanket promotion of every non-Bitcode example or plugin.
See `protocol-demonstration/V26_DOC_COMMENT_REFORM.md` for the active reform boundary.
