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
      'Conversations let operators draft Readings, attach permitted source, reference DataPacks, choose destinations, and coordinate outputs while writing back into source-safe route state.',
    detail:
      'Protocol treats conversations as a first-class interface because strong technical demand often starts in natural language. Messages must normalize into proof-readback evidence rather than remaining unstructured chat history.',
    reason:
      'Bitcode can feel conversational without losing auditability or inventing a second product ledger.',
    points: [
      'Source attachments, destinations, DataPack references, and Read intent should be structured.',
      'Conversation-started work should become /exchange-readable activity.',
      'Branching should preserve attachments and execution references.',
    ],
  },
  {
    id: 'history-and-branching',
    eyebrow: 'Continuity',
    title: 'Conversation history must remain persisted and branchable',
    summary:
      'A conversation that changes Read, source context, or DataPack intent must be recoverable by later route and /exchange reads.',
    detail:
      'The user should be able to start a conversation, attach source, receive a response, continue later, branch the thread, and still have the resulting execution evidence appear in the activity system.',
    reason:
      'Without persistence and branch continuity, chat would be a helpful drafting area but not a Bitcode interface.',
  },
] as const satisfies readonly DocsGuideCard[];
