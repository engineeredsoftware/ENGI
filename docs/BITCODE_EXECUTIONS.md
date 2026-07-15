# Bitcode Executions Notes

Status: non-canonical internal note.

## Meaning

An execution is a proof-bearing Bitcode inference run. It may measure a Read, synthesize an AssetPack, deliver a connected-interface written asset, or perform another specified Bitcode action.

Executions are not generic work items. They are source-to-shares procedures with explicit input, phase, state, output, and proof boundaries.

## product Experience

The product execution surface should show:
- source and repository context,
- measured Read and review state,
- fit-review quality rows,
- phase and agent progress,
- validation and readiness decisions,
- saved AssetPack output,
- delivery-mechanism evidence,
- proof and settlement receipts.

## Current Implementation

Current source routes and components include:
- `apps/uapi/app/executions/*`
- `apps/uapi/app/api/executions/*`
- `packages/api/src/routes/shippables.ts`
- `packages/asset-packs-pipelines/domain/*`
- execution history and event readers in `apps/uapi/app/api/executions/history/*`

Storage-edge compatibility names may remain behind explicit translation, but internal docs and SPEC promotion should use Bitcode execution, AssetPack execution, Read measurement, fit review, and Finish.

## Operator Decisions

Operators should be able to:
- accept a measured Read,
- reject a measured Read,
- request remeasurement with feedback,
- review present fit qualities,
- inspect settlement receipts,
- choose or confirm delivery destinations where allowed,
- reread the final AssetPack and delivery evidence.

## Open Reform Requirements

- Replace work-item-first labels with Read-first labels.
- Replace output-object-first labels with AssetPack or written-asset labels.
- Replace pre-Finish labels with Finish and delivery-mechanism labels.
- Keep computer-use hidden unless the server admits it internally for Read measurement.
- Ensure all execution UI reads from the same Exchange activity model as `/packs`.
