/**
 * Thin re-export: living module path for historical specifying generators (frozen files must not be rewritten).
 *
 * Historical importers still use `./demo-shell-state.js`. Living
 * implementation is `projection-state.js`. Do not rewrite promoted-era
 * importers (§4.3 / §13.1).
 */
export * from './projection-state.js';
