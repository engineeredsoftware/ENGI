# `uapi/` Bitcode Interface Surface

`uapi/` is the active interface owner for Bitcode.
It carries the `/terminal` operator surface, canonical `/auxillaries` reads, redirect-only legacy route aliases where still explicitly retained, Bitcode API routes, and the shared UI systems used by the Bitcode protocol implementation.

Active canon follows the top-level `BITCODE_SPEC.txt` pointer while the current draft hardens the MVP experience.

V28 QA scope is intentionally narrower than the full route inventory: Terminal, Auxillaries readiness, wallet-backed identity, GitHub source prerequisites, `$BTD` posture, MCP/API, and ChatGPT App MVP remain active; Exchange and website Conversations are deferred beyond V35 unless retained code contaminates the active V28 surfaces.
Wallet state in top chrome is tri-state during QA: loading while shared auxillary data is unresolved, connected when a wallet binding or local staged wallet exists, and disconnected only after the read settles without a wallet.

## Primary routes

- `/`
- `/docs`
- `/demo-video`
  Mounted Bitcode public shell, docs hub, and docs walkthrough alias.
- `/terminal`
  Main Bitcode operator surface. Deposit and Read are the primary write actions; recent Terminal activity is the focused read result surface.
- `/exchange`
  Deferred beyond V35. Retained source must not contaminate V28 Terminal or Auxillaries behavior.
- `/conversations`
  Deferred beyond V35 as a website application surface.
- `/executions`
  Retained execution route for Bitcode execution primitives, kept explicit as a fourth-gate promotion-boundary owner inside the broader activity family.
- `/edgetimes`
  Fourth-gate storage/schema/package ownership read mounted as a docs-branded Bitcode route.
- `/auxillaries/wallet`
- `/auxillaries/externals`
- `/auxillaries/profile`
- `/auxillaries/interfaces`
  Canonical auxillary routes for direct auxillary reading without losing the Bitcode framing.

Redirect-only orbital aliases such as `/orbitals/users`, `/orbitals/models`, and `/orbitals/btd` plus legacy `/auxillaries/btd` and `/auxillaries/connects` route segments are compatibility entry points and should not be treated as the enduring naming model.
Canonical `/auxillaries/*` routes and contained entry shells should teach auxillaries as the merged-world target, read as contained auxillary reads, and avoid regressing to generic workspace/settings/account language.
Selected `/terminal` and `/auxillaries` review surfaces should also keep live product wording on `Transactions` and `Auxillaries` instead of drifting back toward `workspace` or `transaction terminal`.
The shared auxillary metadata layer in `app/auxillaries/components/auxillary-pane-meta.ts` is the active owner for fullscreen auxillary-entry wording such as `Open Auxillaries fullscreen`, targeted auxillary-open actions, and the direct-route return action `Open transactions`.
Signed-in auxillary reopen actions should flow through the shared `openAuxillaries('auxillaries', step?)` contract rather than older account-named caller aliases.
Contained auxillary rails should converge on the shared panel-plus-tabs carriers in `app/auxillaries/components/shared/`, with retained `app/orbitals/components/*` imports treated as redirect-support internals rather than active route ownership.

## Main route systems

- `app/terminal/`
  `/terminal` route-local composition, route-owned transaction query state, flow-guide/runtime bridge, Deposit/Read workbench, and transaction detail.
  Gate 7 operations readiness is rendered by
  `app/terminal/TerminalOperationalHealthPanel.tsx` from the
  `@bitcode/btd/terminal-operational-health` package read; do not replace it
  with UI-only lane or telemetry fixtures.
- `app/exchange/`
  Deferred Exchange activity source retained for V35+ work.
- `app/auxillaries/`
  Canonical focused auxillary routes for `Wallet`, `Externals`, `Profile`, and `Interfaces`.
- `app/orbitals/`
  Redirect-only route carriers preserving former deep links while `/auxillaries/*` remains canonical.
- `app/conversations/`
  Deferred website conversation mode.
- `app/executions/`
  Retained execution route owners kept explicit while AssetPack evidence and activity semantics converge into Terminal and Exchange reads.
- `app/edgetimes/`
  Fourth-gate storage/schema/package ownership route and shared topology owner for `/edgetimes`.
- `app/api/`
  App-owned Bitcode JSON contracts, including executions, history, conversations, VCS, orbital preferences, client-error intake, preserved-runtime endpoints, and the `/api/edgetimes` storage/API witness.
- `components/bitcode/`
  Shared operator chrome, execution carriers, explainers, notifications, and reusable app primitives.

## Public shell owners

Third-gate public-shell work is now explicitly carried by:

- `app/(root)/components/PublicShellFrame.tsx`
  Mounted public-route provider shell for nav, auth, query, and auxillaries access.
- `app/(root)/components/MarketingLandingPage.tsx`
  Mounted homepage shell coordinator.
- `app/(root)/components/landing/MarketingLandingHero.tsx`
  Hero copy, pillar cards, and primary public entry actions.
- `app/(root)/components/landing/MarketingLandingPillarCard.tsx`
  Individual Bitcode deposit/read/$BTD pillar card owner.
- `app/(root)/components/landing/MarketingLandingGuideCard.tsx`
  Resumable guide posture card inside the landing hero.
- `app/(root)/components/landing/MarketingLandingTerminalPreview.tsx`
  Public transactions-terminal preview surface.
- `app/(root)/components/landing/marketing-landing-shared.tsx`
  Shared landing-shell constants and visual helpers for the mounted public shell.
- `app/(root)/components/MarketingOperatorGuideCard.tsx`
  Stable docs-owned walkthrough card with user-facing fallback forward into `/terminal` when guide media is absent.
- `app/(root)/components/PublicDocsPageContent.tsx`
  Public docs hub content with route cards, inline widgets, walkthrough embedding, and public CTA posture.
- `app/docs/page.tsx`
  Real public docs route for the mounted Bitcode shell.
- `app/demo-video/page.tsx`
  Redirect alias into the public docs hub and walkthrough content.
- `components/bitcode/layout/nav.tsx`
  Public-route navigation and access CTA chrome shared with product surfaces.
- `components/bitcode/layout/NavBrand.tsx`
  Bitcode public-route brand posture and explicit `network` / `docs` route naming.
- `components/bitcode/layout/footer.tsx`
  Shared public footer CTA and public-route link posture.
- `components/bitcode/layout/bitcode-public-copy.ts`
  Shared public-shell vocabulary for `Network`, `Transactions`, `Docs`, `Auxillaries`, and Deposit/Read teaching posture.
- `components/bitcode/layout/bitcode-public-explainers.ts`
  Shared public-shell explainer content for key entry links and the protocol reference.

Those owners should not reintroduce live `ComingSoon*` component naming, `coming-soon-*` stylesheet imports, or dormant access-gate code inside the mounted Bitcode public shell.
They should also keep landing hero, guide, preview, and shared public-shell data split into clearer carriers once those sections stabilize rather than regressing to one oversized owner file.
They should preserve rich help posture on those public entry points instead of falling back to thin browser `title` tooltips.
They should keep the stable docs walkthrough on one Bitcode-owned guide asset instead of preserving ordered demo-era media.
They should keep `/docs` as the real public teaching surface and `/demo-video` only as a docs alias into that docs-owned content.
They should also keep primary public entry links and guest access actions directly visible on smaller screens rather than adding another menu-only discovery layer.
They should keep footer entry links and protocol/version metadata progressive on smaller shells, using card/chip presentation instead of compressed inline microcopy.
They should now also keep `/edgetimes` aligned with the docs-branded public shell while treating it as a fourth-gate retained-system owner rather than brochure content.

Fourth-gate retained `/executions` health also now depends on explicit support API carriers:

- `app/api/vcs/route.ts`
  Reader-first VCS support carrier for retained execution selectors and repo context.
- `app/api/templates/shippables/route.ts`
  Active Shippable-template carrier for retained execution composition.
- `app/api/auxillaries/template-preferences/route.ts`
  Saved template-preference support carrier for retained execution personalization.
- `app/api/auxillaries/profile/route.ts`, `app/api/auxillaries/connections/github/route.ts`, `app/api/auxillaries/btd/route.ts`, `app/api/auxillaries/usage/route.ts`, `app/api/auxillaries/transactions/route.ts`, `app/api/auxillaries/api-keys/route.ts`
  Canonical auxillary API owners for Profile, Externals/GitHub, BTD balance history, BTD transaction history, and API-key management; active product code should prefer these over redirect `orbitals` API aliases.

Those routes are not brochure support leftovers.
They are current fourth-gate promotion-boundary owners and should stay fail-closed, tested, and documented until inward convergence removes the retained dependency.

## Development

Install dependencies from the repo root, then use the app directory for focused commands:

```bash
pnpm install
cd uapi
pnpm install
```

Local environment:

```bash
cd uapi
cp .env.example .env.local
```

Typical local variables for mock-mode review:

```text
NEXT_PUBLIC_ENABLE_MOCKS=true
NEXT_PUBLIC_MASTER_MOCK_MODE=true
NEXT_PUBLIC_MOCK_SCENARIO=demo
NEXT_PUBLIC_MOCK_USER_AUXILLARIES=true
NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS=true
NEXT_PUBLIC_MOCK_GITHUB_REPOS=true
```

Run the app:

```bash
cd uapi
HOST=127.0.0.1 PORT=3000 pnpm dev:remote
```

## Verification

Focused lint:

```bash
cd uapi
pnpm exec next lint --file app/terminal/TerminalPageClient.tsx
```

Focused Jest examples:

```bash
cd uapi
pnpm exec jest --runInBand --testMatch '<rootDir>/tests/terminalTransactionQuery.test.ts'
pnpm exec jest --runInBand --testMatch '<rootDir>/tests/auxillariesProvider.test.tsx'
```

## README Set

The current interface doc set is:

- [README.md](../README.md)
- [app/terminal/README.md](app/terminal/README.md)
- [app/exchange/README.md](app/exchange/README.md)
- [app/auxillaries/README.md](app/auxillaries/README.md)
- [components/bitcode/README.md](components/bitcode/README.md)
- [components/bitcode/execution/README.md](components/bitcode/execution/README.md)

Those markdown carriers are part of the interface implementation/proof boundary.
If the route/package/component owners change, this doc set is expected to move with them.

## Related docs

- [BITCODE_SPEC_V27.md](../BITCODE_SPEC_V27.md)
- [BITCODE_SPEC_V27_PROVEN.md](../BITCODE_SPEC_V27_PROVEN.md)
- [BITCODE_SPEC_V28.md](../BITCODE_SPEC_V28.md)
- [BITCODE_SPEC_V28_DELTA.md](../BITCODE_SPEC_V28_DELTA.md)
- [BITCODE_SPEC_V28_PARITY_MATRIX.md](../BITCODE_SPEC_V28_PARITY_MATRIX.md)
- [BITCODE_SPEC_V28_NOTES.md](../BITCODE_SPEC_V28_NOTES.md)
