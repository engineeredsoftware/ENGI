# Conversations experience (`Conversations*`)

Conversations structure persists; full commercial web experience is deferred
post-V48. Imports Bitcode only. Page shell: `uapi/app/conversations/`.

Do not expand product scope in the Terminal-eradication workstream beyond
relocation and naming cleanup.

## Layout

Named component directories under `uapi/components/conversations/`.

### Overlay shell

```
ConversationsOverlay/
  ConversationsOverlay.tsx           # shell (state + composition)
  conversations-overlay-types.ts
  conversations-overlay-constants.ts
  conversations-overlay-helpers.ts
  ConversationsOverlaySidePanels.tsx # source / handoff / privacy / telemetry / writing
  hooks/use-conversation-hydration.ts
```

### Rich text input

```
ConversationsEnhancedRichTextInput/
  ConversationsEnhancedRichTextInput.tsx
  conversations-enhanced-rich-text-input.types.ts
  conversations-enhanced-rich-text-helpers.ts
```

### Utilities

```
utilities/
  rich-response-factory.ts           # factory + re-exports
  rich-response-edge-case.ts         # render failure / edge response helpers
  edge-case-handler.ts               # public facade
  edge-case/
    conversation-edge-case-handler.ts
    network.ts | data-integrity.ts | performance.ts | validation.ts
```

Other units: chat shell/messages/input, waterfall, source selectors, pickers,
hooks (`UseChatState`, `UseSSEConnection`, `UsePipelineState`, …), models.
