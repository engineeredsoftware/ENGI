"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConversationPages = useConversationPages;
const infinite_1 = __importDefault(require("swr/infinite"));
const react_1 = require("react");
const PAGE_SIZE = 25;
function fetcher(url) {
    return fetch(url, { credentials: 'include' }).then(res => {
        if (!res.ok)
            throw new Error(res.statusText);
        return res.json();
    });
}
/**
 * React hook that wraps the new /api/conversations endpoint with infinite
 * loading and optional search.
 *
 * Updated to use the new first-class conversations API.
 */
function useConversationPages(searchQuery) {
    const getKey = (pageIndex, previousPageData) => {
        if (previousPageData && !previousPageData.hasMore)
            return null; // reached end
        const cursorParam = pageIndex === 0 ? '' : `&cursor=${encodeURIComponent(previousPageData.nextCursor)}`;
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        return `/api/conversations?limit=${PAGE_SIZE}${cursorParam}${searchParam}`;
    };
    const swr = (0, infinite_1.default)(getKey, fetcher, {
        revalidateFirstPage: false,
    });
    const conversations = (0, react_1.useMemo)(() => (swr.data ? swr.data.flatMap((p) => p.data) : []), [swr.data]);
    return { ...swr, conversations };
}
