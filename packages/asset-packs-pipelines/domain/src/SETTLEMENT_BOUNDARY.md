# Settlement / delivery ownership law

## Exclusive owner

**`execution-pipeline-simple-settle-asset-pack`** (settle-asset-pack-pipeline) is the
**only** product pipeline that may:

- Observe BTC payment / finality
- Build settlement rights / BTD unlock
- Open or record buyer-repo **shippable** PRs
- Emit **`settleDelivery`**, **`shippable`**, delivery unlock, settlement replay

## Synthesis (deposit + read SDIVF)

`execution-pipeline-sdivf-synthesize-deposits-asset-packs` and
`execution-pipeline-sdivf-synthesize-reads-asset-packs` (and shared synthesis
postprocess/Finish) **must not**:

| Forbidden on synthesis | OK on synthesis |
| --- | --- |
| `settleDelivery` | `selectionEnvelope` / `options` |
| `shippable` / buyer PR URL | `assetPackSynthesisArtifacts` |
| Settlement rights delivery boundary | Source-safe **preview** / fee quote (selection UI) |
| Delivery unlock after payment | `deliveryMechanismTemplate` (catalog only) |
| Kind `settle_delivery` | Kind `deposit_options` / `read_options` / `asset_pack_synthesis` |

## Shared library modules

`asset-pack-settlement-rights-delivery.ts` (and related BTD/BTC statement helpers)
live under `domain` as a **library** for the settle pipeline and host settle
staging. They are **not** part of the synthesis algorithm.

- **May import:** settle pipeline, host settle path after purchase
- **Must not import/call from:** synthesis preprocess, synthesis postprocess,
  deposit/read Finish agents, deposit/read phase runners

## Hand-off

Read synthesis finishes with options for `/reads` selection and
`nextPipeline: settle-asset-pack-pipeline`.  
Deposit synthesis finishes with options for `/deposits` review.  
**A separate settle run** performs payment + delivery.
