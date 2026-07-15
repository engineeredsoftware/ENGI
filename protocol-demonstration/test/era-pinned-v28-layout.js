/**
 * Era-pin for V28 commercial-MVP static product-surface witnesses.
 *
 * V28 `v28-mvp-qa.test.js` reads the historical layout
 * (`apps/uapi/components/base/bitcode/...`, `app/terminal/...`, monolith
 * `packages/generic-llms/package.json`). V48 sole-canon modularization moved
 * those carriers under `apps/uapi/components/{bitcode,packs,...}/` and nested
 * `packages/generic-llms/*` providers.
 *
 * Meta law (`BITCODE_SPECIFYING.md` §4.3 / §13.1): **old version checks never
 * change**. Do not rewrite V28 assertions to chase current paths. When the
 * current tree is the V48 realization, every V28 layout witness is skipped
 * WITH A REASON. On a tree that still holds the V28 layout, `SUPERSEDED` is
 * false and the frozen body runs unchanged.
 *
 * Living product-surface witnesses for the current pointer live in
 * `v48-product-layout-mvp.test.js`.
 */

import nodeTest from 'node:test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** True once the V48 sole-canon component layout is present. */
export const SUPERSEDED = existsSync(
  path.join(REPO_ROOT, 'apps/uapi/components/bitcode/btd/BtdTracker/BtdTracker.tsx'),
);

const SKIP_REASON =
  'era-pinned: superseded by V48 sole-canon layout (components/bitcode/* + nested generic-llms; Terminal retirement). Frozen V28 witnesses unchanged — see v48-product-layout-mvp.test.js for living checks.';

function eraPinnedTest(name, options, fn) {
  if (!SUPERSEDED) return nodeTest(name, options, fn);
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  return nodeTest(name, { ...(options || {}), skip: SKIP_REASON }, fn || (() => {}));
}

export default eraPinnedTest;
export { eraPinnedTest as test };
