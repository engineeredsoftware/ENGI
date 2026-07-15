/**
 * Feature flags for mocks and incomplete product toggles.
 *
 * Law (defaults):
 * - Every *boolean* mock switch defaults to **false** unless the env is exactly `"true"`.
 * - Master mock / enable-mocks also default **false** (live GitHub, wallet, APIs).
 * - Feature-level mocks only activate when `ENABLE_MOCKS` is true (master forces enable).
 * - Scenario / tuning strings only apply when their parent mock is on; string defaults
 *   below are labels for mock-review runs, not production behavior.
 *
 * Live commercial local: leave all NEXT_PUBLIC_*_MOCK* unset or false.
 * Deterministic mock review: set MASTER or ENABLE_MOCKS + the features you want.
 */

function envTrue(name: string): boolean {
  return process.env[name] === 'true';
}

/** Master switch — turns on ENABLE_MOCKS and Auxillaries mock data. Default false. */
export const MASTER_MOCK_MODE = envTrue('NEXT_PUBLIC_MASTER_MOCK_MODE');

/** Global mock gate. Default false. Forced true when MASTER_MOCK_MODE is true. */
export const ENABLE_MOCKS =
  MASTER_MOCK_MODE || envTrue('NEXT_PUBLIC_ENABLE_MOCKS');

/** Feature mock: only true if ENABLE_MOCKS and the feature env is "true". */
function featureMock(envName: string): boolean {
  return ENABLE_MOCKS && envTrue(envName);
}

export const MOCK_MEASURE = featureMock('NEXT_PUBLIC_MOCK_MEASURE');
export const MOCK_USER_AUXILLARIES =
  ENABLE_MOCKS &&
  (MASTER_MOCK_MODE || envTrue('NEXT_PUBLIC_MOCK_USER_AUXILLARIES'));
export const MOCK_USER_AUXILLARIES_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO || 'default';
export const MOCK_GET_TITLE = featureMock('NEXT_PUBLIC_MOCK_GET_TITLE');
export const MOCK_CHECKOUT_SESSION = featureMock(
  'NEXT_PUBLIC_MOCK_CHECKOUT_SESSION',
);
export const MOCK_CHAT_STREAM = featureMock('NEXT_PUBLIC_MOCK_CHAT_STREAM');
export const MOCK_CHAT_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_CHAT_SCENARIO || 'default';
export const MOCK_MEASURE_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_MEASURE_SCENARIO || 'default';
// Measure history and items (reserved for pipeline placeholder)
export const MOCK_MEASURE_HISTORY = featureMock(
  'NEXT_PUBLIC_MOCK_MEASURE_HISTORY',
);
export const MOCK_MEASURE_HISTORY_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_MEASURE_HISTORY_SCENARIO || 'default';
export const MOCK_MEASURE_ITEMS = featureMock('NEXT_PUBLIC_MOCK_MEASURE_ITEMS');
export const MOCK_MEASURE_ITEMS_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_MEASURE_ITEMS_SCENARIO || 'default';
// GitHub Selectors: accounts, repos, issues, branches, commits, files
export const MOCK_GITHUB_ACCOUNTS = featureMock(
  'NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS',
);
export const MOCK_GITHUB_ACCOUNTS_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS_SCENARIO || 'default';
export const MOCK_GITHUB_REPOS = featureMock('NEXT_PUBLIC_MOCK_GITHUB_REPOS');
export const MOCK_GITHUB_REPOS_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_GITHUB_REPOS_SCENARIO || 'default';
export const MOCK_GITHUB_ISSUES = featureMock('NEXT_PUBLIC_MOCK_GITHUB_ISSUES');
export const MOCK_GITHUB_ISSUES_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_GITHUB_ISSUES_SCENARIO || 'default';
export const MOCK_GITHUB_BRANCHES = featureMock(
  'NEXT_PUBLIC_MOCK_GITHUB_BRANCHES',
);
export const MOCK_GITHUB_BRANCHES_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_GITHUB_BRANCHES_SCENARIO || 'default';
export const MOCK_GITHUB_COMMITS = featureMock(
  'NEXT_PUBLIC_MOCK_GITHUB_COMMITS',
);
export const MOCK_GITHUB_COMMITS_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_GITHUB_COMMITS_SCENARIO || 'default';
export const MOCK_GITHUB_FILES = featureMock('NEXT_PUBLIC_MOCK_GITHUB_FILES');
export const MOCK_GITHUB_FILES_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_GITHUB_FILES_SCENARIO || 'default';
// User template preferences
export const MOCK_USER_TEMPLATES = featureMock(
  'NEXT_PUBLIC_MOCK_USER_TEMPLATES',
);
export const MOCK_USER_TEMPLATES_SCENARIO =
  process.env.NEXT_PUBLIC_MOCK_USER_TEMPLATES_SCENARIO || 'default';

// Product feature toggles — default false (not mock-related)
export const ENABLE_ENHANCE_NEED_DEFINITION = envTrue(
  'NEXT_PUBLIC_ENABLE_ENHANCE_NEED_DEFINITION',
);
export const ENABLE_MEASURE = envTrue('NEXT_PUBLIC_ENABLE_MEASURE');
