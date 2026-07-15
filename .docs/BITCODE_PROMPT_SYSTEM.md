# Bitcode Prompt System Notes

Status: non-canonical internal note.

## Purpose

Prompts, PromptParts, doc-comments, tool descriptions, agent descriptions, phases, and steps form a core Bitcode inference substrate. They are not loose strings.

V26 requires prompt implementations to be:
- local to their package or interface usage where practical,
- composed from raw PromptParts in `packages/prompts`,
- registry-backed through Prompt and execution registries,
- doc-commented with enough precision to prove purpose and implementation fit,
- aligned to Bitcode Read, fit, AssetPack, proof, Finish, and delivery semantics.

## PromptPart Naming

Naming rules:
- `_generic_` PromptParts describe reusable base behavior.
- `_specific_` PromptParts describe concrete implementation owners.
- filenames, constants, doc-comments, and literal content must agree.
- non-Bitcode wording should be repurposed, renamed, or removed.

Compatibility names are temporary implementation corridors only. They should not be copied into new prompt owners.

## Doc-Comment Injection

The doc-comment system remains valuable because build-time prompt/tool descriptions can be derived from code comments.

Required behavior:
- doc-comments must name Bitcode purpose precisely,
- tool prompt descriptions must carry full operational context,
- agents, tools, steps, and phases must expose enough prompt text for auditable agentic runs,
- non-Bitcode labels must not survive as the primary explanation of a prompt.

## Read-Comprehension Pattern

The retained Read-comprehension support package path has V26 meaning only as Read comprehension.

Canonical prompt work should prefer:
- AnalyzeReadSemantics,
- ExtractReadRequirements,
- IdentifyReadConstraints,
- GenerateReadSatisfactionCriteria,
- ValidateReadComprehension,
- AnalyzeReadSatisfactionImplementationComplexity.

## Verification

Prompt reform should be checked with:
- prompt-system proof generation,
- prompt-space completeness proof generation,
- package-local TypeScript checks,
- active product naming tests,
- scans for Read-first, AssetPack-first, Finish-first, and Bitcode-only vocabulary.
