/**
 * Docs: Auxillaries — Wallet, Externals, Profile, Interfaces.
 * Adjacent to product routes; not a replacement for Packs / Deposit / Read.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const auxillariesSections = [
  {
    id: 'auxillary-model',
    eyebrow: 'Auxillaries',
    title: 'Auxillaries hold wallet, externals, profile, and interface readiness',
    summary:
      'Auxillaries is the configuration shell beside the product routes: Bitcoin wallet identity, GitHub and future source providers, optional profile metadata, interface defaults, and BTD posture.',
    detail:
      'Opening Auxillaries should feel adjacent to Packs, Deposit, and Read — not a separate product. It changes readiness and defaults while activity you selected on a product route remains recoverable. Connect Wallet is the guest entry; after identity is bound, Auxillaries opens from signed-in chrome.',
    reason:
      'Configuration only matters commercially when operators know which capability it unlocks or blocks.',
    points: [
      'Wallet is the first identity step: a Bitcoin wallet proof that can back a session and fee readiness.',
      'Externals owns GitHub App install and repository scope after wallet identity exists.',
      'Profile owns optional email, display identity, roles, and organization metadata.',
      'Interfaces owns defaults for how product detail, conversations, and proofs open.',
      'Wallet also surfaces BTD balances and related share posture without inventing a second ledger.',
    ],
  },
  {
    id: 'connects-profile-btd',
    eyebrow: 'Readiness',
    title: 'Wallet, Externals, Profile, and Interfaces are readiness surfaces',
    summary:
      'Wallet identity, repository scope, profile roles, interface defaults, and BTD controls determine which writes can leave review and enter signed or connected execution.',
    detail:
      'You can still learn the product with incomplete readiness, but live deposit, read settlement, and delivery must keep blockers visible. Production execution fails closed until required wallet and source posture is complete.',
    reason:
      'Honest readiness language lets operators learn without confusing launch blockers for product bugs.',
    steps: [
      'Connect and sign with a Bitcoin wallet first (testnet lane for commercial testnet).',
      'Install the Bitcode GitHub App and authorize repositories second.',
      'Add optional email and profile settings after wallet and source readiness are clear.',
      'Set interface defaults for how Packs detail, conversations, and proofs open.',
      'Review BTD and wallet-adjacent controls before settlement-sensitive work.',
    ],
  },
  {
    id: 'third-party-connections',
    eyebrow: 'Externals',
    title: 'Externals is source-bearing ingress — not a buried account setting',
    summary:
      'Externals owns GitHub (and future providers) because repository scope becomes permitted source for measurement, AssetPack synthesis, proof follow-through, and settlement readiness.',
    detail:
      'A healthy connection read shows pending, connected, reconnect-required, or inventory-only posture. Wallet identity stays in Wallet; repository attachment and provider scope stay in Externals. Read-space knowledge sharing is a separate opt-in after repositories are approved.',
    reason:
      'Operators need to know why missing GitHub or wallet state blocks live writes without blocking learning and review.',
    points: [
      'GitHub scope defines which repositories Bitcode may read as permitted source.',
      'Stored inventory can support reread; live write admission fails closed until the provider is healthy.',
      'Bitcoin wallet plus authorized GitHub repositories are the minimum live prerequisites for source-bearing work.',
    ],
  },
  {
    id: 'interface-defaults',
    eyebrow: 'Interfaces',
    title: 'Interface defaults shape how product detail, chat, and proofs open',
    summary:
      'Interfaces owns detail density, conversation return behavior, proof read mode, and related product posture — not a second protocol.',
    detail:
      'These preferences change how much detail opens by default, how conversations re-enter the product, and whether proof readers see visual, mixed, or raw evidence first. Ledgerized Reading still keeps protocol-owned model configuration.',
    reason:
      'Every preference should state an operational consequence, not only a visual one.',
    points: [
      'Packs detail density controls how much selected activity detail opens by default.',
      'Conversation launch controls overlay vs focused continuity when chat re-enters.',
      'Proof mode controls visual, mixed, or raw-first evidence presentation.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
