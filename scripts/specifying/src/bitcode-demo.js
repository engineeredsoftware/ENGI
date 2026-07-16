/**
 * Thin re-export: living module path for historical specifying generators (frozen files must not be rewritten).
 *
 * Historical version-bound generators (promoted-era importers) still import
 * `./bitcode-demo.js`. Living implementation is `specifying-runtime.js`.
 * Historical generators keep their import paths; living implementation lives below (§4.3 / §13.1).
 */
export * from './specifying-runtime.js';
