# ADR: Auxillaries Overlay — Windows and Panes

Status: Accepted

Date: 2025-09-15

## Context

We standardized the user-facing Auxillaries overlay across the app. The canonical route and API family is now `/auxillaries/*`. The overlay has two top-level states that a user toggles between, and within one of those states it hosts four per-auxillary panels. Historically we used "mode" and singular "orbital" inconsistently, and this ADR records the Bitcode-side organization while redirect/support residue is retired.

## Decision

1) Naming and Structure

- Experience: Auxillaries (user-facing), canonical `/auxillaries/*` route family
- Windows (overlay top-level):
  - `ConnectWindow`: Identity Connect surface.
  - `AuxillariesWindow`: Connected/workspace surface that contains the panes.
- Panes (inside AuxillariesWindow):
  - `wallet`, `externals`, `profile`, `interfaces`
- Headers: a singular auxillary header per pane for consistent title/copy.
  Retained `uapi/app/orbitals/components/headers/*` files are redirect-support re-exports only; canonical header ownership lives under `uapi/app/auxillaries/components/headers/*`.

2) Component Placement

- Canonical route/overlay implementation now lives under: `uapi/app/auxillaries/components/*`
  - Overlay root: `AuxillariesSurface.tsx`, `AuxillariesContent.tsx`, `AuxillariesLoginPane.tsx`, `AuxillariesProvider.tsx`
  - Pane owners: `AuxillariesWalletPane.tsx`, `AuxillariesExternalsPane.tsx`, `AuxillariesProfilePane.tsx`, `AuxillariesInterfacesPane.tsx`
  - Lower-level pane owners: `headers/*`, `shared/*`, `models/*`, `AuxillariesDataSharingPanel.tsx`, `auxillary-pane-explainers.ts`, `profile-pane.module.css`
- Retained implementation internals still live under: `uapi/app/orbitals/components/*`
  - Redirect-support wrappers and re-exports only; canonical pane logic and lower-level helper ownership now live under `uapi/app/auxillaries/components/*`
- Experience boundaries:
  - Marketing: `uapi/app/(root)/components/*`
  - Executions: `uapi/app/executions/components/*`
  - Conversations: `uapi/app/conversations/components/*`
  - Shared across experiences: `uapi/components/bitcode/*`

3) Events and API

- Global events:
  - Open: `window.dispatchEvent(new CustomEvent('open-auxillaries', { detail: { window: 'ConnectWindow' | 'AuxillariesWindow', step?: AuxillaryPane } }))`
  - Close: `window.dispatchEvent(new CustomEvent('close-auxillaries'))`
- Types:
  - `type AuxillaryPane = 'wallet' | 'externals' | 'profile' | 'interfaces' | null`
  - Overlay prop: `window?: 'ConnectWindow' | 'AuxillariesWindow'`
- Deep links: canonical `/auxillaries/(wallet|externals|profile|interfaces)` open the focused contained read. Legacy `btd` and `connects` route segments normalize to `wallet` and `externals`.
- Provider API: `openAuxillaries(window?: 'ConnectWindow' | 'AuxillariesWindow', step?: AuxillaryPane)`, `closeAuxillaries()`, `prefetchAuxillaries()`

4) HTTP and CSS Conventions

- API paths are canonicalized under `/api/auxillaries/*`.
- CSS Modules: animations declared via `:global { @keyframes ... }` (purity).
  Retained style prefixes like `orbitals-*` are internal redirect-support residue that should keep shrinking until the full fifth-gate cut-over is complete.

## Consequences

- The left toggle in the overlay switches between `ConnectWindow` and `AuxillariesWindow`.
- Per-auxillary panes remain as the right abstraction inside AuxillariesWindow.
- User-facing naming and canonical routes read as Auxillaries.
- Tests, stories, and fetchers should target `/auxillaries` owners first.
- Future work should place components according to the experience vs base boundary described above.

## Example Usage

```ts
import { openAuxillaries } from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider';

// Open connected Auxillaries workspace directly to Externals pane
openAuxillaries('AuxillariesWindow', 'externals');

// Open Connect window
openAuxillaries('ConnectWindow');

// Global events (alternative)
window.dispatchEvent(new CustomEvent('open-auxillaries', { detail: { window: 'ConnectWindow' } }));
```
