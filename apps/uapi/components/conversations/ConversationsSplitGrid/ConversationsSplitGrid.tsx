"use client";

import React from "react";
import { ConversationsCard } from "@/components/conversations/ConversationsCard/ConversationsCard";

interface Chat {
  id: string;
  title: string;
  messages: any[];
}

interface SplitBox {
  id: string;
  chatId: string;
}

interface SplitGridProps {
  boxes: SplitBox[];
  chats: Chat[];
  activeSplitId: string | null;

  embedProcessLogs: boolean;
  renderLog: () => React.ReactNode;

  onSelectChatInBox: (boxId: string, chatId: string) => void;
  onActivateBox: (boxId: string) => void;
  onRemoveBox: (boxId: string) => void;

  onSend: (msg: string, tokens: any[], chatId: string) => void;
  renderTokenInMessage: (content: string, tokens?: any[]) => string;
  // not currently used – placeholder
  splitRefs?: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;

  /* Source selection */
  currentSource?: {
    repoSlug: string;
    branch?: string | null;
    commitSha?: string | null;
  };
  onSourceChange?: (cfg: {
    repoSlug: string;
    branch?: string | null;
    commitSha?: string | null;
  }) => void;
}

export function SplitGrid({
  boxes,
  chats,
  activeSplitId,
  embedProcessLogs,
  renderLog,
  onSelectChatInBox,
  onActivateBox,
  onRemoveBox,
  onSend,
  renderTokenInMessage,
  splitRefs,
  currentSource,
  onSourceChange,
}: SplitGridProps) {
  return (
    <div
      className="split-grid custom-scrollbar content-vis"
      style={{
        display: "grid",
        gridTemplateColumns:
          boxes.length === 1 ? "1fr" : "repeat(2, 1fr)",
        gridAutoRows: boxes.length <= 2 ? "1fr" : "50%",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {boxes.map(({ id, chatId }, idx) => {
        const chat = chats.find((c) => c.id === chatId) || {
          id: "",
          title: "New Conversation",
          messages: [],
        };

        return (
          <ConversationsCard
            key={id}
            id={id}
            chat={chat as any}
            chats={chats as any}
            active={activeSplitId === id}
            onSelectChat={(newChatId) => onSelectChatInBox(id, newChatId)}
            onClose={() => onRemoveBox(id)}
            showEmbeddedLogs={embedProcessLogs}
            renderLog={renderLog}
            splitRefCb={undefined}
            onSend={(msg, tokens) => {
              onActivateBox(id);
              onSend(msg, tokens, chatId);
            }}
            renderTokenInMessage={renderTokenInMessage}
            onActivate={() => onActivateBox(id)}
            currentSource={currentSource}
            onSourceChange={onSourceChange}
          />
        );
      })}
    </div>
  );
}
