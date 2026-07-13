# no-write-tools-outside-implementation

> Disallow importing any *write-capable* Bitcode AI tool from code that is **not** part of an
> implementation-phase agent.

## Why?

Our multi-stage pipelines follow the PTRR pattern:

1. **Plan**
2. **Generate** (often exploratory)
3. **Refine / Review**
4. **Implement**  ← *the only stage allowed to mutate the repository*

Steps 1-3 must remain **read-only** so that partial analyses, speculative prompts or refactorings
cannot accidentally change code or external state. The rule enforces that guarantee at *lint* time.

## What counts as a write tool?

See the source for the authoritative list, but in short any tool that:

* edits, creates, deletes or renames files (`textEditorTool`, `deleteFileTool`, …)
* performs repository-wide refactors (`renameSymbolTool`)
* opens PRs, leaves comments, or otherwise mutates remote VCS state
* writes to external infra (e.g. `awsS3PutObjectTool`)

## Where are writes allowed?

Files whose paths match the pattern:

```
**/agents/**/implementation*Agent*
```

…are considered *implementation-phase agents*. Anything else—pipeline steps, utilities, UI
components—**may not** import the tools listed above.

## Usage

1. Ensure `eslint-plugin-bitcode` is installed (present in the monorepo).
2. Enable the rule:

```js
module.exports = {
  plugins: ['bitcode'],
  rules: {
    'bitcode/no-write-tools-outside-implementation': 'error',
  }
};
```

## Example

```ts
// ❌  Raises an ESLint error
import { textEditorTool } from '@bitcode/generic-tools-files-maintaining';

// ✓  Allowed inside an implementation-phase agent
// path: packages/pipelines/asset-pack/src/agents/implementation/asset-pack-synthesize-artifacts-agent.ts
import { textEditorTool } from '@bitcode/generic-tools-files-maintaining';
```

## Tests

`__tests__/noWriteToolsOutsideImplementation.test.ts` contains RuleTester specs verifying:

* valid: implementation agents importing write tools
* valid: non-implementation code importing read-only tools
* invalid: other code importing any write tool – rule reports an error
