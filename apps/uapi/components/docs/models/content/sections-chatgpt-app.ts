/**
 * Docs content module: sections chatgpt app.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const chatGptAppSections = [
  {
    id: 'chatgpt-role',
    eyebrow: 'ChatGPT App',
    title: 'The ChatGPT App is a guided Bitcode interface, not a separate assistant',
    summary:
      'A ChatGPT App can help users express Reads, attach source, ask for proof explanations, draft settle delivery, and operate through confirmation-gated writes.',
    detail:
      'Its answers should map back to /packs records and proof readback. The app may be conversational, but the proof and state contract remains Bitcode.',
    reason:
      'This keeps a familiar commercial interface aligned with Protocol-grade evidence instead of drifting into untracked chat output.',
    points: [
      'Confirm writes before changing route-owned state.',
      'Attach source, output destinations, Read intent, and AssetPack references as structured context.',
      'Return /packs links or activity IDs for reread.',
    ],
  },
  {
    id: 'safe-results',
    eyebrow: 'Results',
    title: 'Chat results should teach where to verify',
    summary:
      'A good ChatGPT App response should say what it did, what is staged, what is blocked, and where the user can verify the result in /packs or the relevant route.',
    detail:
      'This is the same write/read discipline as the action guide, adapted for conversational operation.',
    reason:
      'Users should never have to trust a chat transcript when /packs and route readback can show the actual state.',
  },
] as const satisfies readonly DocsGuideCard[];
