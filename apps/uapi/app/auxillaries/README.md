# Bitcode Auxillaries Overlay

Auxillaries are an overlay, not an application page.
The active product entry URL is `/terminal?auxillary-open-to=<pane>`, which opens the requested pane in the global Auxillaries portal while leaving Terminal as the application surface.

## Canonical overlay targets

- `/terminal?auxillary-open-to=wallet`
- `/terminal?auxillary-open-to=externals`
- `/terminal?auxillary-open-to=interfaces`
- `/terminal?auxillary-open-to=profile`

The `/auxillaries/*` and `/orbitals/*` route families are redirect-only support paths.
They must never render standalone Auxillaries HTML or the retired left-sidebar workspace chrome.
Legacy `/auxillaries/btd` and `/auxillaries/connects` aliases redirect into the Wallet and Externals overlay targets.

## Ownership

- `auxillary-onboarding-contract.ts`
  Interface bridge over the package-owned Auxillaries route contract. It
  re-exports `AuxillariesContractSnapshot`, `AuxillariesProfileState`,
  `AuxillariesConnectionReadiness`, `AuxillariesInterfaceAdmission`,
  `AuxillariesWalletBtdPaneState`, `OrganizationPolicyAuthority`,
  `AuxillariesReadinessDiagnostic`, `AuxillariesRecoveryRun`,
  `AuxillariesTelemetryProofHook`,
  `AuxillariesAccountIdentity`, `AuxillariesPreferencePosture`,
  `AuxillariesNotificationPosture`, and `AuxillariesDataSharingPosture` from
  `@bitcode/api/src/routes/auxillaries-contract`. UI code may consume these
  objects but must not rederive readiness, policy, source-safety, or proof-root
  logic locally.
- `[pane]/page.tsx`
  Redirect-only compatibility owner for pane aliases.
- `components/auxillary-pane-meta.ts`
  Canonical auxillary overlay target builder, metadata owner, and support-path bridge.
- `components/AuxillariesProvider.tsx`
  Canonical fullscreen auxillary overlay provider, event bridge, and portal owner.
- `components/AuxillariesSurface.tsx`, `components/AuxillariesContent.tsx`, `components/AuxillariesLoginPane.tsx`
  Canonical auxillary shell, contained reading surface, and connect entry owners.
- `components/Auxillaries{Wallet,Externals,Profile,Interfaces}Pane.tsx`
  Canonical pane implementation owners imported by the auxillary surface. These files now hold the live pane logic and import canonical auxillary headers, shared carriers, explainer maps, data-share panels, and model sections directly.
- `components/headers/*`, `components/shared/*`, `components/models/*`, `components/AuxillariesDataSharingPanel.tsx`, `components/auxillary-pane-explainers.ts`, `components/profile-pane.module.css`
  Canonical auxillary lower-level implementation carriers for pane headers, onboarding overlays, preference/stat sections, model defaults, data-share posture, explainer copy, and profile styling.
- `../orbitals/components/*`
  Redirect-support wrappers still being retired behind canonical auxillary ownership during V28 hardening.
- `../api/auxillaries/*`
  Canonical auxillary API owners for profile, Externals, notifications, onboarding, model preferences, BTD balance history, BTD transaction history, API keys, and data-share posture.

## Canonical rule

User-facing route and HTML posture should prefer `/terminal?auxillary-open-to=<pane>`.
Active product code should also prefer `/api/auxillaries/*`.
`/auxillaries/*`, `/orbitals/*`, and `/api/orbitals/*` are redirect/support carriers only and should be retired entirely before fully commercial canon closure.

## V28 prerequisite posture

Auxillaries is the V28 prerequisite control plane for Terminal:

- Wallet starts with Bitcoin wallet authentication. The wallet proof is the minimum identity origin for Supabase synchronization and local wallet readiness.
- Externals comes second and owns GitHub App installation/source-provider scope needed for Deposit and Read.
- Externals consumes package-owned `connectionReadiness` and `recoveryRuns` from
  `/api/auxillaries/data`, showing provider id/name, token presence class,
  scopes class, readback status, blocker, repair action, and compact readiness
  roots without exposing raw provider credentials.
- Externals also reads package-owned `telemetryProofHooks`, rendering the
  source-safe theorem id, replay step id, evidence root, telemetry root,
  blocker, and repair outcome summary needed to debug provider and recovery
  posture without opening browser network logs or leaking credentials.
- Profile owns optional email/contact/admin data and must not appear as the primary identity requirement. Its readiness summary consumes `profileState` from `/api/auxillaries/data`, including named repair routes for identity, wallet binding, preferences, notifications, and data-sharing posture.
- Wallet also reflects BTD range/share posture after the shared auxillary data read settles.
- Wallet consumes package-owned `walletBtdPaneState` from
  `/api/auxillaries/data`, including no-custody signer posture, wallet/network
  readiness, BTD range cell counts, owner-read/licensed-read/pending/denied
  read-right posture, account BTC fee treasury posture, settlement blockers,
  and compact roots. The pane must not show protected AssetPack source before
  paid unlock and must not treat account treasury support as Exchange market
  activity.
- Profile consumes package-owned `organizationAuthority` from
  `/api/auxillaries/data`, including organization/team/member identity, role,
  explicit grant set, wallet binding, policy id/hash, multi-sig readiness,
  policy decision, denial reasons, recovery route, source visibility, and
  authority root. The pane may display source-safe authority blockers and roots,
  but must not rederive organization policy locally or treat multi-sig readiness
  as value-bearing mainnet approval.
- Interfaces consumes package-owned `interfaceAdmissions` from
  `/api/auxillaries/data`. The pane renders the source-safe admission catalog
  for Terminal, API, MCP, ChatGPT App, Exchange hook, Conversations hook, and
  future interface hooks, including auth mode, supported actions, currently
  admitted actions, policy requirements, source-safety class, blockers,
  readiness, deferred-product depth, and interface-admission roots. It must not
  recalculate policy locally or unlock Exchange/Conversations product depth in
  V31.
- The top chrome must show a loading/readiness state until auxillary data determines whether a wallet exists; it must not briefly show `Connect Wallet` during unresolved connection reads.
- QA builds should enable `NEXT_PUBLIC_BITCODE_QA_VERBOSE=true` and `BITCODE_QA_VERBOSE=true` to trace client/server identity synchronization without logging secrets.

## V31 UX and accessibility posture

The contained Auxillaries surface is a guided support plane before it is an
audit surface.
It must render one named main landmark, a keyboard-reachable skip link to the
active support pane, named pane navigation, and a named active-pane region with
state announcement for loading and ready posture.

Every pane keeps the same low-detail shell:

- compact active-pane summary and source-safe readiness chips are visible by default;
- audit metadata is expandable through a native `details` control and does not require raw JSON for normal operation;
- selector buttons remain native buttons with `aria-current`, `aria-disabled`, and screen-reader state descriptions;
- route-scoped CSS owns focus-visible rings, mobile/desktop wrapping, overflow safety, contrast-preserving chips, and reduced-motion behavior.

`auxillaries-ux-accessibility-proof.ts` is the compact proof contract for this
surface: it names the required landmarks, source-safe states, supported
viewport posture, and evidence files that must stay synchronized with the gate
tests and route CSS.

## Leather wallet contract

Leather is supported through the injected `window.LeatherProvider.request` API.
The active Wallet pane and wallet utilities must:

- detect Leather by `window.LeatherProvider.request`;
- call `getAddresses` and select BTC entries by `symbol`/`type`, never by array index;
- prefer `p2tr` for the Bitcode auth address and retain `p2wpkh` as the payment address when both are returned;
- derive the Leather account parameter from the BTC derivation path when available;
- call `signMessage` with explicit `paymentType`, `network`, and `account` for the Bitcode authentication challenge;
- keep `open`, `signPsbt`, and `sendTransfer` available as tested utilities for Terminal BTC/PSBT flows, without treating them as proof of wallet identity by themselves.

Leather's documented Bitcoin `network` values include `mainnet`, `testnet`, `signet`, `sbtcDevenv`, and `devnet`.
The V28 staging Testnet4 lane currently calls Leather with `testnet` because that is the documented Leather browser-provider enum.

## V35 telemetry documentation integration

Auxillaries consumes the package-owned
`TelemetryDocumentationInterfaceIntegration` contract through the same
source-safe surface documented by
`.bitcode/v35-telemetry-documentation-interface-integration.json`.
Wallet, Externals, Interfaces, and Profile panels may show event ids, proof
roots, docs links, runbook links, and redaction posture when that helps an
operator repair readiness without opening raw network payloads.

Auxillaries payloads remain source-safe support metadata. They must not expose
provider tokens, secret values, wallet private material, protected source,
raw protected prompts, or unpaid AssetPack source.
