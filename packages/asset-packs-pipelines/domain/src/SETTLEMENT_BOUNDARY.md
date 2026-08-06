# Settlement & Delivery ownership law

## Exclusive definitions (settle-asset-pack-pipeline only)

| Term | Meaning | Owner |
| --- | --- | --- |
| **Settlement** | BTD–BTC payment observation + Bitcode System finalities (rights, ledger, read licenses) | **settle-asset-pack-pipeline only** |
| **Delivery** | **Settled** Synthesized **Read** AssetPack(s) shipped as **buyer-repo PRs** | **settle-asset-pack-pipeline only** |

Neither word, nor their result surfaces (`settleDelivery`, `shippable`, delivery unlock, settlement rights boundary), may appear as synthesis algorithm outputs or Finish review-store names.

## Synthesis (deposit + read SDIVF)

**May** produce:

- Selection envelopes / options for `/deposits` or `/reads`
- Synthesis artifacts (`assetPackSynthesisArtifacts`, measurements, patches)
- Source-safe **preview** + fee quote for selection UI
- Finish **review upload** / **review readiness** (user review on Bitcode — not Delivery)

**Must not** produce or project:

| Forbidden | Why |
| --- | --- |
| `settlementBoundary` args (including `null`) on reading telemetry/parity/rehearsal | Even null is a concept leak into synthesis |
| `settleDelivery`, `shippable`, PR URL | Delivery = settle only |
| Settlement rights unlock / delivery unlock | Settlement + Delivery = settle only |
| Finish fields named “delivery” for review upload | Use `reviewUpload` / `reviewReadiness` |

## Hand-off

1. **Deposit synthesis** → options for depositor review → (later) deposit admission  
2. **Read synthesis** → options for reader review → purchase → **separate settle run**  
3. **Settle run** → Settlement (BTD-BTC + system finalities) → Delivery (PR of settled read pack)

## Library modules

`asset-pack-settlement-rights-delivery.ts` remains under domain as a **settle-pipeline library**.  
Synthesis preprocess/postprocess/Finish must never call or project it.
