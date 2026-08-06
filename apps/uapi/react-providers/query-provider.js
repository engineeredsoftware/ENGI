"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryProvider = QueryProvider;
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
// Configure React Query client with optimal defaults
const queryClientOptions = {
    defaultOptions: {
        queries: {
            // Keep data fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry once on failure
            retry: 1,
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Use suspense for instant rendering with cached data
            suspense: false, // We'll enable per-query where needed
        },
    },
};
function QueryProvider({ children }) {
    // Create a new QueryClient instance for each request in SSR
    const [queryClient] = (0, react_1.useState)(() => new react_query_1.QueryClient(queryClientOptions));
    return (<react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>);
}
