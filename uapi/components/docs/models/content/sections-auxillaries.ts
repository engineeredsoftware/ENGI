/**
 * Docs content module: sections auxillaries.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const auxillariesSections = [
  {
    id: 'auxillary-model',
    eyebrow: 'Auxillaries',
    title: 'Auxillaries are the wallet, externals, profile, and interface layer',
    summary:
      'Auxillaries hold the context that changes how Terminal can operate: signed Bitcoin wallet identity, connected repositories, optional profile metadata, interface defaults, and BTD preferences.',
    detail:
      'The auxillary shell should feel adjacent to Terminal, not detached from it. Opening Auxillaries changes readiness and configuration while the selected Terminal activity remains recoverable.',
    reason:
      'Configuration is commercially important only when users can understand which operational capability it unlocks or blocks.',
    points: [
      'Wallet owns the first identity step: a Bitcoin wallet proof that can back a Supabase session.',
      'Leather support uses its documented Bitcoin provider methods: getAddresses, signMessage, signPsbt, sendTransfer, and open.',
      'Leather Taproot p2tr is preferred for Bitcode auth when present; Native SegWit p2wpkh remains the payment-address read.',
      'Externals owns GitHub and future source-provider bindings after wallet identity exists.',
      'Profile owns optional email, display identity, account role, and organization metadata.',
      'Interfaces owns default behavior and visual/product posture.',
      'Wallet also owns BTD balances, range posture, and share-specific settings.',
    ],
  },
  {
    id: 'connects-profile-btd',
    eyebrow: 'Readiness',
    title: 'Wallet, Externals, Profile, and Interfaces are readiness surfaces',
    summary:
      'Wallet identity, repository scope, profile roles, interface defaults, and $BTD controls determine which writes can move from review to signed or connected execution.',
    detail:
      'A user may still learn or draft in launch mode, but production execution must keep blockers clear before deposit, branch, settlement, delivery, or connected-interface writes proceed.',
    reason:
      'This lets Bitcode ship a strong Terminal experience with mocked data while preserving the production direction toward real connectivity.',
    steps: [
      'Connect and sign with a Bitcoin wallet first.',
      'For Leather, unlock the extension, use its testnet lane, approve the Bitcode message signature, and expect Bitcode to keep auth and payment addresses distinct.',
      'Install the GitHub App or connect a source provider second.',
      'Add optional email/contact settings only after wallet and source readiness are clear.',
      'Set profile identity, organization, and role posture only after required wallet and repository prerequisites are visible.',
      'Choose interface defaults for Terminal and connected surfaces.',
      'Review BTD and wallet-adjacent controls before settlement.',
    ],
  },
  {
    id: 'third-party-connections',
    eyebrow: 'Externals',
    title: 'Third-party connections are source-bearing ingress, not hidden account settings',
    summary:
      'Externals owns GitHub and future provider bindings because repository scope becomes source-bearing input for Read measurement, AssetPack synthesis, proof follow-through, and settlement readiness.',
    detail:
      'A healthy connection read tells the user whether the provider is pending, connected, reconnect-required, or available only from stored inventory. It also explains that wallet identity stays in Wallet, while repository attachment and provider scope stay in Externals.',
    reason:
      'New users read to understand why a missing GitHub or wallet connection blocks live writes without blocking learning-mode Terminal review.',
    points: [
      'GitHub scope defines which repositories Bitcode can read for source supply.',
      'Stored inventory can support reread, but live write admission fails closed until the provider is restored.',
      'Bitcoin wallet posture plus GitHub scope are the minimum live prerequisites before settlement or signed delivery.',
    ],
  },
  {
    id: 'interface-defaults',
    eyebrow: 'Interfaces',
    title: 'Interface defaults shape how Terminal, conversations, and proofs open',
    summary:
      'Interfaces owns Terminal detail density, non-ledgerized instruction posture, conversation return behavior, proof read mode, instruction tone, and execution bias.',
    detail:
      'These are not cosmetic preferences. They change how much detail Terminal opens with, how conversations re-enter the product, and whether proof readers see visual, mixed, or raw evidence first. Ledgerized Reading keeps protocol-owned model configuration.',
    reason:
      'Configuration becomes teachable when every preference says what operational consequence it has.',
    points: [
      'Packs detail density controls how much selected activity detail opens by default.',
      'Conversation launch controls whether chat appears as overlay, focused work, or continuity-preserving mode.',
      'Proof mode controls whether evidence opens visually, mixed with structured payloads, or raw first.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
