# Read Comprehension Tools

## Active Posture

`@bitcode/generic-tools-read-comprehension` is the canonical generic-tool package for Bitcode Read comprehension.
The package path and package name are canonical Bitcode tool owners.
Bitcode does not have tasks as canonical product semantics.
Pre-reform tool, prompt, primitive, and schema owner files are removed after their read-first owners exist; the raw PromptPart families for this package are also read-first.

This package must not define an independent non-Read product model.
It is a prompt-bearing callable tool reservoir, not the setup-phase agent.
It accelerates Bitcode inference by mapping every public tool owner onto canonical concepts:

- `read`: the expressed target the Bitcode run must satisfy.
- `written asset`: a source-bearing or third-party-facing artifact synthesized from the run.
- `asset pack`: the Bitcode-owned structure that groups stable output and evidence.
- `delivery mechanism`: a connected-interface transport such as a pull request.
- `read satisfaction criteria`: measurable acceptance and verification conditions.
- `source-to-shares service questions`: the why/how/when/where/what/who/audit questions that prove the code serves customer-facing Bitcode market infrastructure.

The package remains integrated with Bitcode's prompt primitives architecture through `DocCodeToolPrompt`, `PromptPart`, and raw promptparts exposed through the public `@bitcode/prompts/raw_promptparts/*` boundary.
This package source is TypeScript-only; generated JavaScript artifacts must be emitted outside `src/` by the build system and must never become specification or proof evidence for this corridor.

Canonical code owners now live in individually defined tool files: `AnalyzeReadSemanticsTool`, `ExtractReadRequirementsTool`, `IdentifyReadConstraintsTool`, `GenerateReadSatisfactionCriteriaTool`, `ValidateReadComprehensionTool`, and `AnalyzeReadSatisfactionImplementationComplexityTool`.
`ReadComprehensionToolset` is only the collection surface used by agents and registries.
Pure behavior and validation remain in `read-comprehension-primitives` and `read-comprehension-schemas`.

The PTRR agent that composes these tools during setup lives in `@bitcode/generic-agents-read-comprehension`.
That agent runs before `@bitcode/generic-agents-danger-wall`, emits the reviewable Read model, and passes risk-admission inputs downstream.

## Tool Surfaces

### `analyzeReadSemanticsTool`

Accepts an expressed read and optional context.
Expected output includes:

- `read.expressed_read`
- `read.primary_intent`
- `semantic_analysis.scope_boundaries`
- `written_asset_expectations`
- `source_to_shares_service_questions`
- `service_accountability`
- `asset_pack_context`
- `delivery_mechanism_boundaries`

### `extractReadRequirementsTool`

Extracts explicit and implied requirements from the expressed read and semantic analysis.
Requirements must identify whether they constrain stable written assets, proof evidence, product interfaces, persistence, or delivery mechanisms.

Expected output includes:

- `read_requirements`
- `functional_requirements`
- `non_functional_requirements`
- `proof_requirements`
- `service_requirements`
- `interface_requirements`
- `written_asset_requirement_map`
- `extraction_metadata`

### `identifyReadConstraintsTool`

Identifies constraints that govern read satisfaction.
The tool must distinguish repository/package constraints from connected-interface delivery-mechanism constraints.

Expected output includes:

- `technical_constraints`
- `business_constraints`
- `proof_constraints`
- `interface_constraints`
- `constraint_analysis`

### `generateReadSatisfactionCriteriaTool`

Generates measurable criteria for when written assets and their evidence satisfy the expressed read.
Criteria should be blocking only when the run cannot safely close Finish without them.

Expected output includes:

- `read_satisfaction_criteria`
- `functional_criteria`
- `performance_criteria`
- `quality_criteria`
- `proof_criteria`
- `service_accountability_criteria`
- `persistence_criteria`
- `interface_criteria`
- `blocking_criteria`

### `validateReadComprehensionTool`

Validates the Read model and confirms that written assets, proof obligations, and delivery-mechanism boundaries cohere.
This tool should flag noncanonical labels when they are treated as product semantics.

Expected output includes:

- `validation_results`
- `validation_details`
- `terminology_findings`
- `service_accountability_findings`
- `read_comprehension`
- `written_asset_coherence`
- `proof_coverage`
- `recommendations`
- `validation_passed`

### `analyzeReadSatisfactionImplementationComplexityTool`

Assesses implementation effort for satisfying a read through asset-pack written-asset synthesis.
It must include proof and delivery-mechanism effort rather than limiting complexity to code changes.

Expected output includes:

- `read_comprehension`
- `complexity_assessment`
- `risk_analysis`
- `strategic_insights`
- `implementation_recommendations`

Every canonical tool result should remain answerable to the same commercial service question:
why, how, when, where, what, and who does this code serve in Bitcode's source-to-shares system for an Advanced Engineered Software, Inc. customer, and what evidence makes that answer auditable?

## Example

```typescript
import {
 analyzeReadSemanticsTool,
 AnalyzeReadSemanticsTool
} from '@bitcode/generic-tools-read-comprehension';

const semantics = await analyzeReadSemanticsTool.use({
 expressed_read: 'Fix the OAuth redirect regression and open a pull request',
 context_information: {
 repository_type: 'Next.js application',
 technology_stack: ['Next.js', 'Supabase'],
 existing_attachments: ['failed-login-trace.txt']
 }
});

console.log(semantics.read.expressed_read);
console.log(semantics.written_asset_expectations);
console.log(semantics.delivery_mechanism_boundaries);
console.log(semantics.source_to_shares_service_questions.why);
```

## Prompt Requirements

The DocCode prompt classes in `src/prompts/*` must use the public prompt boundary and must keep `metadata:category` set to `read-comprehension`.
Canonical prompt owners now live in `AnalyzeReadSemanticsDocCodeToolPrompt`, `ExtractReadRequirementsDocCodeToolPrompt`, `IdentifyReadConstraintsDocCodeToolPrompt`, `GenerateReadSatisfactionCriteriaDocCodeToolPrompt`, `ValidateReadComprehensionDocCodeToolPrompt`, and `AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt`.
The prompt barrel exports only canonical read-first owners.
Canonical code owners mirror that posture: the read-first tool files, `ReadComprehensionToolset`, `read-comprehension-primitives`, and `read-comprehension-schemas` stay local to the package.

The raw promptpart files under `packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_*` must use read-first filenames and constants and their content must describe:

- expressed read analysis
- written-asset expectations
- asset-pack context
- delivery-mechanism boundaries
- source-to-shares service questions
- commercial accountability evidence
- proof and verification criteria

The matching JavaScript raw promptpart files must carry the same literal content as the TypeScript sources so runtime imports cannot serve stale pre-Bitcode prompt text.

## Non-Goals

This package does not make pre-reform task semantics canonical.
It does not retain noncanonical tool, prompt, primitive, or schema exports after read-first owners exist.
It does not promote generic tooling into an agent or live Exchange/Terminal product path by itself.
Agent promotion requires `@bitcode/generic-agents-read-comprehension`, explicit V26 proof coverage, package-boundary hardening, and product-surface integration in the active specification family.
