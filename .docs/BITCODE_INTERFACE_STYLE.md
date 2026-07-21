# Bitcode Interface Style Notes

Status: non-canonical internal note.

## Purpose

Bitcode interface style must make source-to-shares state legible and proof-visible.

The UI should distinguish:
- source scope,
- Read measurement,
- Read review,
- Auxillaries readiness,
- fit qualities,
- DataPack contents,
- validation,
- Finish,
- delivery mechanism,
- settlement and proof receipts.

## Component Policy

- Use `apps/uapi/components/bitcode/*` for first-party Bitcode primitives.
- Use shared shadcn wrappers only as low-level UI substrate.
- Keep Packs and Exchange semantics in component names where possible.
- Avoid styling that hides critical execution/proof state behind generic cards.
- Keep compatibility components wrapped by Bitcode naming at their public boundary.

## Visual Requirements

- Proof and settlement state must be scan-readable.
- Disabled or unavailable actions must explain readiness preconditions.
- Fit qualities must be visible where settlement is reviewed.
- Delivery mechanisms must not be confused with DataPack contents.

## Style PR Checklist

- Component names expose Bitcode product meaning.
- Source, Read, fit, DataPack, proof, and settlement states are visible where relevant.
- Styling supports Packs and Exchange comprehension instead of hiding execution state.
- Compatibility component names are wrapped by Bitcode-facing boundaries.
