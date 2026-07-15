#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{ version?: string, commit?: string, repoRoot?: string, help?: boolean }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--version') args.version = argv[++index];
    else if (arg === '--commit') args.commit = argv[++index];
    else if (arg === '--repo-root') args.repoRoot = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/prepare-bitcode-spec-family-promotion.mjs --version V31 --commit <sha> [--repo-root <path>]',
      '',
      'Rewrites the hand-authored spec family status truth for canonical promotion.',
      'Currently implemented for V21, V22, V23, V24, V25, V28, V29, V30, V31, V32, V33, V34, V35, V36, V37, V38, V39, V40, V41, V42, V43, V44, V45, and V46.'
    ].join('\n')
  );
}

/**
 * @param {string} content
 */
function extractStatusSection(content) {
  const match = content.match(/(^## Status\s*\n)([\s\S]*?)(?=^##\s)/m);
  if (!match) {
    throw new Error('File is missing a top-level "## Status" section.');
  }
  return {
    prefix: match[1],
    body: match[2],
    start: match.index,
    end: match.index + match[0].length
  };
}

/**
 * @param {string} body
 * @param {string} label
 * @param {string} value
 * @param {{ afterLabel?: string }} [options]
 */
function upsertStatusValue(body, label, value, options = {}) {
  const line = `- ${label}: ${value}`;
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(`^- ${escaped}: .*$`, 'm');
  if (matcher.test(body)) {
    return body.replace(matcher, line);
  }
  const lines = body.split('\n');
  if (options.afterLabel) {
    const afterPrefix = `- ${options.afterLabel}:`;
    const index = lines.findIndex((entry) => entry.startsWith(afterPrefix));
    if (index >= 0) {
      lines.splice(index + 1, 0, line);
      return lines.join('\n');
    }
  }
  const insertIndex = lines.findLastIndex((entry) => entry.startsWith('- '));
  if (insertIndex >= 0) {
    lines.splice(insertIndex + 1, 0, line);
    return lines.join('\n');
  }
  lines.push(line);
  return lines.join('\n');
}

/**
 * @param {string} content
 * @param {Record<string, string>} values
 */
function rewriteStatusValues(content, values) {
  const section = extractStatusSection(content);
  let body = section.body;
  for (const [label, value] of Object.entries(values)) {
    const afterLabel = label === 'Canonical proof-source commit' ? 'Current canonical/latest target' : undefined;
    body = upsertStatusValue(body, label, value, afterLabel ? { afterLabel } : {});
  }
  return `${content.slice(0, section.start)}${section.prefix}${body}${content.slice(section.end)}`;
}

/**
 * @param {string} content
 * @param {string} heading
 * @returns {string}
 */
function rewritePromotedParityTableJudgments(content, heading) {
  const headingPattern = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
  const headingMatch = content.match(headingPattern);
  if (!headingMatch || typeof headingMatch.index !== 'number') return content;

  const sectionStart = headingMatch.index;
  const nextHeadingMatch = content.slice(sectionStart + headingMatch[0].length).match(/^##\s/m);
  const sectionEnd = nextHeadingMatch
    ? sectionStart + headingMatch[0].length + nextHeadingMatch.index
    : content.length;
  const section = content.slice(sectionStart, sectionEnd);
  const lines = section.split('\n');
  const headerIndex = lines.findIndex((line) => line.trim().startsWith('|'));
  if (headerIndex < 0) return content;

  const headers = lines[headerIndex].split('|').slice(1, -1).map((cell) => cell.trim());
  const judgmentIndex = headers.findIndex((header) => header === 'Judgment');
  if (judgmentIndex < 0) return content;

  const rewrittenLines = lines.map((line, index) => {
    if (index <= headerIndex + 1 || !line.trim().startsWith('|')) return line;
    const cells = line.split('|');
    const cellIndex = judgmentIndex + 1;
    if (!cells[cellIndex] || cells[cellIndex].trim() !== 'drafted') return line;
    cells[cellIndex] = ' closed ';
    return cells.join('|');
  });

  return `${content.slice(0, sectionStart)}${rewrittenLines.join('\n')}${content.slice(sectionEnd)}`;
}

/**
 * @param {string} content
 * @param {string} version
 * @returns {string}
 */
function rewritePromotedParityJudgments(content, version) {
  return [
    `${version} implementation matrix`,
    `${version} implementation checklist`
  ].reduce((rewritten, heading) => rewritePromotedParityTableJudgments(rewritten, heading), content);
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV45PromotedSourceOfTruthHierarchy(content, version) {
  if (version !== 'V45') return content;
  return content.replace(
    [
      '`BITCODE_SPEC.txt` points to `V44`; V44 remains active promoted canon.',
      '`BITCODE_SPEC_V45.md`, `BITCODE_SPEC_V45_DELTA.md`,',
      '`BITCODE_SPEC_V45_NOTES.md`, and `BITCODE_SPEC_V45_PARITY_MATRIX.md` are V45',
      'draft specification-family material. The V45 formal specification family is the',
      'only authority for the next implementation parity audit, but it is not active',
      'canon and cannot authorize source disclosure, settlement, rights transfer, or',
      'implementation behavior until V45 promotion.'
    ].join('\n'),
    [
      '`BITCODE_SPEC.txt` points to `V45`; V45 is the active promoted Bitcode canon.',
      '`BITCODE_SPEC_V45.md`, `BITCODE_SPEC_V45_DELTA.md`,',
      '`BITCODE_SPEC_V45_NOTES.md`, and `BITCODE_SPEC_V45_PARITY_MATRIX.md` are the',
      'promoted V45 specification-family material. The V45 formal specification family',
      'is active canon and authorizes implementation behavior only through the',
      'source-safe, entitlement-bound, proof-backed boundaries it states.'
    ].join('\n')
  );
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV45PromotedParityMatrix(content, version) {
  if (version !== 'V45') return content;
  return content
    .replace(
      'source-grounded implementation parity audit completed from the formal V45 draft specification; V44 remains active canon until V45 promotion',
      'canonical promotion complete; V45 implementation parity is closed from the formal V45 specification and V45 is active canon'
    )
    .replace(
      'V45 formal law is supported by substantial V39-V44 implementation surfaces, but no accepted row is fully closed for V45 promotion until grouped implementation, proof, interface, rehearsal, and promotion gates below close',
      'V45 formal law is closed by accepted implementation, proof, interface, rehearsal, and promotion gates; generated proof and workflow receipts are aligned'
    )
    .replace(
      'V45 parity audit and grouped closure-gate authorization',
      'V45 canonical parity ledger for knowledge commoditization protocol precision'
    )
    .replace(
      'This matrix is the V45 Gate 11 source-grounded implementation parity audit. It\nreplaces the Gate 10 shell with source-grounded findings across source code,\ntests, generated artifacts, workflows, documentation, and product interfaces.\nThe matrix does not promote V45 and does not itself implement runtime\nbehavior. It authorizes the grouped closure gates required before V45 can be\npromoted.',
      'This matrix is the promoted V45 source-grounded implementation parity ledger. It\nrecords accepted source code, tests, generated artifacts, workflows,\ndocumentation, and product-interface evidence for the V45 knowledge\ncommoditization canon.'
    )
    .replaceAll('| substantially advanced |', '| closed |')
    .replaceAll('| spec closed; source gap |', '| closed |');
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV47PromotedSourceOfTruthHierarchy(content, version) {
  if (version !== 'V47') return content;
  return content.replace(
    [
      '`BITCODE_SPEC.txt` points to `V46`; V46 is the active promoted Bitcode canon.',
      '`BITCODE_SPEC_V47.md`, `BITCODE_SPEC_V47_DELTA.md`,',
      '`BITCODE_SPEC_V47_NOTES.md`, and `BITCODE_SPEC_V47_PARITY_MATRIX.md` are draft',
      'V47 material until V47 promotion. V47 authorizes implementation only gate by',
      'gate through accepted parity, generated proof artifacts, tests, and promotion',
      'readiness.'
    ].join('\n'),
    [
      '`BITCODE_SPEC.txt` points to `V47`; V47 is the active promoted Bitcode canon.',
      '`BITCODE_SPEC_V47.md`, `BITCODE_SPEC_V47_DELTA.md`,',
      '`BITCODE_SPEC_V47_NOTES.md`, and `BITCODE_SPEC_V47_PARITY_MATRIX.md` are the',
      'promoted V47 specification-family material. The V47 formal specification family',
      'is active canon and authorizes implementation behavior only through the',
      'source-safe, measurement-before-price, proof-backed launch boundaries it',
      'states.'
    ].join('\n')
  );
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV47PromotedDraftPosture(content, version) {
  if (version !== 'V47') return content;
  return content
    .replaceAll('V47 draft work', 'V47 promoted canon work')
    .replaceAll('V47 formal draft', 'V47 formal canon')
    .replaceAll('V47 remains draft', 'V47 is active canon')
    .replaceAll('until V47 promotion', 'through V47 promotion')
    .replaceAll('before V47 can promote', 'before V47 promotion closure')
    .replaceAll('V46 remains active canon until V47 promotion', 'V47 is active canon after promotion workflow validation')
    .replaceAll('V46 remains active canon while V47 scopes website commercial testnet launch readiness', 'V47 is the active promoted commercial website testnet launch canon')
    .replaceAll('V46 remains the active pointer', 'V47 holds the active pointer')
    .replaceAll('while V46 remains active canon', 'under promoted V47 canon')
    .replaceAll('V46 remains active canon during V47 draft work.', 'V47 is active canon after promotion workflow validation.')
    .replaceAll('Canonical pointer: `BITCODE_SPEC.txt` -> `V46`', 'Canonical pointer: `BITCODE_SPEC.txt` -> `V47`')
    .replaceAll('Active canonical anchor: `BITCODE_SPEC_V46.md`', 'Active canonical anchor: `BITCODE_SPEC_V47.md`')
    .replaceAll('Active generated proof appendix: `BITCODE_SPEC_V46_PROVEN.md`', 'Active generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md`')
    .replaceAll('V47 state: draft opening for commercial website testnet launch readiness; V46 remains active canon', 'V47 state: canonical promotion complete; V47 is the active commercial website testnet launch canon')
    .replaceAll('V47 state: draft parity opening; V46 remains active canon while V47 scopes website commercial testnet launch readiness', 'V47 state: canonical promotion complete; V47 parity truth, generated launch artifacts, browser proof, staging-testnet rehearsal, gate closure, and promotion automation are aligned')
    .replaceAll('V47 is the active draft target opened from active V46 posture.', 'V47 is the active promoted canon over the prior V46 anchor.')
    .replaceAll('V46 remains active canon through V47 promotion.', 'V47 replaced V46 as active canon through the promotion workflow.')
    .replaceAll('V46 remains active canon during V47 promoted canon work.', 'V47 is active canon; V46 is the prior promoted anchor.')
    .replaceAll('V46 remains active canon', 'the prior V46 canon is superseded');
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV47PromotedParityMatrix(content, version) {
  if (version !== 'V47') return content;
  return content
    .replaceAll('| draft-required |', '| closed |')
    .replaceAll('| drafted |', '| closed |')
    .replaceAll('| implemented; promotion pending |', '| closed |')
    .replaceAll('| pending |', '| closed |');
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV46PromotedSourceOfTruthHierarchy(content, version) {
  if (version !== 'V46') return content;
  return content.replace(
    [
      '`BITCODE_SPEC.txt` points to `V45`; V45 is the active promoted Bitcode canon.',
      '`BITCODE_SPEC_V46.md`, `BITCODE_SPEC_V46_DELTA.md`,',
      '`BITCODE_SPEC_V46_NOTES.md`, and `BITCODE_SPEC_V46_PARITY_MATRIX.md` are draft',
      'target material only. They do not authorize implementation behavior until a',
      'gate-specific V46 parity or implementation gate accepts the relevant scope.'
    ].join('\n'),
    [
      '`BITCODE_SPEC.txt` points to `V46`; V46 is the active promoted Bitcode canon.',
      '`BITCODE_SPEC_V46.md`, `BITCODE_SPEC_V46_DELTA.md`,',
      '`BITCODE_SPEC_V46_NOTES.md`, and `BITCODE_SPEC_V46_PARITY_MATRIX.md` are the',
      'promoted V46 specification-family material. The V46 formal specification family',
      'is active canon and authorizes implementation behavior only through the',
      'source-safe, proof-backed comprehension, interface, and operator-readback',
      'boundaries it states.'
    ].join('\n')
  );
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV46PromotedDraftPosture(content, version) {
  if (version !== 'V46') return content;
  return content
    .replace(
      'V46 does not replace V45 as active canon until promotion workflow validation.\nIt is the draft target for external protocol comprehension, public/operator\ndocs, route copy, interface contract readback, and launch-facing proof\nexplainability.',
      'V46 replaces V45 as active canon after promotion workflow validation. It is\nthe promoted target for external protocol comprehension, public/operator docs,\nroute copy, interface contract readback, and launch-facing proof explainability.'
    )
    .replaceAll('V46 draft work', 'V46 promoted canon work')
    .replaceAll('V46 formal draft', 'V46 formal canon')
    .replaceAll('V46 remains draft', 'V46 is active canon')
    .replaceAll('until V46 promotion', 'through V46 promotion')
    .replaceAll('before V46 can be promoted', 'before V46 promotion closure')
    .replaceAll('does not promote V46', 'records V46 promotion')
    .replaceAll('draft `BITCODE_SPEC_V46_PROVEN.md`', 'promoted `BITCODE_SPEC_V46_PROVEN.md`')
    .replaceAll('V45 remains active canon while V46 is drafted.', 'V46 is active canon after promotion workflow validation.')
    .replaceAll(
      'V46 does not replace V45 until a later promotion workflow validates and\n  advances `BITCODE_SPEC.txt`.',
      'V46 replaces V45 after the maintained promotion workflow validates and\n  advances `BITCODE_SPEC.txt`.'
    )
    .replaceAll('V45 active / V46 draft', 'pre-promotion V45-to-V46 draft')
    .replaceAll('V45 active / draft V46', 'pre-promotion draft V46')
    .replaceAll('Canonical pointer: `BITCODE_SPEC.txt` -> `V45`', 'Canonical pointer: `BITCODE_SPEC.txt` -> `V46`')
    .replaceAll('Active canonical anchor: `BITCODE_SPEC_V45.md`', 'Active canonical anchor: `BITCODE_SPEC_V46.md`')
    .replaceAll('Active generated proof appendix: `BITCODE_SPEC_V45_PROVEN.md`', 'Active generated proof appendix: `BITCODE_SPEC_V46_PROVEN.md`')
    .replaceAll(
      'Until then, V45 remains the active\npointer truth through `BITCODE_SPEC.txt`.',
      'V46 now holds the active pointer truth through `BITCODE_SPEC.txt`.'
    )
    .replaceAll(
      'These notes are not implementation authority above the active V45\nspecification family. They preserve draft notes-level atoms that must later be\nconsolidated into formal V46 specification text before parity or\nimplementation gates rely on them.',
      'These notes are implementation authority only through the promoted V46\nspecification family. They preserve accepted notes-level atoms that have been\nconsolidated into formal V46 specification text, parity evidence, proof\nreadback, and promotion receipts.'
    )
    .replaceAll('This matrix opens V46 parity work. It is intentionally draft-only: it records', 'This matrix records promoted V46 parity work. It records')
    .replaceAll('current authority remains V45.', 'current authority is V46.')
    .replaceAll('V45 is active canon; V46 is draft target only.', 'V46 is active canon; V45 is the prior promoted anchor.')
    .replaceAll('`BITCODE_SPEC.txt` remains V45 during V46 promoted canon work', '`BITCODE_SPEC.txt` points to V46 after promotion')
    .replaceAll('Gate 1 preserves active V45 / draft V46 posture.', 'Gate 1 preserved pre-promotion posture; promotion now records active V46 posture.')
    .replaceAll('V45 is active canon while V46 is draft target.', 'V46 is active canon after promotion workflow validation.')
    .replaceAll(
      'validate active V45 plus draft V46, prepare V46 active / draft V47 posture',
      'validated pre-promotion V46 draft posture, prepare V46 active / draft V47 posture'
    )
    .replaceAll(
      'validate active V45 plus draft V46 and the gate branch is committed',
      'validated pre-promotion V46 draft posture and the gate branch is committed'
    );
}

/**
 * @param {string} content
 * @param {string} version
 */
function rewriteV46PromotedParityMatrix(content, version) {
  if (version !== 'V46') return content;
  return content
    .replace(
      'V46 parity truth, generated comprehension artifacts, local interface rehearsal, gate closure, and promotion automation are aligned',
      'V46 promoted parity truth, generated comprehension artifacts, local interface rehearsal, gate closure, and promotion automation are aligned'
    )
    .replaceAll('| draft-required |', '| closed |')
    .replaceAll('| implemented prerequisite |', '| closed |')
    .replaceAll('| accepted boundary |', '| closed |')
    .replaceAll('| pending |', '| closed |');
}

/**
 * @param {string} version
 * @param {string} commit
 * @param {string} content
 * @param {'spec' | 'delta' | 'notes' | 'parity'} kind
 */
function rewritePromotionStatus(version, commit, content, kind) {
  if (version === 'V28') {
    const sharedInventory = 'active canonical `.bitcode/v28-spec-family-report.json`, `.bitcode/v28-canonical-input-report.json`, `.bitcode/v28-canon-posture-drift-report.json`, V28 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V28_PROVEN.md` as the generated proof appendix for V28 promotion';
    const scopeByKind = {
      spec: 'V28 canonical system specification for commercial Protocol implementation, Terminal MVP QA, MCP API and ChatGPT App MVP readiness, Reading pipeline product gates, and promotion-proof metadevelopment after V27 tokenomics and crypto-commercial rails',
      delta: 'V28 canonical delta for commercial Protocol implementation, Terminal MVP QA, MCP API and ChatGPT App MVP readiness, Reading pipeline product gates, and promotion-proof metadevelopment after V27 tokenomics and crypto-commercial rails',
      notes: 'V28 canonical notes for commercial Protocol implementation, Terminal MVP QA, MCP API and ChatGPT App MVP readiness, Reading pipeline product gates, and promotion-proof metadevelopment',
      parity: 'V28 canonical parity ledger for commercial Protocol implementation, Terminal MVP QA, MCP API and ChatGPT App MVP readiness, Reading pipeline product gates, and promotion-proof metadevelopment'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V28 is the active commercial Protocol and Terminal MVP canon and the V28 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V27-to-V28 commercial Protocol, Terminal MVP, Reading pipeline, and promotion-proof closure set',
      notes: 'canonical promotion complete; V28 notes record the accepted commercial-product and metadevelopment closure evidence',
      parity: 'canonical promotion complete; V28 parity truth, product-gate audit, generated proof, and promotion automation are aligned'
    };
    return rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V28`' }
        : {}),
      'Current canonical/latest target': '`V28`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V28 source-side Protocol, Terminal, Reading pipeline, MCP/ChatGPT App, proof, workflow, and promotion surfaces are canonicalized in the promoted V28 file family',
      'V28 state': stateByKind[kind]
    });
  }

  if (version === 'V29') {
    const sharedInventory = 'active canonical `.bitcode/v29-spec-family-report.json`, `.bitcode/v29-canonical-input-report.json`, `.bitcode/v29-canon-posture-drift-report.json`, V29 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V29_PROVEN.md` as the generated proof appendix for V29 promotion';
    const scopeByKind = {
      spec: 'V29 canonical system specification for Terminal transaction depth, operator recovery, wallet/BTC settlement operation, AssetPack disclosure and rights review, ledger/database reconciliation, organization permission decisions, and promotion-ready workflow proof over V28',
      delta: 'V29 canonical delta for Terminal transaction depth, operator recovery, wallet/BTC settlement operation, AssetPack disclosure and rights review, ledger/database reconciliation, organization permission decisions, and promotion-ready workflow proof over V28',
      notes: 'V29 canonical notes for Terminal transaction depth, local/staging readiness, and promotion automation over V28',
      parity: 'V29 canonical parity ledger for Terminal transaction depth, local/staging readiness, and promotion automation over V28'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V29 is the active Terminal transaction-depth canon and the V29 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V28-to-V29 Terminal transaction-depth and promotion-readiness closure set',
      notes: 'canonical promotion complete; V29 notes record the accepted Terminal-depth, local/staging, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V29 parity truth, product-gate audit, generated proof, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V29`' }
        : {}),
      'Current canonical/latest target': '`V29`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V29 source-side Terminal transaction, wallet/BTC, Reading observability, AssetPack disclosure, settlement repair, organization authority, UX proof, workflow, and promotion surfaces are canonicalized in the promoted V29 file family',
      'V29 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V30') {
    const sharedInventory = 'active canonical `.bitcode/v30-spec-family-report.json`, `.bitcode/v30-canonical-input-report.json`, `.bitcode/v30-canon-posture-drift-report.json`, `.bitcode/v30-protocol-telemetry-proof-hooks.json`, V30 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V30_PROVEN.md` as the generated proof appendix for V30 promotion';
    const scopeByKind = {
      spec: 'V30 canonical system specification for Protocol/BTD package API boundaries, Bitcoin/Taproot/PSBT rigor, BTD AssetPack mint/read receipts, testnet ledger projection, source-to-shares proof cleanup, bridge-readiness research boundaries, Protocol telemetry/proof hooks, interface regression, and promotion-ready workflow proof over V29',
      delta: 'V30 canonical delta for Protocol/BTD package API boundaries, Bitcoin/Taproot/PSBT rigor, BTD AssetPack mint/read receipts, testnet ledger projection, source-to-shares proof cleanup, bridge-readiness research boundaries, Protocol telemetry/proof hooks, interface regression, and promotion-ready workflow proof over V29',
      notes: 'V30 canonical notes for Protocol/BTD hardening, local/staging readiness, and promotion automation over V29',
      parity: 'V30 canonical parity ledger for Protocol/BTD hardening, local/staging readiness, and promotion automation over V29'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V30 is the active Protocol/BTD hardening canon and the V30 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V29-to-V30 Protocol/BTD hardening and promotion-readiness closure set',
      notes: 'canonical promotion complete; V30 notes record the accepted Protocol/BTD hardening, local/staging, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V30 parity truth, Protocol/BTD gate closure, generated proof, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V30`' }
        : {}),
      'Current canonical/latest target': '`V30`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V30 source-side Protocol/BTD package APIs, Bitcoin/PSBT, receipts, ledger projection, source-to-shares, bridge-readiness, telemetry/proof hooks, interface regression, workflow, and promotion surfaces are canonicalized in the promoted V30 file family',
      'V30 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V31') {
    const sharedInventory = 'active canonical `.bitcode/v31-spec-family-report.json`, `.bitcode/v31-canonical-input-report.json`, `.bitcode/v31-canon-posture-drift-report.json`, `.bitcode/v31-auxillaries-telemetry-proof-hooks.json`, V31 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V31_PROVEN.md` as the generated proof appendix for V31 promotion';
    const scopeByKind = {
      spec: 'V31 canonical system specification for Auxillaries support/control surfaces: Profile, account, provider connection, interface admission, Wallet, BTD pane, organization authority, policy decision, readiness diagnostics, recovery runs, accessibility/responsive UX, source-safe telemetry proof hooks, and promotion-ready workflow proof over V30',
      delta: 'V31 canonical delta for Auxillaries support/control surfaces, source-safe recovery and telemetry proof hooks, accessibility/responsive proof, and promotion-ready workflow proof over V30',
      notes: 'V31 canonical notes for Auxillaries support/control surfaces, source-safe recovery, telemetry proof hooks, UX proof, local/staging readiness, and promotion automation over V30',
      parity: 'V31 canonical parity ledger for Auxillaries support/control surfaces, source-safe recovery and telemetry proof hooks, UX proof, local/staging readiness, and promotion automation over V30'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V31 is the active Auxillaries support/control canon and the V31 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V30-to-V31 Auxillaries support/control and promotion-readiness closure set',
      notes: 'canonical promotion complete; V31 notes record the accepted Auxillaries support/control, local/staging, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V31 parity truth, Auxillaries gate closure, generated proof, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V31`' }
        : {}),
      'Current canonical/latest target': '`V31`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V31 source-side Auxillaries package contracts, route data, client hooks, panes, organization authority, recovery runs, telemetry/proof hooks, UX/accessibility, workflow, and promotion surfaces are canonicalized in the promoted V31 file family',
      'V31 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V32') {
    const sharedInventory = 'active canonical `.bitcode/v32-spec-family-report.json`, `.bitcode/v32-canonical-input-report.json`, `.bitcode/v32-canon-posture-drift-report.json`, `.bitcode/v32-proof-coverage-matrix.json`, `.bitcode/v32-artifact-volatility-inventory.json`, `.bitcode/v32-deterministic-replay-report.json`, `.bitcode/v32-reading-pipeline-proof-coverage.json`, `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`, `.bitcode/v32-interface-contract-regression-suite.json`, `.bitcode/v32-browser-accessibility-responsive-visual-proof.json`, `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json`, `.bitcode/v32-promotion-proof-generation-hardening.json`, `.bitcode/v32-promotion-readiness-report.json`, V32 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V32_PROVEN.md` as the generated proof appendix for V32 promotion';
    const scopeByKind = {
      spec: 'V32 canonical system specification for provation/testing over promoted Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and protocol-demonstration rails',
      delta: 'V32 canonical delta for provation/testing over promoted Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and protocol-demonstration rails',
      notes: 'V32 canonical notes for provation/testing over promoted Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and protocol-demonstration rails',
      parity: 'V32 canonical parity ledger for provation/testing over promoted Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and protocol-demonstration rails'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V32 is the active provation/testing canon and the V32 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V31-to-V32 provation/testing closure set',
      notes: 'canonical promotion complete; V32 notes record the accepted proof/test, readiness rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V32 parity truth, generated proof artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V32`' }
        : {}),
      'Current canonical/latest target': '`V32`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V32 source-side proof/test replay, generated artifacts, Reading pipeline proof coverage, ledger/BTD failure-state proof, interface regression, browser/accessibility/responsive/visual proof, readiness rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V32 file family',
      'V32 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V33') {
    const sharedInventory = 'active canonical `.bitcode/v33-spec-family-report.json`, `.bitcode/v33-canonical-input-report.json`, `.bitcode/v33-canon-posture-drift-report.json`, `.bitcode/v33-interface-contract-catalog.json`, `.bitcode/v33-mcp-api-tool-contracts.json`, `.bitcode/v33-chatgpt-app-action-contracts.json`, `.bitcode/v33-interface-authorization-policy.json`, `.bitcode/v33-read-license-assetpack-rights-contracts.json`, `.bitcode/v33-api-schema-compatibility-matrix.json`, `.bitcode/v33-interface-telemetry-proof-hooks.json`, `.bitcode/v33-interface-consumer-ux-regression-proof.json`, `.bitcode/v33-promotion-readiness-report.json`, V33 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V33_PROVEN.md` as the generated proof appendix for V33 promotion';
    const scopeByKind = {
      spec: 'V33 canonical system specification for commercial interface depth over promoted MCP API, ChatGPT App, public API, package consumers, authorization, schemas, license/rights, telemetry, and source-safe consumer UX contracts',
      delta: 'V33 canonical delta for commercial interface depth over promoted V32 proof/testing canon',
      notes: 'V33 canonical notes for commercial interface depth over promoted V32 proof/testing canon',
      parity: 'V33 canonical parity ledger for commercial interface depth over promoted V32 proof/testing canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V33 is the active commercial interface-depth canon and the V33 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V32-to-V33 interface-depth closure set',
      notes: 'canonical promotion complete; V33 notes record the accepted interface contract, policy, schema, telemetry, consumer UX, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V33 parity truth, generated interface artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V33`' }
        : {}),
      'Current canonical/latest target': '`V33`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V33 source-side interface contract catalog, MCP tool contracts, ChatGPT App action contracts, authorization policy, Read license and AssetPack rights contracts, API schema compatibility matrix, interface telemetry proof hooks, consumer UX regression proof, workflow, and promotion surfaces are canonicalized in the promoted V33 file family',
      'V33 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V34') {
    const sharedInventory = 'active canonical `.bitcode/v34-spec-family-report.json`, `.bitcode/v34-canonical-input-report.json`, `.bitcode/v34-canon-posture-drift-report.json`, `.bitcode/v34-deployment-host-capability-catalog.json`, `.bitcode/v34-environment-lane-contracts.json`, `.bitcode/v34-distributed-execution-runtime-receipts.json`, `.bitcode/v34-deployment-storage-posture.json`, `.bitcode/v34-secret-rotation-boundary-operations.json`, `.bitcode/v34-migration-cicd-approval-gates.json`, `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json`, `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json`, `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json`, `.bitcode/v34-promotion-readiness-report.json`, V34 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V34_PROVEN.md` as the generated proof appendix for V34 promotion';
    const scopeByKind = {
      spec: 'V34 canonical system specification for deployment depth over promoted host capabilities, environment lanes, distributed executions, storage posture, credential operations, migration approvals, observers, repair jobs, rehearsal, and promotion readiness',
      delta: 'V34 canonical delta for deployment depth over promoted V33 commercial interface canon',
      notes: 'V34 canonical notes for deployment depth over promoted V33 commercial interface canon',
      parity: 'V34 canonical parity ledger for deployment depth over promoted V33 commercial interface canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V34 is the active deployment-depth canon and the V34 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V33-to-V34 deployment-depth closure set',
      notes: 'canonical promotion complete; V34 notes record the accepted deployment host, lane, runtime, storage, credential, migration, repair, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V34 parity truth, generated deployment artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V34`' }
        : {}),
      'Current canonical/latest target': '`V34`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V34 source-side deployment host capability catalog, environment lane contracts, distributed execution runtime receipts, storage posture, secret rotation, migration CI/CD approval gates, runtime observer and repair jobs, rollback/upgrade/data repair playbooks, local/staging-testnet deployment rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V34 file family',
      'V34 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V35') {
    const sharedInventory = 'active canonical `.bitcode/v35-spec-family-report.json`, `.bitcode/v35-canonical-input-report.json`, `.bitcode/v35-canon-posture-drift-report.json`, `.bitcode/v35-documentation-surface-catalog.json`, `.bitcode/v35-telemetry-taxonomy-catalog.json`, `.bitcode/v35-public-docs-usage-guides.json`, `.bitcode/v35-operator-runbook-catalog.json`, `.bitcode/v35-docs-qa-alignment-report.json`, `.bitcode/v35-testnet-rollout-readiness-guide.json`, `.bitcode/v35-telemetry-documentation-interface-integration.json`, `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json`, `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json`, V35 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V35_PROVEN.md` as the generated proof appendix for V35 promotion';
    const scopeByKind = {
      spec: 'V35 canonical system specification for telemetry and documentation depth over promoted documentation surfaces, telemetry taxonomy, public docs, runbooks, docs QA, rollout guides, interface integration, local/staging rehearsal, and promotion readiness',
      delta: 'V35 canonical delta for telemetry and documentation depth over promoted V34 deployment-depth canon',
      notes: 'V35 canonical notes for telemetry and documentation depth over promoted V34 deployment-depth canon',
      parity: 'V35 canonical parity ledger for telemetry and documentation depth over promoted V34 deployment-depth canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V35 is the active telemetry and documentation depth canon and the V35 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V34-to-V35 telemetry and documentation depth closure set',
      notes: 'canonical promotion complete; V35 notes record the accepted documentation, telemetry, docs QA, rollout, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V35 parity truth, generated telemetry/documentation artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V35`' }
        : {}),
      'Current canonical/latest target': '`V35`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V35 source-side documentation surface catalog, telemetry taxonomy catalog, public docs usage guides, operator runbook catalog, docs QA report, testnet rollout guide, telemetry documentation interface integration, local staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V35 file family',
      'V35 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V36') {
    const sharedInventory = 'active canonical `.bitcode/v36-spec-family-report.json`, `.bitcode/v36-canonical-input-report.json`, `.bitcode/v36-canon-posture-drift-report.json`, `.bitcode/v36-exchange-activity-book.json`, `.bitcode/v36-exchange-intent-order-contracts.json`, `.bitcode/v36-exchange-rights-transfer-review.json`, `.bitcode/v36-pricing-liquidity-fee-quote.json`, `.bitcode/v36-exchange-settlement-reconciliation.json`, `.bitcode/v36-exchange-dispute-repair-revenue-route.json`, `.bitcode/v36-exchange-ux-proof.json`, `.bitcode/v36-exchange-rehearsal.json`, `.bitcode/v36-promotion-readiness-report.json`, V36 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V36_PROVEN.md` as the generated proof appendix for V36 promotion';
    const scopeByKind = {
      spec: 'V36 canonical system specification for Exchange depth over promoted activity book, intent/order, rights-transfer, pricing, settlement, dispute repair, revenue route, UX, rehearsal, and promotion readiness surfaces',
      delta: 'V36 canonical delta for Exchange depth over promoted V35 telemetry and documentation canon',
      notes: 'V36 canonical notes for Exchange depth over promoted V35 telemetry and documentation canon',
      parity: 'V36 canonical parity ledger for Exchange depth over promoted V35 telemetry and documentation canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V36 is the active Exchange depth canon and the V36 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V35-to-V36 Exchange depth closure set',
      notes: 'canonical promotion complete; V36 notes record the accepted Exchange activity, intent, rights transfer, pricing, settlement, repair, UX, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V36 parity truth, generated Exchange artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V36`' }
        : {}),
      'Current canonical/latest target': '`V36`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V36 source-side Exchange activity book, intent/order contracts, rights-transfer preview, pricing quote, settlement reconciliation, dispute repair and revenue route, UX proof, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V36 file family',
      'V36 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V37') {
    const sharedInventory = 'active canonical `.bitcode/v37-spec-family-report.json`, `.bitcode/v37-canonical-input-report.json`, `.bitcode/v37-canon-posture-drift-report.json`, `.bitcode/v37-conversation-session-route-history.json`, `.bitcode/v37-conversation-stream-event-contract.json`, `.bitcode/v37-conversation-writing-workspace.json`, `.bitcode/v37-conversation-source-selector.json`, `.bitcode/v37-conversation-product-handoff.json`, `.bitcode/v37-conversation-persistence-privacy-redaction.json`, `.bitcode/v37-conversation-telemetry-proof-hooks.json`, `.bitcode/v37-conversation-rehearsal.json`, `.bitcode/v37-promotion-readiness-report.json`, V37 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V37_PROVEN.md` as the generated proof appendix for V37 promotion';
    const scopeByKind = {
      spec: 'V37 canonical system specification for Website Conversations over promoted sessions, route-local history, stream UI/event contracts, fullscreen writing mode, source selectors, Terminal handoff, persistence/privacy/redaction, telemetry/proof hooks, local/staging rehearsal, and promotion readiness surfaces',
      delta: 'V37 canonical delta for Website Conversations over promoted V36 Exchange canon',
      notes: 'V37 canonical notes for Website Conversations over promoted V36 Exchange canon',
      parity: 'V37 canonical parity ledger for Website Conversations over promoted V36 Exchange canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V37 is the active Website Conversations canon and the V37 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V36-to-V37 Website Conversations closure set',
      notes: 'canonical promotion complete; V37 notes record the accepted Conversations session, stream, writing, source selector, Terminal handoff, persistence privacy, telemetry proof, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V37 parity truth, generated Conversations artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V37`' }
        : {}),
      'Current canonical/latest target': '`V37`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V37 source-side ConversationSession route history, ConversationStreamEvent contracts, ConversationWritingWorkspace contracts, ConversationSourceSelector contracts, ConversationProductHandoff contracts, ConversationPersistencePrivacyRedaction contracts, ConversationTelemetryProofHooks contracts, ConversationRehearsal evidence, workflow, and promotion surfaces are canonicalized in the promoted V37 file family',
      'V37 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V38') {
    const sharedInventory = 'active canonical `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, `.bitcode/v38-inference-surface-inventory.json`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, `.bitcode/v38-prompt-benchmark-report.json`, `.bitcode/v38-disclosure-boundary-report.json`, `.bitcode/v38-read-need-comprehension-inference-hardening.json`, `.bitcode/v38-read-fits-finding-search-embeddings.json`, `.bitcode/v38-assetpack-synthesis-economic-traceability.json`, `.bitcode/v38-conversation-tool-prompt-inference-parity.json`, `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`, `.bitcode/v38-promotion-readiness-report.json`, V38 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V38_PROVEN.md` as the generated proof appendix for V38 promotion';
    const scopeByKind = {
      spec: 'V38 canonical system specification for inference correctness across pipeline execution, PTRR agents, FailsafeGenerationSequences, ThricifiedGenerations, prompt benchmarking, Reading fit-finding search, source-safe telemetry, local/staging rehearsal, and promotion readiness surfaces',
      delta: 'V38 canonical delta for inference correctness over promoted V37 Website Conversations canon',
      notes: 'V38 canonical notes for inference correctness over promoted V37 Website Conversations canon',
      parity: 'V38 canonical parity ledger for inference correctness over promoted V37 Website Conversations canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V38 is the active inference correctness canon and the V38 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V37-to-V38 inference correctness closure set',
      notes: 'canonical promotion complete; V38 notes record accepted inference stack, prompt benchmark, Reading search, telemetry, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V38 parity truth, generated inference artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V38`' }
        : {}),
      'Current canonical/latest target': '`V38`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V38 source-side inference inventory, PTRR Failsafe Thricified stack, prompt benchmark report, inference telemetry disclosure law, ReadNeedComprehensionSynthesis hardening, ReadFitsFindingSynthesis search embeddings, AssetPack synthesis economic traceability, Conversation/tool prompt parity, local/staging inference rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V38 file family',
      'V38 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V39') {
    const sharedInventory = 'active canonical `.bitcode/v39-spec-family-report.json`, `.bitcode/v39-canonical-input-report.json`, `.bitcode/v39-canon-posture-drift-report.json`, `.bitcode/v39-depository-supply-indexing.json`, `.bitcode/v39-enterprise-reading-ux-state.json`, `.bitcode/v39-read-need-review-resynthesis.json`, `.bitcode/v39-read-fits-finding-runtime.json`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, `.bitcode/v39-settlement-rights-delivery.json`, `.bitcode/v39-operational-telemetry-repair-readback.json`, `.bitcode/v39-interface-conversation-product-parity.json`, `.bitcode/v39-local-staging-reading-rehearsal.json`, `.bitcode/v39-promotion-readiness-report.json`, V39 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V39_PROVEN.md` as the generated proof appendix for V39 promotion';
    const scopeByKind = {
      spec: 'V39 canonical system specification for commercial Reading readiness across Depository supply indexing, enterprise Reading UX, ReadNeed review, Finding Fits, source-safe AssetPack preview/quote, settlement, BTD rights transfer, delivery, telemetry/repair, interface parity, local/staging rehearsal, and promotion readiness surfaces',
      delta: 'V39 canonical delta for commercial Reading readiness over promoted V38 inference correctness canon',
      notes: 'V39 canonical notes for commercial Reading readiness over promoted V38 inference correctness canon',
      parity: 'V39 canonical parity ledger for commercial Reading readiness over promoted V38 inference correctness canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V39 is the active commercial Reading readiness canon and the V39 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V38-to-V39 commercial Reading readiness closure set',
      notes: 'canonical promotion complete; V39 notes record accepted Depository, Reading UX, Need review, Finding Fits, preview/quote, settlement, telemetry, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V39 parity truth, generated commercial Reading artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V39`' }
        : {}),
      'Current canonical/latest target': '`V39`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V39 source-side Depository supply indexing, enterprise Reading UX, ReadNeed review/resynthesis, ReadFitsFinding runtime, AssetPack preview/quote, settlement rights delivery, operational telemetry repair readback, interface parity, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V39 file family',
      'V39 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V40') {
    const sharedInventory = 'active canonical `.bitcode/v40-spec-family-report.json`, `.bitcode/v40-canonical-input-report.json`, `.bitcode/v40-canon-posture-drift-report.json`, `.bitcode/v40-test-inventory-coverage-matrix.json`, `.bitcode/v40-unit-coverage-inventory.json`, `.bitcode/v40-api-integration-contracts.json`, `.bitcode/v40-reading-pipeline-integration-coverage.json`, `.bitcode/v40-conversation-terminal-integration.json`, `.bitcode/v40-browser-e2e-visual-proof.json`, `.bitcode/v40-ledger-storage-sync.json`, `.bitcode/v40-local-staging-rehearsal-automation.json`, `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`, `.bitcode/v40-promotion-readiness-report.json`, V40 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V40_PROVEN.md` as the generated proof appendix for V40 promotion';
    const scopeByKind = {
      spec: 'V40 canonical system specification for exhaustive commercial application testing across browser E2E, visual and screenshot proof, unit coverage, API integration, Reading pipeline integration, Conversation and Terminal integration, ledger/database/storage/wallet synchronization, local/staging rehearsal, prompt benchmark smoke, and promotion readiness surfaces',
      delta: 'V40 canonical delta for exhaustive commercial application testing over promoted V39 commercial Reading readiness canon',
      notes: 'V40 canonical notes for exhaustive commercial application testing over promoted V39 commercial Reading readiness canon',
      parity: 'V40 canonical parity ledger for exhaustive commercial application testing over promoted V39 commercial Reading readiness canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V40 is the active exhaustive commercial application testing canon and the V40 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V39-to-V40 exhaustive testing closure set',
      notes: 'canonical promotion complete; V40 notes record accepted test inventory, unit coverage, API integration, Reading pipeline integration, Conversation/Terminal integration, browser proof, ledger/storage synchronization, local/staging rehearsal, prompt benchmark smoke, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V40 parity truth, generated exhaustive testing artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V40`' }
        : {}),
      'Current canonical/latest target': '`V40`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V40 source-side test inventory, unit coverage, API integration contracts, Reading pipeline integration, Conversation/Terminal integration, browser E2E visual proof, ledger/database/storage synchronization, local/staging rehearsal automation, prompt benchmark smoke, workflow, and promotion surfaces are canonicalized in the promoted V40 file family',
      'V40 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V41') {
    const sharedInventory = 'active canonical `.bitcode/v41-spec-family-report.json`, `.bitcode/v41-canonical-input-report.json`, `.bitcode/v41-canon-posture-drift-report.json`, `.bitcode/v41-promptpart-prompt-inventory.json`, `.bitcode/v41-registry-interpolation-contracts.json`, `.bitcode/v41-reading-prompt-benchmark-baselines.json`, `.bitcode/v41-readneed-prompt-hardening.json`, `.bitcode/v41-readfitsfinding-prompt-hardening.json`, `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json`, `.bitcode/v41-prompt-program-benchmark-report.json`, `.bitcode/v41-promotion-readiness-report.json`, V41 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V41_PROVEN.md` as the generated proof appendix for V41 promotion';
    const scopeByKind = {
      spec: 'V41 canonical system specification for prompt-program excellence across PromptPart and Prompt inventory, registry interpolation contracts, Reading prompt benchmarks, ReadNeedComprehensionSynthesis rewrite hardening, ReadFitsFindingSynthesis rewrite hardening, Conversation/tool/interface prompt rewrite, prompt benchmark telemetry integration, and promotion readiness surfaces',
      delta: 'V41 canonical delta for prompt-program excellence over promoted V40 exhaustive commercial application testing canon',
      notes: 'V41 canonical notes for prompt-program excellence over promoted V40 exhaustive commercial application testing canon',
      parity: 'V41 canonical parity ledger for prompt-program excellence over promoted V40 exhaustive commercial application testing canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V41 is the active prompt-program excellence canon and the V41 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V40-to-V41 prompt-program excellence closure set',
      notes: 'canonical promotion complete; V41 notes record accepted prompt inventory, registry/interpolation, Reading baselines, ReadNeed and ReadFitsFinding prompt hardening, Conversation/tool/interface prompt rewrite, benchmark telemetry, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V41 parity truth, generated prompt-program artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V41`' }
        : {}),
      'Current canonical/latest target': '`V41`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V41 source-side PromptPart and Prompt inventory, registry interpolation contracts, Reading baselines, ReadNeedComprehensionSynthesis prompt hardening, ReadFitsFindingSynthesis prompt hardening, Conversation/tool/interface prompt rewrite, prompt benchmark telemetry report, workflow, and promotion surfaces are canonicalized in the promoted V41 file family',
      'V41 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V42') {
    const sharedInventory = 'active canonical `.bitcode/v42-spec-family-report.json`, `.bitcode/v42-canonical-input-report.json`, `.bitcode/v42-canon-posture-drift-report.json`, `.bitcode/v42-depositing-shortest-path.json`, `.bitcode/v42-reading-shortest-path-state-machine.json`, `.bitcode/v42-readneed-review-resynthesis-product-closure.json`, `.bitcode/v42-readfitsfinding-preview-quote.json`, `.bitcode/v42-settlement-rights-delivery.json`, `.bitcode/v42-ai-reading-demonstration.json`, `.bitcode/v42-local-staging-mvp-rehearsal.json`, `.bitcode/v42-promotion-readiness-report.json`, V42 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V42_PROVEN.md` as the generated proof appendix for V42 promotion';
    const scopeByKind = {
      spec: 'V42 canonical system specification for reliable MVP experience across shortest-path Depositing, shortest-path Reading, reviewed Need synthesis, Finding Fits preview and quote, settlement-gated rights delivery, depositor compensation visibility, AI-reading demonstration, local/staging-testnet rehearsal, and promotion readiness surfaces',
      delta: 'V42 canonical delta for reliable MVP experience over promoted V41 prompt-program excellence canon',
      notes: 'V42 canonical notes for reliable MVP experience over promoted V41 prompt-program excellence canon',
      parity: 'V42 canonical parity ledger for reliable MVP experience over promoted V41 prompt-program excellence canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V42 is the active reliable MVP experience canon and the V42 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V41-to-V42 reliable MVP experience closure set',
      notes: 'canonical promotion complete; V42 notes record accepted Depositing, Reading, Need review, Finding Fits, settlement, delivery, AI-reading demonstration, local/staging rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V42 parity truth, generated reliable MVP artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V42`' }
        : {}),
      'Current canonical/latest target': '`V42`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V42 source-side Depositing shortest path, Reading shortest path state machine, ReadNeed review/resynthesis closure, ReadFitsFinding preview and quote closure, settlement rights delivery, AI-reading demonstration, local/staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V42 file family',
      'V42 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V43') {
    const sharedInventory = 'active canonical `.bitcode/v43-spec-family-report.json`, `.bitcode/v43-canonical-input-report.json`, `.bitcode/v43-canon-posture-drift-report.json`, `.bitcode/v43-route-vocabulary-inventory.json`, `.bitcode/v43-packs-activity-master-detail.json`, `.bitcode/v43-read-route-five-step-ux.json`, `.bitcode/v43-deposit-route-options.json`, `.bitcode/v43-deposit-policy-compensation.json`, `.bitcode/v43-deposit-option-admission.json`, `.bitcode/v43-route-ux-product-excellence.json`, `.bitcode/v43-cross-route-rehearsal-telemetry-repair.json`, `.bitcode/v43-promotion-readiness-report.json`, V43 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V43_PROVEN.md` as the generated proof appendix for V43 promotion';
    const scopeByKind = {
      spec: 'V43 canonical system specification for product routes and agentic depositing across `/packs`, `/read`, `/deposit`, PackActivity search/detail, Read five-step UX, deposit AssetPack option synthesis, deposit policy/compensation, option admission, route UX product excellence, cross-route rehearsal, and promotion readiness surfaces',
      delta: 'V43 canonical delta for product routes and agentic depositing over promoted V42 reliable MVP canon',
      notes: 'V43 canonical notes for product routes and agentic depositing over promoted V42 reliable MVP canon',
      parity: 'V43 canonical parity ledger for product routes and agentic depositing over promoted V42 reliable MVP canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V43 is the active product-route and agentic-depositing canon and the V43 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V42-to-V43 product-route and agentic-depositing closure set',
      notes: 'canonical promotion complete; V43 notes record accepted route vocabulary, PackActivity, Reading, Depositing, policy, admission, UX, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V43 parity truth, generated product-route artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V43`' }
        : {}),
      'Current canonical/latest target': '`V43`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V43 source-side route vocabulary, Packs master-detail, Read five-step UX, deposit option synthesis, deposit policy/compensation, deposit option admission, route UX, cross-route rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V43 file family',
      'V43 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V44') {
    const sharedInventory = 'active canonical `.bitcode/v44-spec-family-report.json`, `.bitcode/v44-canonical-input-report.json`, `.bitcode/v44-canon-posture-drift-report.json`, `.bitcode/v44-economic-domain-model.json`, `.bitcode/v44-packs-portfolio-market-intelligence.json`, `.bitcode/v44-reading-budget-quote-policy.json`, `.bitcode/v44-depositor-earnings-supply-opportunities.json`, `.bitcode/v44-btd-btc-compensation-statements.json`, `.bitcode/v44-organization-policy-wallet-authority.json`, `.bitcode/v44-enterprise-product-ux.json`, `.bitcode/v44-scaled-network-rehearsal.json`, `.bitcode/v44-promotion-readiness-report.json`, V44 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V44_PROVEN.md` as the generated proof appendix for V44 promotion';
    const scopeByKind = {
      spec: 'V44 canonical system specification for scaled engineering economy across Pack portfolios, Reading procurement budgets and quotes, depositor earnings, BTD/BTC compensation statements, organization policy and wallet authority, enterprise UX, scaled local/staging-testnet rehearsal, and promotion readiness surfaces',
      delta: 'V44 canonical delta for scaled engineering economy over promoted V43 product-route canon',
      notes: 'V44 canonical notes for scaled engineering economy over promoted V43 product-route canon',
      parity: 'V44 canonical parity ledger for scaled engineering economy over promoted V43 product-route canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V44 is the active scaled engineering economy canon and the V44 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V43-to-V44 scaled engineering economy closure set',
      notes: 'canonical promotion complete; V44 notes record accepted economic domain, Packs portfolio, Reading budget/quote, depositor earnings, BTD/BTC compensation, organization authority, enterprise UX, scaled rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V44 parity truth, generated scaled engineering economy artifacts, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V44`' }
        : {}),
      'Current canonical/latest target': '`V44`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V44 source-side economic domain, Packs portfolio market intelligence, Reading budget/quote policy, depositor earnings opportunity, BTD/BTC compensation statements, organization policy and wallet authority, enterprise UX, scaled rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V44 file family',
      'V44 state': stateByKind[kind]
    });
    return kind === 'parity' ? rewritePromotedParityJudgments(rewritten, version) : rewritten;
  }

  if (version === 'V45') {
    const sharedInventory = 'active canonical `.bitcode/v45-spec-family-report.json`, `.bitcode/v45-canonical-input-report.json`, `.bitcode/v45-canon-posture-drift-report.json`, all nine V45 proof-family artifacts, `.bitcode/v45-source-safe-e2e-rehearsal.json`, `.bitcode/v45-promotion-readiness-report.json`, V45 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V45_PROVEN.md` as the generated proof appendix for V45 promotion';
    const scopeByKind = {
      spec: 'V45 canonical system specification for knowledge commoditization across AssetPack commodity lifecycle, BTD scalar-volume and rights, BTC settlement, interface disclosure, proof readback, source-safe end-to-end rehearsal, and promotion readiness surfaces',
      delta: 'V45 canonical delta for knowledge commoditization protocol precision over promoted V44 scaled engineering economy canon',
      notes: 'V45 canonical notes for knowledge commoditization protocol precision over promoted V44 scaled engineering economy canon',
      parity: 'V45 canonical parity ledger for knowledge commoditization protocol precision over promoted V44 scaled engineering economy canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V45 is the active knowledge commoditization canon and the V45 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V44-to-V45 knowledge commoditization closure set',
      notes: 'canonical promotion complete; V45 notes record accepted AssetPack commodity, BTD scalar-volume, BTC settlement, interface authority, proof readback, rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V45 parity truth, generated proof-family artifacts, source-safe rehearsal, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V45`' }
        : {}),
      'Current canonical/latest target': '`V45`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V45 source-side AssetPack commodity lifecycle, BTD scalar-volume, BTC settlement, interface disclosure, proof readback, source-safe rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V45 file family',
      'V45 state': stateByKind[kind]
    });
    const promotedSourceTruth = rewriteV45PromotedSourceOfTruthHierarchy(rewritten, version);
    return kind === 'parity'
      ? rewriteV45PromotedParityMatrix(rewritePromotedParityJudgments(promotedSourceTruth, version), version)
      : promotedSourceTruth;
  }

  if (version === 'V47') {
    const sharedInventory = 'active canonical `.bitcode/v47-spec-family-report.json`, `.bitcode/v47-canonical-input-report.json`, `.bitcode/v47-canon-posture-drift-report.json`, V47 launch artifacts (`.bitcode/v47-feature-excess-alignment-audit.json`, `.bitcode/v47-seller-buyer-state-machine-law.json`, `.bitcode/v47-depositor-website-completion.json`, `.bitcode/v47-reader-website-completion.json`, `.bitcode/v47-packs-auxillaries-commercial-dashboard.json`, `.bitcode/v47-e2e-ip-selling-buying-tests.json`, `.bitcode/v47-landing-public-launch-messaging.json`, `.bitcode/v47-staging-testnet-deployment-rehearsal.json`), `.bitcode/v47-promotion-readiness-report.json`, V47 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V47_PROVEN.md` as the generated proof appendix for V47 promotion';
    const scopeByKind = {
      spec: 'V47 canonical system specification for commercial website testnet launch readiness, measurement law, seller/buyer launch state machines, route completion, browser-proven IP exchange, staging-testnet rehearsal, and promotion readiness over promoted V46 protocol comprehension canon',
      delta: 'V47 canonical delta for commercial website testnet launch readiness over promoted V46 protocol comprehension canon',
      notes: 'V47 canonical notes for commercial website testnet launch readiness over promoted V46 protocol comprehension canon',
      parity: 'V47 canonical parity ledger for commercial website testnet launch readiness over promoted V46 protocol comprehension canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V47 is the active commercial website testnet launch canon and the V47 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V46-to-V47 commercial website testnet launch closure set',
      notes: 'canonical promotion complete; V47 notes record accepted measurement law, launch state machines, route completions, browser proof, dashboard, messaging, staging-testnet rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V47 parity truth, generated launch artifacts, browser proof, staging-testnet rehearsal, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V47`' }
        : {}),
      'Current canonical/latest target': '`V47`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V47 source-side measurement law, seller/buyer state machines, depositor and reader route completions, packs/Auxillaries dashboard, E2E IP exchange browser proof, landing/public launch messaging, staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V47 file family',
      'V47 state': stateByKind[kind]
    });
    const promotedPosture = rewriteV47PromotedDraftPosture(
      rewriteV47PromotedSourceOfTruthHierarchy(rewritten, version),
      version
    );
    return kind === 'parity'
      ? rewriteV47PromotedParityMatrix(rewritePromotedParityJudgments(promotedPosture, version), version)
      : promotedPosture;
  }

  if (version === 'V46') {
    const sharedInventory = 'active canonical `.bitcode/v46-spec-family-report.json`, `.bitcode/v46-canonical-input-report.json`, `.bitcode/v46-canon-posture-drift-report.json`, V46 protocol-comprehension artifacts, `.bitcode/v46-promotion-readiness-report.json`, V46 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V46_PROVEN.md` as the generated proof appendix for V46 promotion';
    const scopeByKind = {
      spec: 'V46 canonical system specification for protocol comprehension, source-safe public/operator explanation, interface claim contracts, proof readback, local interface rehearsal, and promotion readiness over promoted V45 knowledge commoditization canon',
      delta: 'V46 canonical delta for protocol comprehension and public/operator explanation over promoted V45 knowledge commoditization canon',
      notes: 'V46 canonical notes for protocol comprehension and public/operator explanation over promoted V45 knowledge commoditization canon',
      parity: 'V46 canonical parity ledger for protocol comprehension and public/operator explanation over promoted V45 knowledge commoditization canon'
    };
    const stateByKind = {
      spec: 'canonical promotion complete; V46 is the active protocol-comprehension canon and the V46 hand-authored plus generated canon are aligned',
      delta: 'canonical promotion complete; this delta records the promoted V45-to-V46 protocol-comprehension closure set',
      notes: 'canonical promotion complete; V46 notes record accepted protocol object-model, public/operator claim boundary, route readback, interface contract, proof explanation, local rehearsal, and promotion-readiness evidence',
      parity: 'canonical promotion complete; V46 parity truth, generated comprehension artifacts, local interface rehearsal, gate closure, and promotion automation are aligned'
    };
    const rewritten = rewriteStatusValues(content, {
      Scope: scopeByKind[kind],
      ...(kind !== 'delta'
        ? { 'Last fully realized canonical target preserved in source': '`V46`' }
        : {}),
      'Current canonical/latest target': '`V46`',
      'Canonical proof-source commit': `\`${commit}\``,
      'Generated structured artifact inventory': sharedInventory,
      'Source parity state':
        'V46 source-side protocol comprehension object model, public/operator claim boundaries, route readback, interface claim contracts, proof readback, local rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V46 file family',
      'V46 state': stateByKind[kind]
    });
    const promotedPosture = rewriteV46PromotedDraftPosture(
      rewriteV46PromotedSourceOfTruthHierarchy(rewritten, version),
      version
    );
    return kind === 'parity'
      ? rewriteV46PromotedParityMatrix(rewritePromotedParityJudgments(promotedPosture, version), version)
      : promotedPosture;
  }

  if (!['V21', 'V22', 'V23', 'V24', 'V25'].includes(version)) {
    throw new Error(`Promotion hand-authored family rewriting is currently implemented for V21, V22, V23, V24, V25, V28, V29, V30, V31, V32, V33, V34, V35, V36, V37, V38, V39, V40, V41, V42, V43, V44, V45, and V46. Received ${version}.`);
  }
  const sharedInventory = version === 'V21'
    ? 'active canonical `.bitcode/v19-*` reproducible reports, `.bitcode/v20-*` operator-quality reports, `.bitcode/v21-spec-family-report.json`, and `.bitcode/v21-canonical-input-report.json`; `ENGI_SPEC_V21_PROVEN.md` is the active generated proof appendix for V21'
    : version === 'V22'
      ? 'active canonical `.bitcode/v19-*` reproducible reports, `.bitcode/v20-*` operator-quality reports, `.bitcode/v22-spec-family-report.json`, `.bitcode/v22-canonical-input-report.json`, and `.bitcode/v22-canon-posture-drift-report.json`; `ENGI_SPEC_V22_PROVEN.md` is the active generated proof appendix for V22'
      : version === 'V23'
        ? 'active canonical `.bitcode/v19-*` reproducible reports, `.bitcode/v20-*` operator-quality reports, `.bitcode/v23-spec-family-report.json`, `.bitcode/v23-canonical-input-report.json`, and `.bitcode/v23-canon-posture-drift-report.json`; `ENGI_SPEC_V23_PROVEN.md` is the active generated proof appendix for V23'
        : version === 'V24'
          ? 'active canonical `.bitcode/v19-*` reproducible reports, `.bitcode/v20-*` operator-quality reports, `.bitcode/v24-spec-family-report.json`, `.bitcode/v24-canonical-input-report.json`, and `.bitcode/v24-canon-posture-drift-report.json`; `ENGI_SPEC_V24_PROVEN.md` is the active generated proof appendix for V24'
          : 'active canonical `.bitcode/v19-*` reproducible reports, `.bitcode/v20-*` operator-quality reports, `.bitcode/v25-spec-family-report.json`, `.bitcode/v25-canonical-input-report.json`, and `.bitcode/v25-canon-posture-drift-report.json`; `_legacy/ENGI_SPEC_V25_PROVEN.md` is the active generated proof appendix for V25';
  const sharedValues = {
    Scope:
      version === 'V21'
        ? kind === 'spec'
          ? 'V21 canonical specification for specifying-canon hardening after V20 operator-quality canon'
          : kind === 'delta'
            ? 'V21 canonical delta for specifying-canon hardening after V20 operator-quality canon'
            : 'V21 canonical parity ledger for specifying-canon hardening'
        : version === 'V22'
          ? kind === 'spec'
            ? 'V22 canonical system specification for runtime/operator drift-detection hardening after V21 specifying canon'
            : kind === 'delta'
              ? 'V22 canonical delta for runtime/operator drift-detection hardening after V21 specifying canon'
              : 'V22 canonical parity ledger for runtime/operator drift-detection hardening'
          : version === 'V23'
            ? kind === 'spec'
              ? 'V23 canonical system specification for bitcoin-backed audit, sidechain-connected settlement interfaces, and deployed compute/storage reality after V22 truth-aligned canon'
              : kind === 'delta'
                ? 'V23 canonical delta for bitcoin-backed audit, sidechain-connected settlement interfaces, and deployed compute/storage reality after V22 truth-aligned canon'
                : 'V23 canonical parity ledger for bitcoin-backed audit, sidechain-connected settlement interfaces, and deployed compute/storage reality'
            : version === 'V24'
              ? kind === 'spec'
              ? 'V24 canonical system specification for realizing external interfacing, exhaustive telemetry, and full-canon conformance after V23 deployed-infrastructure canon'
              : kind === 'delta'
                ? 'V24 canonical delta for realizing external interfacing, exhaustive telemetry, and full-canon conformance after V23 deployed-infrastructure canon'
                : 'V24 canonical parity ledger for realizing external interfacing, exhaustive telemetry, and full-canon conformance'
              : kind === 'spec'
                ? 'V25 canonical system specification for a simple but full project rename from ENGI to Bitcode, including denomination rename from NGI to BTD, after V24 external-realization canon'
                : kind === 'delta'
                  ? 'V25 canonical delta for a simple but full project rename from ENGI to Bitcode and denomination rename from NGI to BTD after V24 external-realization canon'
                  : 'V25 canonical parity ledger for a simple but full project rename from ENGI to Bitcode and denomination rename from NGI to BTD',
    'Current canonical/latest target': `\`${version}\``,
    'Canonical proof-source commit': `\`${commit}\``,
    'Generated structured artifact inventory': sharedInventory
  };

  /** @type {Record<string, string>} */
  const kindSpecificValues = version === 'V21'
    ? {
        ...(kind !== 'delta'
          ? { 'Last fully realized canonical target preserved in source': '`V21`' }
          : {}),
        ...(kind === 'spec'
          ? {
              'Source parity state':
                'V21 source-side specifying implementation, appendix generation, specifying artifacts, and promotion sequencing are canonicalized in the promoted V21 file family',
              'V21 state':
                'canonical promotion complete; V21 is the active specifying-canon baseline and the V21 hand-authored plus generated canon are aligned'
            }
          : kind === 'delta'
            ? {
                'Source parity state':
                  'V21 source-side specifying implementation, appendix generation, specifying artifacts, and promotion sequencing are canonicalized; this delta records the V20-to-V21 closure',
                'V21 state':
                  'canonical promotion complete; V21 specifying canon is active and this delta records the promoted closure set'
              }
            : {
                'Source parity state':
                  'V21 source-side specifying implementation, appendix generation, specifying artifacts, and promotion sequencing are canonicalized; parity truth is aligned with the promoted V21 file family',
                'V21 state':
                  'canonical promotion complete; parity truth, generated canon, and hand-authored V21 status are aligned'
              })
      }
    : version === 'V22'
      ? {
        ...(kind !== 'delta'
          ? { 'Last fully realized canonical target preserved in source': '`V22`' }
          : {}),
        ...(kind === 'spec'
          ? {
              'Source parity state':
                'V22 source-side runtime/demo canon-posture drift detection, generated drift artifacts, promotion-time runtime preparation, and inherited proof/operator closure are canonicalized in the promoted V22 file family',
              'V22 state':
                'canonical promotion complete; V22 is the active system-facing canon and runtime, API, browser shell, tests, demo-local docs, and generated canon are aligned'
            }
          : kind === 'delta'
            ? {
                'Source parity state':
                  'V22 source-side runtime/demo canon-posture drift detection, generated drift artifacts, promotion-time runtime preparation, and inherited proof/operator closure are canonicalized; this delta records the V21-to-V22 closure',
                'V22 state':
                  'canonical promotion complete; V22 system-facing canon is active and this delta records the promoted drift-detection closure set'
              }
            : {
                'Source parity state':
                  'V22 source-side runtime/demo canon-posture drift detection, generated drift artifacts, promotion-time runtime preparation, and inherited proof/operator closure are canonicalized; parity truth is aligned with the promoted V22 file family',
                'V22 state':
                  'canonical promotion complete; parity truth, runtime posture truth, and generated canon are aligned for V22'
              })
      }
      : version === 'V23'
      ? {
        ...(kind !== 'delta'
          ? { 'Last fully realized canonical target preserved in source': '`V23`' }
          : {}),
        ...(kind === 'spec'
          ? {
              'Source parity state':
                'V23 source-side bitcoin-facing artifacts, sidechain-connected settlement interfaces, prototype compute/storage reality manifests, canon-posture drift detection, and generated evidence are canonicalized in the promoted V23 file family',
              'V23 state':
                'canonical promotion complete; V23 is the active deployed-infrastructure canon and runtime, API, browser shell, tests, demo-local docs, and generated canon are aligned'
            }
          : kind === 'delta'
            ? {
                'Source parity state':
                  'V23 source-side bitcoin-facing artifacts, sidechain-connected settlement interfaces, prototype compute/storage reality manifests, canon-posture drift detection, and generated evidence are canonicalized; this delta records the V22-to-V23 closure',
                'V23 state':
                  'canonical promotion complete; V23 deployed-infrastructure canon is active and this delta records the promoted bitcoin-interface and compute/storage closure set'
              }
            : {
                'Source parity state':
                  'V23 source-side bitcoin-facing artifacts, sidechain-connected settlement interfaces, prototype compute/storage reality manifests, canon-posture drift detection, and generated evidence are canonicalized; parity truth is aligned with the promoted V23 file family',
                'V23 state':
                  'canonical promotion complete; parity truth, runtime posture truth, bitcoin-facing closure, and generated canon are aligned for V23'
              })
      }
      : version === 'V24'
      ? {
        ...(kind !== 'delta'
          ? { 'Last fully realized canonical target preserved in source': '`V24`' }
          : {}),
        ...(kind === 'spec'
          ? {
              'Source parity state':
                'V24 source-side mode-isolated external realization, live adapter contracts, continuity and reconciliation ledgers, exhaustive telemetry, build-process enforcement, and generated evidence are canonicalized in the promoted V24 file family',
              'V24 state':
                'canonical promotion complete; V24 is the active external-realization canon and runtime, API, browser shell, tests, demo-local docs, and generated canon are aligned'
            }
          : kind === 'delta'
            ? {
                'Source parity state':
                  'V24 source-side mode-isolated external realization, live adapter contracts, continuity and reconciliation ledgers, exhaustive telemetry, build-process enforcement, and generated evidence are canonicalized; this delta records the V23-to-V24 closure',
                'V24 state':
                  'canonical promotion complete; V24 external-realization canon is active and this delta records the promoted external-interface, telemetry, and conformance closure set'
              }
            : {
                'Source parity state':
                  'V24 source-side mode-isolated external realization, live adapter contracts, continuity and reconciliation ledgers, exhaustive telemetry, build-process enforcement, and generated evidence are canonicalized; parity truth is aligned with the promoted V24 file family',
                'V24 state':
                  'canonical promotion complete; parity truth, runtime posture truth, external-realization closure, and generated canon are aligned for V24'
              })
      }
      : {
        ...(kind !== 'delta'
          ? { 'Last fully realized canonical target preserved in source': '`V25`' }
          : {}),
        ...(kind === 'spec'
          ? {
              'Source parity state':
                'V25 source-side Bitcode/BTD rename closure, brand-aware generated evidence, runtime/demo/site rename alignment, and promotion-time rename preparation are canonicalized in the promoted V25 file family',
              'V25 state':
                'canonical promotion complete; V25 is the active Bitcode rename canon and runtime, API, browser shell, tests, demo-local docs, and generated canon are aligned'
            }
          : kind === 'delta'
            ? {
                'Source parity state':
                  'V25 source-side Bitcode/BTD rename closure, brand-aware generated evidence, runtime/demo/site rename alignment, and promotion-time rename preparation are canonicalized; this delta records the V24-to-V25 closure',
                'V25 state':
                  'canonical promotion complete; V25 rename canon is active and this delta records the promoted Bitcode/BTD closure set'
              }
            : {
                'Source parity state':
                  'V25 source-side Bitcode/BTD rename closure, brand-aware generated evidence, runtime/demo/site rename alignment, and promotion-time rename preparation are canonicalized; parity truth is aligned with the promoted V25 file family',
                'V25 state':
                  'canonical promotion complete; parity truth, runtime posture truth, rename closure, and generated canon are aligned for V25'
              })
      };

  return rewriteStatusValues(content, {
    ...sharedValues,
    ...kindSpecificValues
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const version = args.version || '';
  const commit = args.commit || '';
  if (!version) throw new Error('A --version is required.');
  if (!commit) throw new Error('A --commit is required.');

  const resolvedRepoRoot = path.resolve(args.repoRoot || repoRoot);
  const isRootBitcodeSpecFamily = /^V\d+$/.test(version) && Number(version.slice(1)) >= 26;
  const files = isRootBitcodeSpecFamily
    ? [
        ['spec', path.join(resolvedRepoRoot, 'specifications', `BITCODE_SPEC_${version}.md`)],
        ['delta', path.join(resolvedRepoRoot, 'specifications', `BITCODE_SPEC_${version}_DELTA.md`)],
        ['notes', path.join(resolvedRepoRoot, 'specifications', `BITCODE_SPEC_${version}_NOTES.md`)],
        ['parity', path.join(resolvedRepoRoot, 'specifications', `BITCODE_SPEC_${version}_PARITY_MATRIX.md`)]
      ]
    : [
        ['spec', path.join(resolvedRepoRoot, `_legacy/ENGI_SPEC_${version}.md`)],
        ['delta', path.join(resolvedRepoRoot, `_legacy/ENGI_SPEC_${version}_DELTA.md`)],
        ['parity', path.join(resolvedRepoRoot, `_legacy/ENGI_SPEC_${version}_PARITY_MATRIX.md`)]
      ];

  for (const [kind, filePath] of files) {
    const original = await fs.readFile(filePath, 'utf8');
    const rewritten = rewritePromotionStatus(
      version,
      commit,
      original,
      /** @type {'spec' | 'delta' | 'notes' | 'parity'} */ (kind)
    );
    await fs.writeFile(filePath, rewritten, 'utf8');
  }

  process.stdout.write(`Prepared ${version} hand-authored spec family for promotion with proof-source commit ${commit}\n`);
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
});
