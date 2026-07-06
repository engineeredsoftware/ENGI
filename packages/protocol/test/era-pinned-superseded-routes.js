/**
 * Era-pin for superseded product-route realization proofs.
 *
 * V48 Gate 3 pluralized the product routes (`/deposit` -> `/deposits`,
 * `/read` -> `/reads`) and MOVED the client + route-model files into
 * `uapi/app/deposits/` and `uapi/app/reads/` (the old paths are redirect-only
 * shims). The V43-V47 canonical proofs read the historical singular-route
 * source in place and assert on its literal content, so once the pluralized
 * realization lands they are validating a superseded era against source that
 * has legitimately moved forward.
 *
 * Rather than mutate the frozen historical proofs to chase the current routes
 * (they exist to attest their own era, and the `.bitcode/` artifacts + promoted
 * spec families keep the historical route names), these proofs are ERA-PINNED:
 * a superseded proof file imports `test` from here instead of `node:test`, and
 * every test it registers is skipped WITH A REASON once the current (plural)
 * realization is present. On the promoted V47 canon — where the singular
 * realization still exists — `SUPERSEDED` is false and the proofs run normally.
 *
 * This mirrors the `.mjs` gate checkers' era-pinning (pointer-gated in the
 * workflow); the difference is that the protocol test suite runs
 * `node --test test/*.test.js` unconditionally, so the pin lives at the import.
 */

import nodeTest from 'node:test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** True once the V48 plural-route realization is present in the working tree. */
export const SUPERSEDED = existsSync(
  path.join(REPO_ROOT, 'uapi/app/deposits/DepositPageClient.tsx'),
);

const SKIP_REASON =
  'era-pinned: superseded by V48 Gate 3 route pluralization (/deposit->/deposits, /read->/reads)';

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
