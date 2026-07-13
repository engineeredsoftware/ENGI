# V26 Doc-Comment Reform

`doc-comment` is one of the clearest examples of why V26 reform cannot be done with blanket renames or indiscriminate promotion.
The retained non-Bitcode implementation is intricate, layered, and tightly coupled to prompt authoring, build-time transformation, and experimental inference tactics.
That intricacy is useful as a reform rope, but it is not itself the live Bitcode product contract.

## V26 status

For V26 fifth-gate and the reopened fourth-gate truth:

- `packages/doc-comment-generics/*` is an admitted `ingress-or-support` primitive for build-time parsing and metadata extraction when explicit Bitcode-owned injection paths consume it.
- `packages/generic-doc-comments/doc-code/*` is an admitted `ingress-or-support` plus `compatibility` corridor for build-time tool prompt injection and attachment of `DocCodeToolPrompt` instances onto tools.
- `packages/tools-generics/src/doc-code-tool/*` is the active runtime bridge that formats and consumes those attached tool prompts during agentic Bitcode runs.
- `packages/generic-doc-comment-plugins/*` is a `reference-only` plugin corridor.
- `packages/prompts/src/developing/*` remains prompt-package internal experimentation, not a public import surface for retained doc-comment consumers.
- `packages/doc-comment-generics/examples/*` may survive as illustrative reference material, but they do not define live Bitcode Exchange, Bitcode Terminal, or admitted inference-runtime behavior.
- generic corridor-by-corridor reform tactics remain governed by `protocol-demonstration/V26_REFORM_STRATEGY.md`.

## Why this corridor needs careful reform

The corridor mixes several distinct concerns that must not be collapsed together:

1. build-time parsing and metadata extraction
2. build-time prompt attachment for tool documentation
3. prompt authoring and promptpart composition
4. tool and agent documentation conventions
5. development-only profiling, dry-run, and benchmarking plugins

V26 keeps those concerns legible instead of pretending they are already one admitted Bitcode runtime.

## Reform tactics

The required tactics for this corridor are:

1. keep the base `doc-comment` abstraction as a clean parsing primitive where Bitcode still benefits from it;
2. keep `doc-code` explicit as the bounded build-time injection corridor for `@doc-code-tool` prompt attachment rather than burying that behavior in ad hoc package-local conventions;
3. keep prompt ownership on the public `@bitcode/prompts` contract rather than letting doc-comment or plugin documentation imply prompt-package internal imports are public API;
4. keep development-only plugins clearly marked as non-production, non-admitted, and non-authoritative for live Bitcode semantics;
5. require any future promotion of agent, step, phase, or other non-tool doc-comment behavior into Bitcode to move through explicit public package boundaries, product ownership, and proof families rather than through README implication alone.

## Current admissible use

The currently admissible V26 use of this corridor is:

- build-time parsing of doc-comment metadata through `packages/doc-comment-generics/*`,
- build-time attachment of `DocCodeToolPrompt` instances through `packages/generic-doc-comments/doc-code/*`,
- runtime consumption of those attached tool prompts through `packages/tools-generics/src/doc-code-tool/*` while the prompt/doc-code carriers remain loadable without pulling the full execution storage/logging stack and while their support primitives resolve through honest public package subpaths rather than repo-relative cross-package imports,
- reading non-Bitcode implementation ideas,
- preserving examples that explain how prompt-bearing metadata once composed,
- and supporting careful reform analysis.

It is not admissible to use this corridor as silent authority for:

- live Exchange/Terminal semantics,
- active MCP/runtime behavior,
- or production inference ownership outside the explicit admitted build-time tool prompt path above.

## Verification posture

This supplement is expected to stay synchronized with:

- `BITCODE_SPEC_V26.md`
- `BITCODE_SPEC_V26_PARITY_MATRIX.md`
- `protocol-demonstration/V26_TERMINAL_SYSTEMS.md`
- `protocol-demonstration/V26_PROMPT_SURFACES.md`
- `packages/generic-doc-comments/doc-code/tsconfig.typecheck.json`
- `packages/{execution-generics,registry,doc-comment,doc-code,tools-generics}/package.json`
- `protocol-demonstration/test/v26-doc-comment-reform.test.js`
- `protocol-demonstration/test/v26-prompt-runtime-loadability.test.js`
- `.bitcode/prompt-system-totality-proof.json`
