# Bitcode Read Comprehension Agent

## Active Boundary

`@bitcode/generic-agents-read-comprehension` is the PTRR agent owner for Bitcode setup-phase Read comprehension.
It composes the callable tools from `@bitcode/generic-tools-read-comprehension`; it does not redefine those tool contracts.

The package exists because Read comprehension is agentic phase work, not a generic-tool package by itself.
Its canonical fifth-gate role is `setup` / `pre-danger-wall`: synthesize a reviewable, source-bearing Read model before Bitcode risk admission decides whether the run can continue.

## Encapsulation

- `packages/generic-tools/read-comprehension` owns DocCode tool prompts, callable tool classes, pure primitives, and schemas.
- `packages/generic-agents/read-comprehension` owns the PTRR orchestration prompt, step prompts, input/output schema, and tool composition.
- `packages/pipelines/asset-pack` keeps only a pipeline-local adapter that stores setup-phase results under Bitcode Read and written-asset fields.
- `packages/generic-agents/danger-wall` remains the next setup-phase agent and consumes the Read-comprehension output for risk admission.

## Agent Contract

`bitcodeSetupReadComprehensionAgent`:

- Plans how to understand the expressed Read, attachments, repository context, AssetPack expectation, proof reads, delivery-mechanism boundary, and source-to-shares service questions.
- Uses Read-comprehension tools to analyze semantics, extract requirements, identify constraints, generate satisfaction criteria, validate the model, and estimate implementation complexity.
- Refines ambiguity before risk admission rather than allowing danger-wall to infer canonical Read meaning.
- Emits active Bitcode fields: `read`, `writtenAssetTypes`, `assetPackContext`, `deliveryMechanismBoundaries`, `sourceToSharesServiceQuestions`, `serviceAccountability`, and `readSatisfactionCriteria`.

## Verification

The active V26 proof family checks this package through:

- `protocol-demonstration/test/v26-read-comprehension-reform.test.js`
- `protocol-demonstration/test/v26-prompt-system-boundary.test.js`
- `protocol-demonstration/test/v26-inference-implementation-records.test.js`
- `.proofs/_shared/inference-implementation-records-proof.json`
- `.proofs/_shared/prompt-space-completeness-proof.json`
