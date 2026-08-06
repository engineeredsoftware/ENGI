# Bitcode Auxillaries Readiness Notes

Status: non-canonical internal note.

## Purpose

Auxillaries hold the operator readiness state required before Bitcode can transact or settle.

Core panes:
- `AuxillariesProfilePane`,
- `AuxillariesConnectsPane`,
- `AuxillariesInterfacesPane`,
- `AuxillariesBTDPane`.

Core state:
- `completedPanes`,
- `currentPane`,
- wallet/readiness posture,
- provider/repository bindings,
- interface/delivery destinations,
- `$BTD` and settlement readiness.

## Rules

- Manual identity can support drafting and reread.
- Signed settlement requires verified wallet-provider signing access.
- Repository scope must be explicit.
- Connected-interface writes require admission receipts.
- Compatibility fields such as `completedStep` should converge to pane/readiness vocabulary.

