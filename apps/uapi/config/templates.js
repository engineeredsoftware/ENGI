"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
exports.templates = {
    pullRequests: [
        {
            id: 'pr-quick-todo',
            name: 'Quick TODO PR',
            text: 'an opened pull request that completes a simple TODO item from the codebase'
        },
        {
            id: 'pr-feat',
            name: 'New Feature PR',
            text: `# Feature: __[FEATURE_NAME]__

## Definition of Read
- [ ] Implemented __[CORE_FUNCTIONALITY]__ that solves __[BUSINESS_NEED]__
- [ ] Added tests covering critical paths
- [ ] Updated relevant documentation
- [ ] Code follows project standards
- [ ] Passes CI/CD pipeline
- [ ] Reviewed by at least one team member

## Implementation Notes
- Key files changed: __[KEY_FILES]__
- Closes #__[ISSUE_NUMBER]__`
        },
        {
            id: 'pr-refactor',
            name: 'Code Refactor PR',
            text: `# Refactor: __[AREA]__

## Definition of Read
- [ ] Improved __[CODE_QUALITY_ASPECT]__ without changing external behavior
- [ ] Before/after metrics: __[METRICS]__
- [ ] All tests pass with same coverage
- [ ] No new bugs introduced
- [ ] Code is more maintainable/readable
- [ ] Performance impact verified

## Key Changes
- __[PRIMARY_CHANGE]__
- __[SECONDARY_CHANGE]__`
        },
        {
            id: 'pr-bug',
            name: 'Bug Fix PR',
            text: `# Fix: __[BUG_TITLE]__

## Definition of Read
- [ ] Root cause identified: __[ROOT_CAUSE]__
- [ ] Fix implemented in __[LOCATION]__
- [ ] Added regression test that would have caught this bug
- [ ] Verified fix in __[ENVIRONMENT]__
- [ ] No new issues introduced
- [ ] Updated documentation if needed

## Reproduction Steps
1. __[STEP_1]__
2. __[STEP_2]__

Fixes #__[ISSUE_NUMBER]__`
        }
    ],
};
