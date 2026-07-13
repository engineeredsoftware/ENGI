# @bitcode/conversations

Conversation domain types, validation, agent substrate, and terminal conversation
system prompt ownership for commercial Bitcode interfaces.

> BC alias: `@bitcode/conversations-generics`

## Naming

Plain `conversations` — not `*-generics` — because there is no separate
`generic-conversations/*` implementor family. Types and helpers live here;
UI lives under `uapi/components/conversations/`; routes under `packages/api`
and `uapi/app/api/conversations/*`.

## Owns

- Conversation / message / attachment domain types and validation
- Conversation agent abstractions
- Bitcode terminal conversation system prompt carrier

## Does not own

- Persistence commits (API routes + ORM)
- Fullscreen chat UX (uapi experience components)
- PromptPart raw library (`@bitcode/prompts`)

```ts
import type { Conversation, ConversationMessage } from '@bitcode/conversations';
// or BC: from '@bitcode/conversations-generics'
```
