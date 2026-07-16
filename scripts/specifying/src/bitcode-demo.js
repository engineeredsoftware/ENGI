/**
 * Compatibility re-export for frozen historical specifying modules.
 *
 * Historical version-bound generators (promoted-era importers) still import
 * `./bitcode-demo.js`. Living implementation is `specifying-runtime.js`.
 * Do not edit promoted-era importers to chase renames (§4.3 / §13.1).
 */
export * from './specifying-runtime.js';
