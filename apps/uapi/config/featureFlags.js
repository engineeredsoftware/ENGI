"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLE_MEASURE = exports.ENABLE_ENHANCE_NEED_DEFINITION = exports.MOCK_USER_TEMPLATES_SCENARIO = exports.MOCK_USER_TEMPLATES = exports.MOCK_GITHUB_FILES_SCENARIO = exports.MOCK_GITHUB_FILES = exports.MOCK_GITHUB_COMMITS_SCENARIO = exports.MOCK_GITHUB_COMMITS = exports.MOCK_GITHUB_BRANCHES_SCENARIO = exports.MOCK_GITHUB_BRANCHES = exports.MOCK_GITHUB_ISSUES_SCENARIO = exports.MOCK_GITHUB_ISSUES = exports.MOCK_GITHUB_REPOS_SCENARIO = exports.MOCK_GITHUB_REPOS = exports.MOCK_GITHUB_ACCOUNTS_SCENARIO = exports.MOCK_GITHUB_ACCOUNTS = exports.MOCK_MEASURE_ITEMS_SCENARIO = exports.MOCK_MEASURE_ITEMS = exports.MOCK_MEASURE_HISTORY_SCENARIO = exports.MOCK_MEASURE_HISTORY = exports.MOCK_MEASURE_SCENARIO = exports.MOCK_CHAT_SCENARIO = exports.MOCK_CHAT_STREAM = exports.MOCK_CHECKOUT_SESSION = exports.MOCK_GET_TITLE = exports.MOCK_USER_AUXILLARIES_SCENARIO = exports.MOCK_USER_AUXILLARIES = exports.MOCK_MEASURE = exports.ENABLE_MOCKS = exports.MASTER_MOCK_MODE = void 0;
function envTrue(name) {
    return process.env[name] === 'true';
}
/** Master switch — turns on ENABLE_MOCKS and Auxillaries mock data. Default false. */
exports.MASTER_MOCK_MODE = envTrue('NEXT_PUBLIC_MASTER_MOCK_MODE');
/** Global mock gate. Default false. Forced true when MASTER_MOCK_MODE is true. */
exports.ENABLE_MOCKS = exports.MASTER_MOCK_MODE || envTrue('NEXT_PUBLIC_ENABLE_MOCKS');
/** Feature mock: only true if ENABLE_MOCKS and the feature env is "true". */
function featureMock(envName) {
    return exports.ENABLE_MOCKS && envTrue(envName);
}
exports.MOCK_MEASURE = featureMock('NEXT_PUBLIC_MOCK_MEASURE');
exports.MOCK_USER_AUXILLARIES = exports.ENABLE_MOCKS &&
    (exports.MASTER_MOCK_MODE || envTrue('NEXT_PUBLIC_MOCK_USER_AUXILLARIES'));
exports.MOCK_USER_AUXILLARIES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO || 'default';
exports.MOCK_GET_TITLE = featureMock('NEXT_PUBLIC_MOCK_GET_TITLE');
exports.MOCK_CHECKOUT_SESSION = featureMock('NEXT_PUBLIC_MOCK_CHECKOUT_SESSION');
exports.MOCK_CHAT_STREAM = featureMock('NEXT_PUBLIC_MOCK_CHAT_STREAM');
exports.MOCK_CHAT_SCENARIO = process.env.NEXT_PUBLIC_MOCK_CHAT_SCENARIO || 'default';
exports.MOCK_MEASURE_SCENARIO = process.env.NEXT_PUBLIC_MOCK_MEASURE_SCENARIO || 'default';
// Measure history and items (reserved for pipeline placeholder)
exports.MOCK_MEASURE_HISTORY = featureMock('NEXT_PUBLIC_MOCK_MEASURE_HISTORY');
exports.MOCK_MEASURE_HISTORY_SCENARIO = process.env.NEXT_PUBLIC_MOCK_MEASURE_HISTORY_SCENARIO || 'default';
exports.MOCK_MEASURE_ITEMS = featureMock('NEXT_PUBLIC_MOCK_MEASURE_ITEMS');
exports.MOCK_MEASURE_ITEMS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_MEASURE_ITEMS_SCENARIO || 'default';
// GitHub Selectors: accounts, repos, issues, branches, commits, files
exports.MOCK_GITHUB_ACCOUNTS = featureMock('NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS');
exports.MOCK_GITHUB_ACCOUNTS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS_SCENARIO || 'default';
exports.MOCK_GITHUB_REPOS = featureMock('NEXT_PUBLIC_MOCK_GITHUB_REPOS');
exports.MOCK_GITHUB_REPOS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_REPOS_SCENARIO || 'default';
exports.MOCK_GITHUB_ISSUES = featureMock('NEXT_PUBLIC_MOCK_GITHUB_ISSUES');
exports.MOCK_GITHUB_ISSUES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_ISSUES_SCENARIO || 'default';
exports.MOCK_GITHUB_BRANCHES = featureMock('NEXT_PUBLIC_MOCK_GITHUB_BRANCHES');
exports.MOCK_GITHUB_BRANCHES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_BRANCHES_SCENARIO || 'default';
exports.MOCK_GITHUB_COMMITS = featureMock('NEXT_PUBLIC_MOCK_GITHUB_COMMITS');
exports.MOCK_GITHUB_COMMITS_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_COMMITS_SCENARIO || 'default';
exports.MOCK_GITHUB_FILES = featureMock('NEXT_PUBLIC_MOCK_GITHUB_FILES');
exports.MOCK_GITHUB_FILES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_GITHUB_FILES_SCENARIO || 'default';
// User template preferences
exports.MOCK_USER_TEMPLATES = featureMock('NEXT_PUBLIC_MOCK_USER_TEMPLATES');
exports.MOCK_USER_TEMPLATES_SCENARIO = process.env.NEXT_PUBLIC_MOCK_USER_TEMPLATES_SCENARIO || 'default';
// Product feature toggles — default false (not mock-related)
exports.ENABLE_ENHANCE_NEED_DEFINITION = envTrue('NEXT_PUBLIC_ENABLE_ENHANCE_NEED_DEFINITION');
exports.ENABLE_MEASURE = envTrue('NEXT_PUBLIC_ENABLE_MEASURE');
