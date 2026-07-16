"use client";

import React from "react";
import Select from "react-select";
import RichTextInput from "@/components/conversations/ConversationsRichTextInput/ConversationsRichTextInput";
import ConversationsGitHubSourceSelector from "@/components/conversations/ConversationsGithubSourceSelector/ConversationsGitHubSourceSelector";
import { glassyStyles, glassyPillStyles } from "@/components/bitcode/selects/GlassySelectStyles/glassy-select-styles";
import { NoOptionsMessage } from "@/components/bitcode/pipeline/SelectComponents/SelectComponents";

import { motion } from "framer-motion";
import { CodeIcon, ReloadIcon } from "@radix-ui/react-icons";
import "@/styles/conversations/conversation-card.css";

interface MessageToken {
  id: string;
  type: "evidence_document" | "shippable" | "attachment" | "source" | "command" | "destination" | "pipeline_run";
  text: string;
  data: any;
}

interface Message {
  id: string;
  type: "agent" | "user" | "divider";
  content: string;
  timestamp: Date;
  tokens?: MessageToken[];
  status?: "sending" | "sent" | "error";
  actions?: {
    type: "codeChange" | "prCreated" | "issueCreated";
    title: string;
    description?: string;
    url?: string;
  }[];
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface ConversationsCardProps {
  chat: Chat;
  /** active card id */
  active: boolean;
  /** split card id (for closing) */
  id: string;
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  onClose: () => void;

  /* Embed logs */
  showEmbeddedLogs: boolean;
  renderLog: () => React.ReactNode;

  /* refs / input */
  splitRefCb?: (el: HTMLTextAreaElement | null) => void;
  onSend: (msg: string, tokens: MessageToken[]) => void;
  /* helpers */
  renderTokenInMessage: (content: string, tokens?: MessageToken[]) => string;

  /**
   * Callback to inform parent grid that this card has been interacted with and
   * should be considered the "active" split. This is required so that, when
   * the Conversations panel is in *non-embedded* log mode, clicking anywhere in a
   * conversation card correctly swaps the main process-log panel on the right
   * to the focused conversation. If not provided we noop so existing callers
   * outside of split-view don’t break.
   */
  onActivate?: () => void;

  /** GitHub source selection (optional) */
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

export function ConversationsCard({
  chat,
  chats,
  active,
  id,
  onSelectChat,
  onClose,
  showEmbeddedLogs,
  renderLog,
  splitRefCb,
  onSend,
  renderTokenInMessage,
  onActivate,
  currentSource,
  onSourceChange,
}: ConversationsCardProps) {
  return (
    <div
      onClick={() => {
        if (onActivate) {
          onActivate();
        }
        onSelectChat(chat.id);
      }}
      className={`conversation-card ${active ? "active" : ""}`}
      style={{
        position: "relative",
        backgroundColor: "#0a1428",
        padding: "0.5rem",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header bar – selectors (left), unread/message count (center), convo picker + close (right) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left – source selectors */}
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          {onSourceChange && (
            <ConversationsGitHubSourceSelector
              initialRepoSlug={currentSource?.repoSlug}
              initialBranch={currentSource?.branch ?? undefined}
              initialCommit={currentSource?.commitSha ?? undefined}
              onChange={onSourceChange}
              variant="icon"
            />
          )}
        </div>

        {/* Center – message count */}
        <div style={{ flex: 1, textAlign: "center", fontSize: "0.8rem", color: "#ccc" }}>
          {chat.messages.length} messages
        </div>

        {/* Right – conversation selector + close */}
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <Select
            value={{ label: chat.title, value: chat.id }}
            options={chats.map((c) => ({ label: c.title, value: c.id }))}
            onChange={(opt) => {
              const newId = opt?.value || chat.id;
              if (onActivate) {
                onActivate();
              }
              onSelectChat(newId);
            }}
            isSearchable
            styles={{
              ...glassyStyles,
              control: (base: any, state: any) => ({
                ...glassyStyles.control(base, state),
                ...glassyPillStyles,
              }),
            }}
            components={{ NoOptionsMessage }}
            placeholder="Conversation"
          />

          {/* Close split – inline with picker (no overlap) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close split"
          >
            ×
          </button>
        </div>
      </div>

      {/* Main body + (optional) logs column */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Messages + Input column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Messages */}
          <div
            className="fullscreen-messages custom-scrollbar"
            style={{ flex: 1, overflowY: "auto" }}
          >
            {chat.messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message-container ${
                  message.type === "user" ? "message-user" : "message-agent"
                }`}
              >
                <div className="message-bubble">
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{
                      __html: renderTokenInMessage(message.content, message.tokens),
                    }}
                  />

                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="message-actions">
                      {message.actions.map((action, index) => (
                        <div
                          key={index}
                          className="action-item"
                          onClick={() =>
                            action.url
                              ? window.open(action.url, "_blank")
                              : console.log("Action clicked", action)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {action.type === "codeChange" && (
                            <CodeIcon className="action-icon" />
                          )}
                          <div className="action-content">
                            <div className="action-title">{action.title}</div>
                            {action.description && (
                              <div className="action-description">
                                {action.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Status indicator for user messages */}
                  {message.type === "user" && message.status && (
                    <div className="message-status">
                      {message.status === "sending" && (
                        <ReloadIcon className="status-icon status-sending" />
                      )}
                      {message.status === "sent" && (
                        <svg
                          className="status-icon status-sent"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {message.status === "error" && (
                        <svg
                          className="status-icon status-error"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input row */}
          <div style={{ padding: "0.5rem", background: "rgba(0,0,0,0.4)" }}>
            <RichTextInput
              onSend={(msg, tokens) => {
                if (onActivate) {
                  onActivate();
                }
                onSend(msg, tokens);
              }}
            />
          </div>
        </div>

        {/* Logs + settle delivery / evidence surfaces */}
        {showEmbeddedLogs && (
          <div
            className="embedded-process-log border-l border-gray-700 custom-scrollbar"
            style={{
              width: "260px",
              minWidth: "220px",
              maxWidth: "320px",
              height: "100%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 3, overflowY: "auto", overflowX: "hidden" }}>
              {renderLog()}
            </div>
            <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid rgba(55,65,81)", padding: "0.5rem", backgroundColor: "#0a1428" }}>
              <h3 style={{ fontSize: "0.8rem", color: "#ccc", marginBottom: "0.5rem" }}>
                Delivery & evidence
              </h3>
              {chat.messages.flatMap(m => m.actions || []).length > 0 ? (
                chat.messages.flatMap(m => m.actions || []).map((action, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.25rem 0" }}>
                    <span style={{ fontSize: "0.875rem", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {action.title}
                    </span>
                    {action.url && (
                      <a href={action.url} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontSize: "0.875rem" }}>
                        View
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  No settle delivery or evidence surfaces yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
