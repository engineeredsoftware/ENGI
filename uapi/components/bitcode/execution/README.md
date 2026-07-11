# Shared Execution Carriers

This directory holds the reusable execution-level components that power the Bitcode activity ledger, selected-activity detail, explainers, and payload reading.

The V26 second-gate rule for this layer is simple:
- if an activity/detail/payload pattern appears repeatedly across `/terminal`, conversations, or related retained workspaces, it should converge here as a typed, testable carrier.

## Main component groups

- activity-ledger master
  - `BitcodeTransactionsTable.tsx`
  - `BitcodeTransactionsFilterBar.tsx`
  - `BitcodeTransactionsActiveFilters.tsx`
  - `BitcodeTransactionsDataTable.tsx`
  - `BitcodeTransactionsPagination.tsx`
- selected-detail structure
  - `BitcodeDetailRowList.tsx`
  - `BitcodeMetricGrid.tsx`
  - `BitcodeDetailCollection.tsx`
  - `BitcodeDetailPanel.tsx`
  - `BitcodeChipCloud.tsx`
  - `BitcodeActionPillRow.tsx`
- payload reading
  - `BitcodePayloadInspector.tsx`
  - `BitcodePayloadShape.tsx`
  - `BitcodePayloadTree.tsx`
  - `BitcodePayloadRowsCard.tsx`
  - `BitcodePayloadCollectionCard.tsx`
  - `BitcodePayloadDetailCard.tsx`
- help and explainers
  - `BitcodeInlineExplainer.tsx`
  - `bitcode-transaction-explainers.ts`
- activity/log streams
  - `BitcodeExecutionStreamPanel.tsx`
  - `pipeline-execution-log-header.tsx`
  - `pipeline-execution-log.tsx`

## Design goals

- route-owned orchestration, shared presentation carriers
- typed props and predictable field-group shapes
- consistent explainers and payload posture
- stable accessibility and test selectors
- no fallback to raw page-local `<pre>` blocks for important JSON-bearing detail
- markdown/documentation parity with the active activity-detail and payload carriers during second-gate closure

## Reading Pipeline Streams

The execution stream panel is the shared carrier for live Reading pipeline
telemetry. Terminal passes contract-aware state for
`ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`, including
pipeline, phase id, PTRR agent id, PTRR step id, ThricifiedGeneration id,
prompt template id, tool id, output schema, and return type. Collapsed rows must
remain readable without raw JSON; expanded rows may show the full metadata,
including prompt templates, interpolated prompts, raw model responses, parsed
typed outputs, and tool input/output posture.

## Used by

- [../../../app/terminal/README.md](../../../app/terminal/README.md)
- activity detail cards under `uapi/app/terminal/*`
- retained execution/log readers that continue to converge inward during V26
