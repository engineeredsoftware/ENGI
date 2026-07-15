"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVCSIssues = useVCSIssues;
const react_1 = require("react");
/**
 * Hook for fetching issues and PRs from VCS API
 * Follows the same pattern as useVCSSelections
 */
function useVCSIssues(provider, owner, repo) {
    const [issuesAndPRs, setIssuesAndPRs] = (0, react_1.useState)([]);
    const [isLoadingIssues, setIsLoadingIssues] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!provider || !owner || !repo) {
            setIssuesAndPRs([]);
            return;
        }
        const fetchIssues = async () => {
            setIsLoadingIssues(true);
            setError(null);
            try {
                console.log('[useVCSIssues] Fetching issues for:', { provider, owner, repo });
                const response = await fetch(`/api/vcs?resource=issues&provider=${provider}&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || 'Failed to fetch issues and PRs');
                }
                const data = await response.json();
                console.log('[useVCSIssues] Received data:', data);
                // Format the issues/PRs for the IssueSelector component
                const formatted = (data.issues || []).map((item) => ({
                    id: String(item.number),
                    title: item.title,
                    isPR: !!item.pull_request,
                    url: item.url || item.html_url || ''
                }));
                setIssuesAndPRs(formatted);
            }
            catch (err) {
                console.error('[useVCSIssues] Error:', err);
                setError(err.message);
            }
            finally {
                setIsLoadingIssues(false);
            }
        };
        fetchIssues();
    }, [provider, owner, repo]);
    return {
        issuesAndPRs,
        isLoadingIssues,
        error
    };
}
