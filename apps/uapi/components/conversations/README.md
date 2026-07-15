# Conversations experience (`Conversations*`)

Conversations structure persists; full commercial web experience is deferred
post-V48. Imports Bitcode only. Page shell: `apps/uapi/app/conversations/`.

Do not expand product scope in the product-eradication workstream beyond
relocation and naming cleanup.

## Layout

Named component directories under `apps/uapi/components/conversations/`.

### Overlay shell

```
ConversationsOverlay/
  ConversationsOverlay.tsx           # orchestration only (<500)
  conversations-overlay-types.ts
  conversations-overlay-constants.ts
  conversations-overlay-helpers.ts
  ConversationsOverlayHeader.tsx     # toolbar actions
  ConversationsOverlayMainContent.tsx# history + chat + process log + details
  ConversationsOverlaySidePanels.tsx # source / handoff / privacy / telemetry / writing
  hooks/use-conversation-hydration.ts
  hooks/use-conversation-send.ts     # stream append/finalize/send/retry
  hooks/use-conversation-view-mode.ts# fullscreen/split/panel/source state
```

### Rich text input

```
ConversationsEnhancedRichTextInput/
  ConversationsEnhancedRichTextInput.tsx
  conversations-enhanced-rich-text-input.types.ts
  conversations-enhanced-rich-text-helpers.ts  # icons, serialize, render HTML
```

### GitHub source selector

```
ConversationsGithubSourceSelector/
  ConversationsGitHubSourceSelector.tsx  # full/compact/icon render variants
  hooks/use-github-source-selection.ts   # cascade selection state
```

### Utilities

```
utilities/
  rich-response-factory.ts           # factory + re-exports
  rich-response-edge-case.ts         # render failure / edge response helpers
  edge-case-handler.ts               # public facade
  edge-case/
    conversation-edge-case-handler.ts  # thin class delegating to concerns
    network.ts | data-integrity.ts | performance.ts | validation.ts
```

Other units: chat shell/messages/input, waterfall, source selectors, pickers,
hooks (`UseChatState`, `UseSSEConnection`, `UsePipelineState`, …), models.
