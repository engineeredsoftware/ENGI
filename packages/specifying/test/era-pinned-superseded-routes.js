/**
 * Era-pin for superseded product-route realization proofs.
 *
 * V48 Gate 3 pluralized the product routes (`/deposit` -> `/deposits`,
 * `/read` -> `/reads`). Clients live under `apps/uapi/components/{deposits,reads}/`
 * with thin `apps/uapi/app/{deposits,reads}/page.tsx` shells (no app-level re-export
 * duals). The V43-V47 canonical proofs read the historical singular-route
 * source in place and assert on its literal content, so once the pluralized
 * realization lands they are validating a superseded era against source that
 * has legitimately moved forward.
 *
 * Meta law (`BITCODE_SPECIFYING.md` §4.3 / §13.1): **old version checks never
 * change**; promoted proofs attest **canon at that time**. Do not rewrite these
 * files to chase current routes/packages. ERA-PIN instead: a superseded proof
 * imports `test` from here instead of `node:test`, and every test is skipped
 * WITH A REASON once the current realization is present. On a tree that still
 * holds the historical realization, `SUPERSEDED` is false and proofs run
 * unchanged.
 *
 * This mirrors the `.mjs` gate checkers' era-pinning (pointer-gated in the
 * workflow); the difference is that the specifying package test suite runs
 * `node --test test/*.test.js` unconditionally, so the pin lives at the import.
 */

import nodeTest from 'node:test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** True once the V48 plural-route realization is present in the working tree. */
export const SUPERSEDED = existsSync(
  path.join(
    REPO_ROOT,
    'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  ),
);

const SKIP_REASON =
  'era-pinned: superseded by V48 sole-canon realization (plural product routes, Terminal retirement, components/* layout, hierarchy packages)';

/**
 * A `node:test` `test` shim. When the realization is superseded it registers
 * every test as skipped (carrying the reason); otherwise it is `node:test`'s
 * `test` unchanged. Handles the `(name)`, `(name, fn)`, and
 * `(name, options, fn)` call signatures.
 */
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
