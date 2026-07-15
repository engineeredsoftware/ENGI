# /exchange compatibility redirect

`app/exchange/` exists only to preserve old links. It redirects to `/packs`.

Current Bitcode product routes are:

- `/deposits`: create and review source-safe AssetPack supply options.
- `/reads`: request Reading, review the synthesized Need, request Finding Fits, review the source-safe AssetPack preview, and settle.
- `/packs`: reread activity, proof roots, BTD scalar volume and rights, BTC settlement money, compensation, delivery, and repair state.

This directory must not contain current-product Exchange language, independent state ownership, or source-bearing detail rendering. It has no separate settlement authority, proof authority, or disclosure authority. `/packs` owns the current master-detail activity readback, and source-bearing AssetPack contents remain withheld until BTC finality, BTD rights transfer, and repository delivery to the entitled reader.

The compatibility contract is intentionally narrow:

- `/exchange` redirects to `/packs`.
- No protected source, unpaid AssetPack source, raw prompts, raw provider responses, wallet private material, private settlement payloads, credentials, or secrets are serialized here.
- Public/operator docs must describe this path as compatibility only.
