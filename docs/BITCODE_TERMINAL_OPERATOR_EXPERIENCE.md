# Bitcode Terminal Operator Experience Notes

Status: non-canonical internal note. Use this as scratch material for later V26 SPEC promotion.

## Product Thesis

Bitcode Terminal lets an operator move from source to shares without leaving the Bitcode state model.

The operator supplies or selects:
- repository/source context,
- attachments and external evidence,
- natural-language Read or Deposit intent,
- wallet/readiness posture,
- desired delivery destination,
- review decisions during Read and fit boundaries.

Bitcode returns:
- a measured Read,
- fit-quality evidence,
- AssetPack outputs or partials,
- proof and settlement receipts,
- delivery-mechanism evidence,
- rereadable Exchange activity.

## Primary Journey

1. Connect identity, wallet, provider, repository, and output destination.
2. Describe a Read or Deposit posture.
3. Let Bitcode measure the Read using source, attachments, static analysis, prompt systems, tools, and admitted research evidence.
4. Review the measured Read.
5. Accept, reject, or remeasure with feedback.
6. Review candidate fit qualities.
7. Let Bitcode synthesize the AssetPack.
8. Inspect validation and proof receipts.
9. Finish by saving and delivering the result through the selected mechanism.
10. Reread the activity from Terminal, Exchange, API, MCP, or admitted connected interfaces.

## UX Requirements

The Terminal must make these boundaries visible:
- repository/source scope,
- Read measurement evidence,
- Read review decision,
- present-fit-for-settlement-review qualities,
- validation and readiness status,
- AssetPack contents,
- settlement receipt references,
- delivery destination and result.

Do not present removed compatibility controls as product features. V26 cuts public orchestration selection and public computer-use controls from the operator flow.

## Language Requirements

Use:
- operator, depositor, reader, producer,
- Read, Deposit, source, fit, shares,
- AssetPack, AssetPack partial, connected-interface written asset,
- Finish, delivery mechanism, settlement evidence,
- Bitcode Terminal, Bitcode Exchange, Bitcode Protocol.

Avoid in product copy:
- generic work-item framing,
- generic output-object framing,
- pre-Finish final-phase labels,
- removed orchestration controls,
- public compute controls,
- old brand or old platform posture.

## SPEC Promotion Obligations

Promote only statements that are implemented or accepted as V26 requirements:
- Read review before fit search,
- fit-quality rows visible before settlement,
- one Exchange activity ledger,
- Terminal reread after writes,
- AssetPack output semantics,
- server-owned readiness and fail-closed route behavior.
