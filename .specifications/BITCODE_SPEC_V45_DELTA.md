# Bitcode Spec V45 Delta

## Status

- Version: `V45`
- V45 state: canonical promotion complete; this delta records the promoted V44-to-V45 knowledge commoditization closure set
- Current canonical/latest target: `V45`
- Canonical proof-source commit: `23294cc578dcb2148a6b602c3463b3ca01f1fef1`
- Prior canonical anchor: `BITCODE_SPEC_V44.md`
- Prior generated proof appendix: `BITCODE_SPEC_V44_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v45-spec-family-report.json`, `.bitcode/v45-canonical-input-report.json`, `.bitcode/v45-canon-posture-drift-report.json`, all nine V45 proof-family artifacts, `.bitcode/v45-source-safe-e2e-rehearsal.json`, `.bitcode/v45-promotion-readiness-report.json`, V45 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V45_PROVEN.md` as the generated proof appendix for V45 promotion
- Source parity state: V45 source-side AssetPack commodity lifecycle, BTD scalar-volume, BTC settlement, interface disclosure, proof readback, source-safe rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V45 file family
- Notes companion: `BITCODE_SPEC_V45_NOTES.md`
- Spec companion: `BITCODE_SPEC_V45.md`
- Parity companion: `BITCODE_SPEC_V45_PARITY_MATRIX.md`
- Scope: V45 canonical delta for knowledge commoditization protocol precision over promoted V44 scaled engineering economy canon
- Last fully realized canonical target preserved in source: `V45`

## Why V45 exists

V44 made the scaled engineering economy operable. V45 exists to make the
underlying market law precise enough for public protocol comprehension and
implementation parity: Bitcode as knowledge commoditization, AssetPack as the
commodity, BTD as Need-relative scalar knowledge-volume and settled rights, BTC
as settlement money, source-safe interface disclosure, proof-backed state
readback, and gate taxonomy.

## Accepted V45 decisions

- Bitcode is the knowledge commoditization protocol and commercial system.
- AssetPack is the traded commodity; raw source and raw inference artifacts are
  not the commodity.
- Deposit-time measurements may show BTD potential, but final BTD size is
  Need-relative and requires reviewed Need, selected Fit set, synthesized
  Need-Fit AssetPack, deterministic weights, dedupe, and proof roots.
- Settled BTD carries rights, source unlock authority, ownership boundaries,
  and source-to-shares allocation context.
- BTC quote, payment observation, finality, settlement, rights transfer,
  source unlock, delivery, and compensation are distinct states.
- Interfaces are protocol windows; proof-backed readback advances state.
- Notes atoms precede formal specification, formal specification precedes
  parity audit, parity audit precedes grouped implementation, and promotion
  alone may update `BITCODE_SPEC.txt`.

## Explicitly deferred

- Implementation parity audit, grouped implementation changes, proof-only,
  interface-only, rehearsal, and promotion gates are closed by the promoted V45
  file family and generated artifacts.
- Value-bearing mainnet operation remains deferred.
- `BITCODE_SPEC.txt` points to `V45` after promotion workflow validation.

## Accepted Pre-Implementation Sequence

1. Accepted notes-specification atoms for protocol identity, AssetPack lifecycle,
   BTD scalar-volume, BTC settlement, interface authority, proof readback, and
   gate taxonomy.
2. Consolidated the formal V45 specification family.
3. Audited implementation parity from `BITCODE_SPEC_V45.md`.
4. Grouped implementation gates by parity gaps.
5. Hardened proof-only and interface-only rows.
6. Rehearsed end-to-end source-safe commercial behavior.
7. Closed promotion readiness and promoted V45 only through workflow validation.

## Gate 18: V45 Promotion Readiness

Gate 18 closes promotion readiness with
`.bitcode/v45-promotion-readiness-report.json`,
`generate:v45-promotion-readiness`, `check:v45-promotion-readiness`,
`check:v45-gate18`, `v45-canon-promotion.yml`; promotion scripts support V45.
It proves the V45 proof-family artifacts, source-safe rehearsal artifact,
active `BITCODE_SPEC_V45_PROVEN.md`, workflow posture, source-safety exclusions,
direct-main-push block, and value-bearing mainnet block before allowing V45
promotion. After promotion, the accepted runtime posture is active V45 / draft
V46.

## Commit-Body Direction

V45 commit bodies should name the gate class, protocol law affected, evidence
or validation command, source-safety posture, and whether the change is
specification-only, parity-only, proof-only, interface-only, implementation,
rehearsal, or promotion work.
