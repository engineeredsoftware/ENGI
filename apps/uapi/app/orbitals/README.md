# `/orbitals` Redirect-Only Bitcode Auxillaries Route

The `/orbitals` path is a redirect-only support route converging on Bitcode `Auxillaries`.
It no longer acts as a direct-route family. Canonical focused auxillary reads open as overlays through `/terminal?auxillary-open-to=<pane>`, while `/orbitals/*` preserves former deep links through redirects only.

The active orbital ring model is fixed:
- `Connects`
- `Interfaces`
- `Profile`
- `$BTD`

## Route model

Canonical overlay targets:
- `/terminal?auxillary-open-to=externals`
- `/terminal?auxillary-open-to=interfaces`
- `/terminal?auxillary-open-to=profile`
- `/terminal?auxillary-open-to=wallet`

Redirect-support paths may still exist for convergence:
- `/orbitals/users` -> `profile`
- `/orbitals/models` -> `interfaces`
- `/orbitals/btd` -> `btd`

Those aliases are not the enduring naming model.

## Ownership

- `../auxillaries/[pane]/page.tsx`
  Redirect-only support owner.
- `page.tsx` plus focused `*/page.tsx`
  Redirect-only support carriers from `/orbitals/*` into the Terminal overlay targets.
- `components/orbital-pane-meta.ts`
  Shared orbital naming, canonical auxillary overlay target building, redirect detection, and user-facing copy owner for entry buttons and Terminal return actions.
- `components/OrbitalsProvider.tsx`
  Redirect-support wrapper over the canonical fullscreen auxillary provider and portal/event bridge.
- `components/OrbitalsContent.tsx`
  Shared ring/contained-orbital content shell.
- `components/shared/OrbitalsWorkspacePanels.tsx`
  Shared contained-orbital rail for the commercial overlay.
- `components/shared/OrbitalsPaneTabs.tsx`
  Shared contained-orbital tabs for overlay reading.
- `components/OrbitalsConnectsPane.tsx`
  Repository and external connection posture.
- `components/OrbitalsInterfacesPane.tsx`
  Exchange detail, conversation, proof, and operator-default posture.
- `components/OrbitalsProfilePane.tsx`
  Wallet identity, roles, balances, membership, and authentication posture.
- `../api/auxillaries/user/data-share/route.ts`
  Fail-closed repository knowledge-sharing carrier now surfaced from the `$BTD` auxillary.
- `components/OrbitalsBTDPane.tsx`
  Share posture, `$BTD` defaults, and BTD-specific follow-through.

## UX rule

Auxillaries are not generic settings/account furniture.
They are Bitcode’s extra-network, non-transactional, still-proven companion surfaces around the core network and transaction system.
The retained `/orbitals` route family survives only as redirect-only support. The merged-world naming target is `Auxillaries`, opened from the Terminal overlay query target.

The contained auxillary shell used inside the commercial surface should:
- stay visually stable,
- keep ring/background motion subordinate to reading,
- preserve the active pane in a contained auxillary read,
- route contained navigation through shared orbital panels plus tabs instead of floating sequence cards and free-position ring labels,
- keep a full-width contained operator shell instead of shrinking back to modal-width account furniture,
- read as retained auxillaries access and contained auxillary reads rather than generic settings/account furniture,
- keep shared entry labels such as `Open Auxillaries fullscreen`, targeted actions such as `Open Connects fullscreen`, and the Terminal return action `Open transactions` aligned across commercial surfaces,
- reopen signed-in overlays through `openAuxillaries('auxillaries', step?)` from active callers,
- and remain aligned to the same operator atmosphere as `/terminal`.

## Related files

- `../auxillaries/README.md`
- `../terminal/README.md`
- `../../styles/orbital.css`
- `../../styles/orbital-rings.css`
