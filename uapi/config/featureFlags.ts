// uapi/app/config/featureFlags.ts
// Feature flags for enabling mocks and other dev utilities
export const MASTER_MOCK_MODE = process.env.NEXT_PUBLIC_MASTER_MOCK_MODE === 'true';
export const ENABLE_MOCKS = MASTER_MOCK_MODE || process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true';
export const MOCK_MEASURE = process.env.NEXT_PUBLIC_MOCK_MEASURE === 'true';
export const MOCK_USER_AUXILLARIES =
  ENABLE_MOCKS && (MASTER_MOCK_MODE || process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES === 'true');
export const MOCK_USER_AUXILLARIES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO || 'default';
export const MOCK_GET_TITLE = process.env.NEXT_PUBLIC_MOCK_GET_TITLE === 'true';
export const MOCK_CHECKOUT_SESSION = process.env.NEXT_PUBLIC_MOCK_CHECKOUT_SESSION === 'true';
export const MOCK_CHAT_STREAM = process.env.NEXT_PUBLIC_MOCK_CHAT_STREAM === 'true';
export const MOCK_CHAT_SCENARIO = process.env.NEXT_PUBLIC_MOCK_CHAT_SCENARIO || 'default';
export const MOCK_MEASURE_SCENARIO = process.env.NEXT_PUBLIC_MOCK_MEASURE_SCENARIO || 'default';
// Measure history and items (reserved for pipeline placeholder)
export const MOCK_MEASURE_HISTORY = process.env.NEXT_PUBLIC_MOCK_MEASURE_HISTORY === 'true';
export const MOCK_MEASURE_HISTORY_SCENARIO = process.env.NEXT_PUBLIC_MOCK_MEASURE_HISTORY_SCENARIO || 'default';
export const MOCK_MEASURE_ITEMS = process.env.NEXT_PUBLIC_MOCK_MEASURE_ITEMS === 'true';
export const MOCK_MEASURE_ITEMS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_MEASURE_ITEMS_SCENARIO || 'default';
// GitHub Selectors: accounts, repos, issues, branches, commits, files
export const MOCK_GITHUB_ACCOUNTS = process.env.NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS === 'true';
export const MOCK_GITHUB_ACCOUNTS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS_SCENARIO || 'default';
export const MOCK_GITHUB_REPOS = process.env.NEXT_PUBLIC_MOCK_GITHUB_REPOS === 'true';
export const MOCK_GITHUB_REPOS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_REPOS_SCENARIO || 'default';
export const MOCK_GITHUB_ISSUES = process.env.NEXT_PUBLIC_MOCK_GITHUB_ISSUES === 'true';
export const MOCK_GITHUB_ISSUES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_ISSUES_SCENARIO || 'default';
export const MOCK_GITHUB_BRANCHES = process.env.NEXT_PUBLIC_MOCK_GITHUB_BRANCHES === 'true';
export const MOCK_GITHUB_BRANCHES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_BRANCHES_SCENARIO || 'default';
export const MOCK_GITHUB_COMMITS = process.env.NEXT_PUBLIC_MOCK_GITHUB_COMMITS === 'true';
export const MOCK_GITHUB_COMMITS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_COMMITS_SCENARIO || 'default';
export const MOCK_GITHUB_FILES = process.env.NEXT_PUBLIC_MOCK_GITHUB_FILES === 'true';
export const MOCK_GITHUB_FILES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_FILES_SCENARIO || 'default';
// User template preferences
export const MOCK_USER_TEMPLATES = process.env.NEXT_PUBLIC_MOCK_USER_TEMPLATES === 'true';
export const MOCK_USER_TEMPLATES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_USER_TEMPLATES_SCENARIO || 'default';

// V26 Feature Flags - disable features not ready for production
export const ENABLE_ENHANCE_NEED_DEFINITION = process.env.NEXT_PUBLIC_ENABLE_ENHANCE_NEED_DEFINITION === 'true';
export const ENABLE_MEASURE = process.env.NEXT_PUBLIC_ENABLE_MEASURE === 'true'; // Disabled for V26
