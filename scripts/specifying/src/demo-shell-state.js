/**
 * Compatibility re-export for frozen historical specifying modules.
 *
 * Historical importers still use `./demo-shell-state.js`. Living
 * implementation is `projection-state.js`. Do not rewrite promoted-era
 * importers (§4.3 / §13.1).
 */
export * from './projection-state.js';
