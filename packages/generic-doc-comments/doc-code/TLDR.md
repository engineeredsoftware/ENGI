# Doc-Code TLDR

**V26 status**: Admitted support corridor for build-time tool prompt attachment

**What**: Build-time prompt injection via webpack loader

**Pattern**:
```typescript
/**
 * @doc-code-tool
 * @prompt MY_TOOL_PROMPT
 */
class MyTool extends Tool { }
```

**Result**: `myTool.__docCodePrompt = MY_TOOL_PROMPT;` and `myTool.__promptParts = MY_TOOL_PROMPT;`

**Usage**: Automatic during webpack build - no manual steps

**Current State**: Working for 28/53 tools that have correct pattern
