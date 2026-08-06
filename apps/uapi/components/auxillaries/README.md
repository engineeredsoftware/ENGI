# Auxillaries experience (`Auxillaries*`)

Identity, wallet, connections, interfaces, and organization panes.
Imports **Bitcode** only (never other experiences). Page shell: `apps/uapi/app/auxillaries/`.

Product language: **Pipeline** for runs; **journal** for BTD ledger rows.
Opens as an overlay over product routes (e.g. `/exchange`); not a primary product experience route.

## Layout (SOURCE_LAYOUT)

```
apps/uapi/components/auxillaries/
  README.md
  AuxillaryPaneMeta/           # pane ids, routes, ring indices
  AuxillaryPaneExplainers/     # pane explainer copy
  AuxillariesSurface/          # shell + auth chrome
    hooks/                     # surface state, step content wiring
    models/                    # path parse, lazy analytics
    auxillaries-surface-dynamic.tsx
  AuxillariesContent/          # tabbed pane host
  AuxillariesProvider/
  AuxillariesOpenButton/
  AuxillariesLoginPane/
  AuxillariesProfilePane/      # profile + readiness + authority sections
    hooks/ models/ Profile*Section/ OrganizationAuthoritySection/
  AuxillariesWalletPane/       # BTD posture + activity + defaults
    hooks/ models/ WalletBtdPostureSection/
  AuxillariesWalletConnectionPanel/
    hooks/ models/             # Bitcoin connect lifecycle
  AuxillariesExternalsPane/    # GitHub + readiness + data sharing
    hooks/ models/ Externals*/
  AuxillariesInterfacesPane/   # interface defaults + admissions
    hooks/ models/ InterfaceAdmissionCatalog/
  AuxillariesDataSharingPanel/
  headers/                     # per-pane headers
  models/                      # GlobalModelSelection, SystemPromptSection
  organization/
    OrganizationSettings/      # general / treasury / security / advanced tabs
    BTDTreasuryManagement/
  shared/                      # tabs, stat grids, preference cards, workspace sections
```

## Unit pattern

Each non-trivial component owns a **named directory** with a **named entry file**
(`ComponentName/ComponentName.tsx` — not `index.tsx`). Extract:

- pure formatters → `models/`
- stateful effects → `hooks/use-*.ts`
- large JSX regions → co-located named section components

Top-of-file overview comments are required on non-trivial modules.
Prefer explicit imports (no grab-bag barrels).

## Entry surfaces

| Unit | Role |
| --- | --- |
| `AuxillariesSurface` | Overlay / route shell, auth windows, step routing |
| `AuxillariesProfilePane` | Email contact, identity, readiness, org authority |
| `AuxillariesWalletPane` | Wallet binding, BTD posture, activity, share defaults |
| `AuxillariesWalletConnectionPanel` | Bitcoin provider connect / stage / disconnect |
| `AuxillariesExternalsPane` | GitHub attachment, readiness, data-sharing consent |
| `AuxillariesInterfacesPane` | Interface defaults, admission catalog, prompt baseline |
| `organization/OrganizationSettings` | Org general / treasury / security / advanced |

## Tests

Co-located unit tests under `__tests__/` when practical; experience contracts live under
`apps/uapi/tests/` (`auxillaries*`, `walletPane*`, `profileStep*`, `externalsPane*`).
