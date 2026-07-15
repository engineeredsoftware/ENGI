/**
 * Canonical locations for Bitcode specification documents (V48+).
 * All living SPEC family files live under .specifications/ at the repo root.
 */
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

export const SPECIFICATIONS_DIR = '.specifications';

/**
 * @param {string} repoRoot
 * @param {string} relativeName basename or path under .specifications/
 */
export function specificationPath(repoRoot, relativeName) {
  const cleaned = String(relativeName || '')
    .replace(/^\.?specifications\//u, '')
    .replace(/^\//u, '');
  return path.join(repoRoot, SPECIFICATIONS_DIR, cleaned);
}

/**
 * @param {string} repoRoot
 * @returns {string} absolute path to active pointer file
 */
export function bitcodeSpecPointerPath(repoRoot) {
  const under = specificationPath(repoRoot, 'BITCODE_SPEC.txt');
  if (existsSync(under)) return under;
  // Historical fallback if pointer still existed at repo root.
  const root = path.join(repoRoot, 'BITCODE_SPEC.txt');
  if (existsSync(root)) return root;
  return under;
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
export function readBitcodeSpecPointer(repoRoot) {
  return readFileSync(bitcodeSpecPointerPath(repoRoot), 'utf8').trim();
}

/**
 * Relative path from repo root used in file lists / assertions.
 * @param {string} relativeName
 */
export function specificationRelative(relativeName) {
  const cleaned = String(relativeName || '')
    .replace(/^\.?specifications\//u, '')
    .replace(/^\//u, '');
  return path.posix.join(SPECIFICATIONS_DIR, cleaned);
}
