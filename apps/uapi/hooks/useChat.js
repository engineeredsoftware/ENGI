"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChat = useChat;
const react_1 = require("react");
const wsMultiplex_1 = require("packages/client-utils/src/wsMultiplex");
const conversationStore_1 = require("packages/client-utils/src/state/conversationStore");
function useChat(chatId) {
    const { chats, receiveMessage } = (0, conversationStore_1.useConversationStore)();
    (0, react_1.useEffect)(() => {
        if (!chatId)
            return;
        const unsubPromise = wsMultiplex_1.wsMultiplex.subscribe(`/chat/${chatId}`, (payload) => {
            // Expect payload { id, type, content, timestamp, tokens }
            const msg = {
                ...payload,
                timestamp: new Date(payload.timestamp),
            };
            receiveMessage(chatId, msg);
        });
        return () => {
            unsubPromise.then((unsub) => unsub());
        };
    }, [chatId, receiveMessage]);
    const messages = chatId ? chats[chatId]?.messages || [] : [];
    // TODO: sendMessage implementation will POST or WS send
    const sendMessage = (content, tokens) => {
        if (!chatId)
            return;
        // optimistic add
        const msg = {
            id: crypto.randomUUID(),
            type: 'user',
            content,
            timestamp: new Date(),
            tokens,
            status: 'sending',
        };
        receiveMessage(chatId, msg);
        // backend send here (WS or fetch)
    };
    return { messages, sendMessage };
}
