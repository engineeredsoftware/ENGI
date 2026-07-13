/**
 * Docs content module: sections conversations.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const conversationsSections = [
  {
    id: 'conversations-role',
    eyebrow: 'Conversations',
    title: 'Conversations are the rich write surface, not a separate product',
    summary:
      'The conversational workspace lets users draft Reads, attach source context, reference AssetPacks, choose destinations, and coordinate outputs while still writing back into source-safe route state.',
    detail:
      'The active Protocol treats conversations as a first-class interface because many high-quality technical Reads begin in natural language. The important boundary is that messages must normalize into proof readback evidence rather than remaining unstructured chat history.',
    reason:
      'This is how Bitcode can support ChatGPT-like workflows without losing protocol-grade auditability.',
    points: [
      'Source attachments, output destinations, AssetPack references, and Read-measurement intent should be structured.',
      'Conversation-started executions should become /packs-readable rows.',
      'Branching should preserve attachments and execution references.',
    ],
  },
  {
    id: 'history-and-branching',
    eyebrow: 'Continuity',
    title: 'Conversation history must remain persisted and branchable',
    summary:
      'A conversation that changes Read, source context, or AssetPack intent must be recoverable by later route and /packs reads.',
    detail:
      'The user should be able to start a conversation, attach source, receive a response, continue later, branch the thread, and still have the resulting execution evidence appear in the activity system.',
    reason:
      'Without persistence and branch continuity, chat would be a helpful drafting area but not a Bitcode interface.',
  },
] as const satisfies readonly DocsGuideCard[];
