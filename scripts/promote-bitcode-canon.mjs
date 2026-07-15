#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function archivedSpecPath(version, suffix = '') {
  const numeric = Number(String(version || '').replace(/^V/u, ''));
  return Number.isInteger(numeric) && numeric >= 26
    ? path.join(repoRoot, `BITCODE_SPEC_${version}${suffix}.md`)
    : path.join(repoRoot, `_legacy/ENGI_SPEC_${version}${suffix}.md`);
}

function archivedProvenOutput(version) {
  const numeric = Number(String(version || '').replace(/^V/u, ''));
  return Number.isInteger(numeric) && numeric >= 26
    ? `BITCODE_SPEC_${version}_PROVEN.md`
    : `_legacy/ENGI_SPEC_${version}_PROVEN.md`;
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{ version?: string, commit?: string, dryRun?: boolean, allowDirtyStart?: boolean, help?: boolean }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--version') args.version = argv[++index];
    else if (arg === '--commit') args.commit = argv[++index];
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--allow-dirty-start') args.allowDirtyStart = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: npm run promote:canon -- --version V20 --commit <proof-source-commit> [--dry-run]',
      '',
      'Options:',
      '  --version <VN>           Canonical version to promote. Accepted targets: V19, V20, V21, V22, V23, V24, V25, V28, V29, V30, V31, V32, V33, V34, V35, V36, V37, V38, V39, V40, V41, V42, V43, V44, V45, V46, V47.',
      '  --commit <sha>           Proof-source commit to render into the generated appendix.',
      '  --dry-run                Print the promotion plan without executing commands or writing files.',
      '  --allow-dirty-start      Permit a dirty worktree before promotion. Not for canonical use.',
      '  --help                   Show this help.'
    ].join('\n')
  );
}

/**
 * @param {string[]} args
 * @returns {string}
 */
function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim();
}

/**
 * @param {string} file
 * @param {string[]} args
 * @returns {string}
 */
function renderCommand(file, args) {
  return [file, ...args].join(' ');
}

/**
 * @param {string} content
 * @param {string} label
 */
function extractStatusValue(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^- ${escaped}: (.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

/**
 * @param {string} value
 */
function normalize(value) {
  return value.toLowerCase().replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} content
 * @param {string} headingPhrase
 * @returns {string}
 */
function extractSection(content, headingPhrase) {
  const lines = content.split('\n');
  const normalizedHeadingPhrase = normalize(headingPhrase);
  let start = -1;
  let level = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{2,6})\s+(.+)$/);
    if (!match) continue;
    if (normalize(match[2]).includes(normalizedHeadingPhrase)) {
      start = index + 1;
      level = match[1].length;
      break;
    }
  }
  if (start < 0) return '';
  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{2,6})\s+(.+)$/);
    if (!match) continue;
    if (match[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

/**
 * @param {string} content
 * @returns {string[]}
 */
function extractBulletedItems(content) {
  return content
    .split('\n')
    .map((line) => line.match(/^\s*-\s+(.+)$/))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

/**
 * @param {string} content
 * @returns {string[]}
 */
function extractOrderedItems(content) {
  return content
    .split('\n')
    .map((line) => line.match(/^\s*\d+\.\s+(.+)$/))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

/**
 * @param {string} value
 */
function stripMarkdown(value) {
  return value.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} value
 */
function trimTrailingPeriod(value) {
  return value.replace(/[.]+$/u, '').trim();
}

/**
 * @param {string} value
 */
function normalizeActivePromotionLanguage(value) {
  return value
    .replaceAll('scripts/check-engi-canonical-inputs.mjs', 'scripts/check-bitcode-canonical-inputs.mjs')
    .replaceAll('scripts/check-engi-spec-family.mjs', 'scripts/check-bitcode-spec-family.mjs')
    .replaceAll('scripts/prepare-engi-spec-family-promotion.mjs', 'scripts/prepare-bitcode-spec-family-promotion.mjs')
    .replaceAll('scripts/promote-engi-canon.mjs', 'scripts/promote-bitcode-canon.mjs')
    .replaceAll('generate-engi-proven.mjs', 'generate-bitcode-proven.mjs')
    .replaceAll('engi-demo/src/', 'protocol-demonstration/src/')
    .replaceAll('engi-demo/', 'protocol-demonstration/')
    .replaceAll('.engi/', '.bitcode/');
}

/**
 * @param {string[]} items
 */
function joinHumanList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * @param {string} section
 * @returns {Array<Record<string, string>>}
 */
function parseMarkdownTable(section) {
  const lines = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
  if (lines.length < 3) return [];
  const headers = lines[0]
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
  return lines.slice(2).map((line) => {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || '']));
  });
}

/**
 * @param {string} scope
 */
function deriveScopeFocus(scope) {
  const stripped = stripMarkdown(scope || '');
  const match = stripped.match(/^V\d+\s+draft\s+(?:system\s+)?specification\s+for\s+(.+?)(?:\s+after\s+.+)?$/i);
  if (match) return trimTrailingPeriod(match[1]);
  const canonicalDraftMatch = stripped.match(/^V\d+\s+canonical\s+(?:system\s+)?(?:specification|delta|parity ledger)\s+draft\s+for\s+(.+?)(?:\s+after\s+.+)?$/i);
  if (canonicalDraftMatch) return trimTrailingPeriod(canonicalDraftMatch[1]);
  const canonicalMatch = stripped.match(/^V\d+\s+canonical\s+(?:system\s+)?(?:specification|delta|parity ledger)\s+for\s+(.+?)(?:\s+after\s+.+)?$/i);
  if (canonicalMatch) return trimTrailingPeriod(canonicalMatch[1]);
  return 'specifying-canon hardening';
}

/**
 * @param {string} section
 */
function deriveCarrierBullet(section) {
  const carriers = extractBulletedItems(section)
    .filter((item) => /catalog|matrix|ledger|map/i.test(item))
    .map((item) =>
      trimTrailingPeriod(
        stripMarkdown(item)
          .replace(/^(a|an)\s+/i, '')
          .replace(/^and\s+/i, '')
          .replace(/,+$/u, '')
          .replace(/\s+or equivalent section$/i, '')
      )
    );
  if (carriers.length === 0) return '';
  return `appendix-grade totality carriers in SPEC for ${joinHumanList(carriers)}`;
}

/**
 * @param {Array<Record<string, string>>} rows
 * @param {string} area
 */
function findParityRow(rows, area) {
  return rows.find((row) =>
    normalize(row.Area || row['Parity area'] || row['Pipeline / UX surface'] || row['Gate 8 metadevelopment surface'] || row['Carryforward surface'] || '') === normalize(area)
  );
}

/**
 * @param {string} version
 * @returns {Promise<{ spec: string, delta: string, parity: string }>}
 */
async function readSpecFamily(version) {
  const [spec, delta, parity] = await Promise.all([
    fs.readFile(archivedSpecPath(version), 'utf8'),
    fs.readFile(archivedSpecPath(version, '_DELTA'), 'utf8'),
    fs.readFile(archivedSpecPath(version, '_PARITY_MATRIX'), 'utf8')
  ]);
  return { spec, delta, parity };
}

/**
 * @param {string} version
 * @param {string} commit
 */
function buildCommandPlan(version, commit) {
  const v21DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V21', '--mode', 'draft', '--current-target', 'V20']];
  const v21CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V20']];
  const v21PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V21', '--commit', commit]];
  const v21PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V21']];
  const v21PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V21', '--mode', 'promoted']];
  const v22DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V22', '--mode', 'draft', '--current-target', 'V21']];
  const v22CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V21']];
  const v22DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V21', '--draft-target', 'V22']];
  const v22PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V22', '--commit', commit]];
  const v22PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V22', '--next-draft', 'V23']];
  const v22PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V22']];
  const v22PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V22', '--mode', 'promoted']];
  const v22PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V22', '--draft-target', 'V23']];
  const v23DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V23', '--mode', 'draft', '--current-target', 'V22']];
  const v23CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V22']];
  const v23DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V22', '--draft-target', 'V23']];
  const v23PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V23', '--commit', commit]];
  const v23PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V23', '--next-draft', 'V24']];
  const v23PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V23']];
  const v23PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V23', '--mode', 'promoted']];
  const v23PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V23', '--draft-target', 'V24']];
  const v24DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V24', '--mode', 'draft', '--current-target', 'V23']];
  const v24CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V23']];
  const v24DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V23', '--draft-target', 'V24']];
  const v24PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V24', '--commit', commit]];
  const v24PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V24', '--next-draft', 'V25']];
  const v24PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V24']];
  const v24PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V24', '--mode', 'promoted']];
  const v24PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V24', '--draft-target', 'V25']];
  const v25DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V25', '--mode', 'draft', '--current-target', 'V24']];
  const v25CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V24']];
  const v25DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V24', '--draft-target', 'V25']];
  const v25PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V25', '--commit', commit]];
  const v25PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V25', '--next-draft', 'V26']];
  const v25PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V25']];
  const v25PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V25', '--mode', 'promoted']];
  const v25PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V25', '--draft-target', 'V26']];
  const v28DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V28', '--mode', 'draft', '--current-target', 'V27']];
  const v28CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V27']];
  const v28DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V27', '--draft-target', 'V28']];
  const v28MetadevelopmentReadinessCommand = ['node', ['scripts/check-v28-metadevelopment-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v28Gate9Command = ['node', ['scripts/check-v28-gate9-depository-evidence.mjs']];
  const v28Gate10Command = ['node', ['scripts/check-v28-gate10-read-need-comprehension.mjs']];
  const v28Gate11Command = ['node', ['scripts/check-v28-gate11-read-fits-finding-preview.mjs']];
  const v28Gate12Command = ['node', ['scripts/check-v28-gate12-settlement-rights-delivery.mjs']];
  const v28Gate13Command = ['node', ['scripts/check-v28-gate13-product-closure-promotion-readiness.mjs']];
  const v28PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V28', '--commit', commit]];
  const v28PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V28', '--next-draft', 'V29']];
  const v28PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V28']];
  const v28PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V28', '--mode', 'promoted']];
  const v28PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V28', '--draft-target', 'V29']];
  const v29DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V29', '--mode', 'draft', '--current-target', 'V28']];
  const v29CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V28']];
  const v29DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V28', '--draft-target', 'V29']];
  const v29Gate1Command = ['node', ['scripts/check-v29-gate1-objectives-and-gating.mjs', '--skip-branch-check']];
  const v29Gate2Command = ['node', ['scripts/check-v29-gate2-terminal-transaction-read-models.mjs', '--skip-branch-check']];
  const v29Gate3Command = ['node', ['scripts/check-v29-gate3-wallet-signer-btc-operations.mjs', '--skip-branch-check']];
  const v29Gate4Command = ['node', ['scripts/check-v29-gate4-reading-pipeline-observability.mjs', '--skip-branch-check']];
  const v29Gate5Command = ['node', ['scripts/check-v29-gate5-assetpack-disclosure-rights.mjs', '--skip-branch-check']];
  const v29Gate6Command = ['node', ['scripts/check-v29-gate6-settlement-reconciliation-repair.mjs', '--skip-branch-check']];
  const v29Gate7Command = ['node', ['scripts/check-v29-gate7-organization-permission-authority.mjs', '--skip-branch-check']];
  const v29Gate8Command = ['node', ['scripts/check-v29-gate8-demonstration-origin-formalization.mjs', '--skip-branch-check']];
  const v29Gate9Command = ['node', ['scripts/check-v29-gate9-terminal-ux-browser-proof.mjs', '--skip-branch-check']];
  const v29Gate10Command = ['node', ['scripts/check-v29-gate10-local-staging-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v29PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V29', '--commit', commit]];
  const v29PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V29', '--next-draft', 'V30']];
  const v29PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V29']];
  const v29PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V29', '--mode', 'promoted']];
  const v29PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V29', '--draft-target', 'V30']];
  const v30DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V30', '--mode', 'draft', '--current-target', 'V29']];
  const v30CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V29']];
  const v30DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V29', '--draft-target', 'V30']];
  const v30Gate1Command = ['node', ['scripts/check-v30-gate1-roadmap-and-gating.mjs', '--skip-branch-check']];
  const v30Gate2Command = ['node', ['scripts/check-v30-gate2-protocol-package-api-boundaries.mjs', '--skip-branch-check']];
  const v30Gate3Command = ['node', ['scripts/check-v30-gate3-bitcoin-taproot-psbt-fee-rigor.mjs', '--skip-branch-check']];
  const v30Gate4Command = ['node', ['scripts/check-v30-gate4-btd-assetpack-mint-read-receipts.mjs', '--skip-branch-check']];
  const v30Gate5Command = ['node', ['scripts/check-v30-gate5-testnet-ledger-projection-hardening.mjs', '--skip-branch-check']];
  const v30Gate6Command = ['node', ['scripts/check-v30-gate6-source-to-shares-proof-cleanup.mjs', '--skip-branch-check']];
  const v30Gate7Command = ['node', ['scripts/check-v30-gate7-bridge-readiness-research-boundaries.mjs', '--skip-branch-check']];
  const v30Gate8Command = ['node', ['scripts/check-v30-gate8-protocol-telemetry-proof-hooks.mjs', '--skip-branch-check']];
  const v30Gate9Command = ['node', ['scripts/check-v30-gate9-interface-integration-regression-proof.mjs', '--skip-branch-check']];
  const v30Gate10Command = ['node', ['scripts/check-v30-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v30PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V30', '--commit', commit]];
  const v30PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V30', '--next-draft', 'V31']];
  const v30PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V30']];
  const v30PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V30', '--mode', 'promoted']];
  const v30PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V30', '--draft-target', 'V31']];
  const v31DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V31', '--mode', 'draft', '--current-target', 'V30']];
  const v31CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V30']];
  const v31DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V30', '--draft-target', 'V31']];
  const v31Gate1Command = ['node', ['scripts/check-v31-gate1-spec-roadmap-opening.mjs', '--skip-branch-check']];
  const v31Gate2Command = ['node', ['scripts/check-v31-gate2-auxillaries-package-route-contracts.mjs', '--skip-branch-check']];
  const v31Gate3Command = ['node', ['scripts/check-v31-gate3-profile-account-state.mjs', '--skip-branch-check']];
  const v31Gate4Command = ['node', ['scripts/check-v31-gate4-connects-provider-readiness.mjs', '--skip-branch-check']];
  const v31Gate5Command = ['node', ['scripts/check-v31-gate5-wallet-btd-pane-readiness.mjs', '--skip-branch-check']];
  const v31Gate6Command = ['node', ['scripts/check-v31-gate6-organization-team-role-policy-authority.mjs', '--skip-branch-check']];
  const v31Gate7Command = ['node', ['scripts/check-v31-gate7-interfaces-pane-admission-cross-surface-contracts.mjs', '--skip-branch-check']];
  const v31Gate8Command = ['node', ['scripts/check-v31-gate8-auxillaries-ux-accessibility-responsive-proof.mjs', '--skip-branch-check']];
  const v31Gate9Command = ['node', ['scripts/check-v31-gate9-auxillaries-telemetry-proof-recovery-runs.mjs', '--skip-branch-check']];
  const v31Gate10Command = ['node', ['scripts/check-v31-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v31PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V31', '--commit', commit]];
  const v31PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V31', '--next-draft', 'V32']];
  const v31PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V31']];
  const v31PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V31', '--mode', 'promoted']];
  const v31PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V31', '--draft-target', 'V32']];
  const v32DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V32', '--mode', 'draft', '--current-target', 'V31']];
  const v32CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V31']];
  const v32DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V31', '--draft-target', 'V32']];
  const v32Gate1Command = ['node', ['scripts/check-v32-gate1-provation-roadmap-opening.mjs', '--skip-branch-check']];
  const v32Gate2Command = ['node', ['scripts/check-v32-gate2-proof-matrix-inventory.mjs', '--skip-branch-check']];
  const v32Gate3Command = ['node', ['scripts/check-v32-gate3-deterministic-replay-artifact-stability.mjs', '--skip-branch-check']];
  const v32Gate4Command = ['node', ['scripts/check-v32-gate4-reading-pipeline-proof-coverage.mjs', '--skip-branch-check']];
  const v32Gate5Command = ['node', ['scripts/check-v32-gate5-ledger-btd-settlement-failure-states.mjs', '--skip-branch-check']];
  const v32Gate6Command = ['node', ['scripts/check-v32-gate6-interface-contract-regression-suites.mjs', '--skip-branch-check']];
  const v32Gate7Command = ['node', ['scripts/check-v32-gate7-browser-accessibility-responsive-visual-proof.mjs', '--skip-branch-check']];
  const v32Gate8Command = ['node', ['scripts/check-v32-gate8-testnet-mainnet-readiness-rehearsal.mjs', '--skip-branch-check']];
  const v32Gate9Command = ['node', ['scripts/check-v32-gate9-promotion-proof-generation-hardening.mjs', '--skip-branch-check']];
  const v32Gate10Command = ['node', ['scripts/check-v32-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v32PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V32', '--commit', commit]];
  const v32PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V32', '--next-draft', 'V33']];
  const v32PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V32']];
  const v32PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V32', '--mode', 'promoted']];
  const v32PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V32', '--draft-target', 'V33']];
  const v33DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V33', '--mode', 'draft', '--current-target', 'V32']];
  const v33CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V32']];
  const v33DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V32', '--draft-target', 'V33']];
  const v33Gate1Command = ['node', ['scripts/check-v33-gate1-interface-roadmap-opening.mjs', '--skip-branch-check']];
  const v33Gate2Command = ['node', ['scripts/check-v33-gate2-interface-contract-catalog.mjs', '--skip-branch-check']];
  const v33Gate3Command = ['node', ['scripts/check-v33-gate3-mcp-api-tool-contracts.mjs', '--skip-branch-check']];
  const v33Gate4Command = ['node', ['scripts/check-v33-gate4-chatgpt-app-action-contracts.mjs', '--skip-branch-check']];
  const v33Gate5Command = ['node', ['scripts/check-v33-gate5-interface-authorization-policy.mjs', '--skip-branch-check']];
  const v33Gate6Command = ['node', ['scripts/check-v33-gate6-read-license-assetpack-rights-contracts.mjs', '--skip-branch-check']];
  const v33Gate7Command = ['node', ['scripts/check-v33-gate7-api-schema-compatibility-matrix.mjs', '--skip-branch-check']];
  const v33Gate8Command = ['node', ['scripts/check-v33-gate8-interface-telemetry-proof-hooks.mjs', '--skip-branch-check']];
  const v33Gate9Command = ['node', ['scripts/check-v33-gate9-interface-consumer-ux-regression-proof.mjs', '--skip-branch-check']];
  const v33Gate10Command = ['node', ['scripts/check-v33-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v33PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V33', '--commit', commit]];
  const v33PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V33', '--next-draft', 'V34']];
  const v33PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V33']];
  const v33PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V33', '--mode', 'promoted']];
  const v33PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V33', '--draft-target', 'V34']];
  const v34DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V34', '--mode', 'draft', '--current-target', 'V33']];
  const v34CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V33']];
  const v34DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V33', '--draft-target', 'V34']];
  const v34Gate1Command = ['node', ['scripts/check-v34-gate1-deployment-roadmap-opening.mjs', '--skip-branch-check']];
  const v34Gate2Command = ['node', ['scripts/check-v34-gate2-host-capability-environment-lanes.mjs', '--skip-branch-check']];
  const v34Gate3Command = ['node', ['scripts/check-v34-gate3-distributed-execution-runtime-contracts.mjs', '--skip-branch-check']];
  const v34Gate4Command = ['node', ['scripts/check-v34-gate4-deployment-storage-posture.mjs', '--skip-branch-check']];
  const v34Gate5Command = ['node', ['scripts/check-v34-gate5-secret-rotation-boundary-operations.mjs', '--skip-branch-check']];
  const v34Gate6Command = ['node', ['scripts/check-v34-gate6-migration-cicd-approval-gates.mjs', '--skip-branch-check']];
  const v34Gate7Command = ['node', ['scripts/check-v34-gate7-runtime-observers-broadcasters-repair-jobs.mjs', '--skip-branch-check']];
  const v34Gate8Command = ['node', ['scripts/check-v34-gate8-rollback-upgrade-data-repair-playbooks.mjs', '--skip-branch-check']];
  const v34Gate9Command = ['node', ['scripts/check-v34-gate9-local-staging-testnet-deployment-rehearsal.mjs', '--skip-branch-check']];
  const v34Gate10Command = ['node', ['scripts/check-v34-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v34PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V34', '--commit', commit]];
  const v34PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V34', '--next-draft', 'V35']];
  const v34PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V34']];
  const v34PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V34', '--mode', 'promoted']];
  const v34PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V34', '--draft-target', 'V35']];
  const v35DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V35', '--mode', 'draft', '--current-target', 'V34']];
  const v35CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V34']];
  const v35DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V34', '--draft-target', 'V35']];
  const v35Gate1Command = ['node', ['scripts/check-v35-gate1-telemetry-docs-roadmap-opening.mjs', '--skip-branch-check']];
  const v35Gate2Command = ['node', ['scripts/check-v35-gate2-documentation-surface-catalog.mjs', '--skip-branch-check']];
  const v35Gate3Command = ['node', ['scripts/check-v35-gate3-telemetry-taxonomy-event-schema-redaction.mjs', '--skip-branch-check']];
  const v35Gate4Command = ['node', ['scripts/check-v35-gate4-public-docs-usage-guides.mjs', '--skip-branch-check']];
  const v35Gate5Command = ['node', ['scripts/check-v35-gate5-dashboards-alerts-runbooks-incident-escalation.mjs', '--skip-branch-check']];
  const v35Gate6Command = ['node', ['scripts/check-v35-gate6-documentation-qa-alignment-proofs.mjs', '--skip-branch-check']];
  const v35Gate7Command = ['node', ['scripts/check-v35-gate7-developer-operator-testnet-rollout-guides.mjs', '--skip-branch-check']];
  const v35Gate8Command = ['node', ['scripts/check-v35-gate8-telemetry-documentation-interface-integration.mjs', '--skip-branch-check']];
  const v35Gate9Command = ['node', ['scripts/check-v35-gate9-local-staging-telemetry-documentation-rehearsal.mjs', '--skip-branch-check']];
  const v35Gate10Command = ['node', ['scripts/check-v35-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v35PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V35', '--commit', commit]];
  const v35PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V35', '--next-draft', 'V36']];
  const v35PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V35']];
  const v35PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V35', '--mode', 'promoted', '--current-target', 'V35']];
  const v35PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V35', '--draft-target', 'V36']];
  const v36DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V36', '--mode', 'draft', '--current-target', 'V35']];
  const v36CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V35']];
  const v36DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V35', '--draft-target', 'V36']];
  const v36Gate1Command = ['node', ['scripts/check-v36-gate1-exchange-roadmap-opening.mjs', '--skip-branch-check']];
  const v36Gate2Command = ['node', ['scripts/check-v36-gate2-exchange-activity-book-market-master-detail.mjs', '--skip-branch-check']];
  const v36Gate3Command = ['node', ['scripts/check-v36-gate3-exchange-intent-order-contracts.mjs', '--skip-branch-check']];
  const v36Gate4Command = ['node', ['scripts/check-v36-gate4-exchange-rights-transfer-review.mjs', '--skip-branch-check']];
  const v36Gate5Command = ['node', ['scripts/check-v36-gate5-exchange-pricing-quote.mjs', '--skip-branch-check']];
  const v36Gate6Command = ['node', ['scripts/check-v36-gate6-exchange-settlement-reconciliation.mjs', '--skip-branch-check']];
  const v36Gate7Command = ['node', ['scripts/check-v36-gate7-exchange-dispute-repair-revenue-route.mjs', '--skip-branch-check']];
  const v36Gate8Command = ['node', ['scripts/check-v36-gate8-exchange-ux-proof.mjs', '--skip-branch-check']];
  const v36Gate9Command = ['node', ['scripts/check-v36-gate9-exchange-rehearsal.mjs', '--skip-branch-check']];
  const v36Gate10Command = ['node', ['scripts/check-v36-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v36PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V36', '--commit', commit]];
  const v36PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V36', '--next-draft', 'V37']];
  const v36PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V36']];
  const v36PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V36', '--mode', 'promoted', '--current-target', 'V36']];
  const v36PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V36', '--draft-target', 'V37']];
  const v37DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V37', '--mode', 'draft', '--current-target', 'V36']];
  const v37CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V36']];
  const v37DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V36', '--draft-target', 'V37']];
  const v37Gate1Command = ['node', ['scripts/check-v37-gate1-conversations-roadmap-opening.mjs', '--skip-branch-check']];
  const v37Gate2Command = ['node', ['scripts/check-v37-gate2-conversation-session-route-history-contracts.mjs', '--skip-branch-check']];
  const v37Gate3Command = ['node', ['scripts/check-v37-gate3-conversation-stream-event-contracts.mjs', '--skip-branch-check']];
  const v37Gate4Command = ['node', ['scripts/check-v37-gate4-conversation-writing-workspace.mjs', '--skip-branch-check']];
  const v37Gate5Command = ['node', ['scripts/check-v37-gate5-conversation-source-selector.mjs', '--skip-branch-check']];
  const v37Gate6Command = ['node', ['scripts/check-v37-gate6-conversation-product-handoff.mjs', '--skip-branch-check']];
  const v37Gate7Command = ['node', ['scripts/check-v37-gate7-conversation-persistence-privacy-redaction.mjs', '--skip-branch-check']];
  const v37Gate8Command = ['node', ['scripts/check-v37-gate8-conversation-telemetry-proof-hooks.mjs', '--skip-branch-check']];
  const v37Gate9Command = ['node', ['scripts/check-v37-gate9-conversation-rehearsal.mjs', '--skip-branch-check']];
  const v37Gate10Command = ['node', ['scripts/check-v37-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check']];
  const v37PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V37', '--commit', commit]];
  const v37PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V37', '--next-draft', 'V38']];
  const v37PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V37']];
  const v37PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V37', '--mode', 'promoted', '--current-target', 'V37']];
  const v37PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V37', '--draft-target', 'V38']];
  const v38DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V38', '--mode', 'draft', '--current-target', 'V37']];
  const v38CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V37']];
  const v38DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V37', '--draft-target', 'V38']];
  const v38Gate1Command = ['node', ['scripts/check-v38-gate1-inference-stack-roadmap-opening.mjs', '--skip-branch-check']];
  const v38Gate2Command = ['node', ['scripts/check-v38-gate2-inference-surface-inventory.mjs', '--skip-branch-check']];
  const v38Gate3Command = ['node', ['scripts/check-v38-gate3-ptrr-failsafe-thricified-stack.mjs', '--skip-branch-check']];
  const v38Gate4Command = ['node', ['scripts/check-v38-gate4-prompt-benchmark-report.mjs', '--skip-branch-check']];
  const v38Gate5Command = ['node', ['scripts/check-v38-gate5-inference-telemetry-disclosure-report.mjs', '--skip-branch-check']];
  const v38Gate6Command = ['node', ['scripts/check-v38-gate6-read-need-comprehension-inference-hardening.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v38Gate7Command = ['node', ['scripts/check-v38-gate7-read-fits-finding-search-embeddings.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v38Gate8Command = ['node', ['scripts/check-v38-gate8-assetpack-synthesis-economic-traceability.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v38Gate9Command = ['node', ['scripts/check-v38-gate9-conversation-tool-prompt-inference-parity.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v38Gate10Command = ['node', ['scripts/check-v38-gate10-local-staging-inference-depository-search-rehearsal.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v38Gate11Command = ['node', ['scripts/check-v38-gate11-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v38PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V38', '--commit', commit]];
  const v38PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V38', '--next-draft', 'V39']];
  const v38PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V38']];
  const v38PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V38', '--mode', 'promoted', '--current-target', 'V38']];
  const v38PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V38', '--draft-target', 'V39']];
  const v39DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V39', '--mode', 'draft', '--current-target', 'V38']];
  const v39CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V38']];
  const v39DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V38', '--draft-target', 'V39']];
  const v39Gate1Command = ['node', ['scripts/check-v39-gate1-commercial-reading-roadmap-opening.mjs', '--skip-branch-check']];
  const v39Gate2Command = ['node', ['scripts/check-v39-gate2-depository-supply-indexing.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v39Gate3Command = ['node', ['scripts/check-v39-gate3-enterprise-reading-ux-state.mjs', '--skip-branch-check', '--skip-uapi-tests']];
  const v39Gate4Command = ['node', ['scripts/check-v39-gate4-read-need-review-resynthesis.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v39Gate5Command = ['node', ['scripts/check-v39-gate5-read-fits-finding-runtime.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v39Gate6Command = ['node', ['scripts/check-v39-gate6-assetpack-preview-quote-boundary.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v39Gate7Command = ['node', ['scripts/check-v39-gate7-settlement-rights-delivery.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v39Gate8Command = ['node', ['scripts/check-v39-gate8-operational-telemetry-repair-readback.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v39Gate9Command = ['node', ['scripts/check-v39-gate9-interface-conversation-product-parity.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-interface-tests']];
  const v39Gate10Command = ['node', ['scripts/check-v39-gate10-local-staging-reading-rehearsal.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v39Gate11Command = ['node', ['scripts/check-v39-gate11-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v39PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V39', '--commit', commit]];
  const v39PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V39', '--next-draft', 'V40']];
  const v39PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V39']];
  const v39PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V39', '--mode', 'promoted', '--current-target', 'V39']];
  const v39PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V39', '--draft-target', 'V40']];
  const v40DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V40', '--mode', 'draft', '--current-target', 'V39']];
  const v40CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V39']];
  const v40DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V39', '--draft-target', 'V40']];
  const v40Gate1Command = ['node', ['scripts/check-v40-gate1-testing-roadmap-opening.mjs', '--skip-branch-check']];
  const v40Gate2Command = ['node', ['scripts/check-v40-gate2-test-inventory-coverage-matrix.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v40Gate3Command = ['node', ['scripts/check-v40-gate3-unit-coverage.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v40Gate4Command = ['node', ['scripts/check-v40-gate4-api-integration-contracts.mjs', '--skip-branch-check', '--skip-integration-tests']];
  const v40Gate5Command = ['node', ['scripts/check-v40-gate5-reading-pipeline-integration.mjs', '--skip-branch-check', '--skip-integration-tests']];
  const v40Gate6Command = ['node', ['scripts/check-v40-gate6-conversation-terminal-integration.mjs', '--skip-branch-check', '--skip-integration-tests']];
  const v40Gate7Command = ['node', ['scripts/check-v40-gate7-browser-e2e-visual-proof.mjs', '--skip-branch-check', '--skip-browser-tests']];
  const v40Gate8Command = ['node', ['scripts/check-v40-gate8-ledger-storage-sync.mjs', '--skip-branch-check', '--skip-integration-tests']];
  const v40Gate9Command = ['node', ['scripts/check-v40-gate9-local-staging-rehearsal-automation.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v40Gate10Command = ['node', ['scripts/check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v40Gate11Command = ['node', ['scripts/check-v40-gate11-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v40PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V40', '--commit', commit]];
  const v40PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V40', '--next-draft', 'V41']];
  const v40PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V40']];
  const v40PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V40', '--mode', 'promoted', '--current-target', 'V40']];
  const v40PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V40', '--draft-target', 'V41']];
  const v41DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V41', '--mode', 'draft', '--current-target', 'V40']];
  const v41CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V40']];
  const v41DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V40', '--draft-target', 'V41']];
  const v41Gate1Command = ['node', ['scripts/check-v41-gate1-prompt-program-roadmap-opening.mjs', '--skip-branch-check']];
  const v41Gate2Command = ['node', ['scripts/check-v41-gate2-promptpart-prompt-inventory.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v41Gate3Command = ['node', ['scripts/check-v41-gate3-registry-interpolation-contracts.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v41Gate4Command = ['node', ['scripts/check-v41-gate4-reading-prompt-benchmark-baselines.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v41Gate5Command = ['node', ['scripts/check-v41-gate5-readneed-prompt-hardening.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v41Gate6Command = ['node', ['scripts/check-v41-gate6-readfitsfinding-prompt-hardening.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v41Gate7Command = ['node', ['scripts/check-v41-gate7-conversation-tool-interface-prompt-rewrite.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v41Gate8Command = ['node', ['scripts/check-v41-gate8-prompt-program-benchmark-report.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v41Gate9Command = ['node', ['scripts/check-v41-gate9-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v41PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V41', '--commit', commit]];
  const v41PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V41', '--next-draft', 'V42']];
  const v41PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V41']];
  const v41PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V41', '--mode', 'promoted', '--current-target', 'V41']];
  const v41PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V41', '--draft-target', 'V42']];
  const v42DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V42', '--mode', 'draft', '--current-target', 'V41']];
  const v42CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V41']];
  const v42DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V41', '--draft-target', 'V42']];
  const v42Gate1Command = ['node', ['scripts/check-v42-gate1-mvp-experience-roadmap-opening.mjs', '--skip-branch-check']];
  const v42Gate2Command = ['node', ['scripts/check-v42-gate2-depositing-shortest-path.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v42Gate3Command = ['node', ['scripts/check-v42-gate3-reading-shortest-path-state-machine.mjs', '--skip-branch-check', '--skip-uapi-tests']];
  const v42Gate4Command = ['node', ['scripts/check-v42-gate4-readneed-review-resynthesis-product-closure.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v42Gate5Command = ['node', ['scripts/check-v42-gate5-readfitsfinding-preview-quote.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v42Gate6Command = ['node', ['scripts/check-v42-gate6-settlement-rights-delivery.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v42Gate7Command = ['node', ['scripts/check-v42-gate7-ai-reading-demonstration.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-demonstration-tests']];
  const v42Gate8Command = ['node', ['scripts/check-v42-gate8-local-staging-mvp-rehearsal.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v42Gate9Command = ['node', ['scripts/check-v42-gate9-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v42PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V42', '--commit', commit]];
  const v42PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V42', '--next-draft', 'V43']];
  const v42PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V42']];
  const v42PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V42', '--mode', 'promoted', '--current-target', 'V42']];
  const v42PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V42', '--draft-target', 'V43']];
  const v43DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V43', '--mode', 'draft', '--current-target', 'V42']];
  const v43CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V42']];
  const v43DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V42', '--draft-target', 'V43']];
  const v43Gate1Command = ['node', ['scripts/check-v43-gate1-packs-read-deposit-roadmap.mjs', '--skip-branch-check']];
  const v43Gate2Command = ['node', ['scripts/check-v43-gate2-route-vocabulary-inventory.mjs', '--skip-branch-check']];
  const v43Gate3Command = ['node', ['scripts/check-v43-gate3-packs-activity-master-detail.mjs', '--skip-branch-check', '--skip-uapi-tests']];
  const v43Gate4Command = ['node', ['scripts/check-v43-gate4-read-route-five-step-ux.mjs', '--skip-branch-check', '--skip-uapi-tests']];
  const v43Gate5Command = ['node', ['scripts/check-v43-gate5-deposit-route-options.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v43Gate6Command = ['node', ['scripts/check-v43-gate6-deposit-policy-compensation.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v43Gate7Command = ['node', ['scripts/check-v43-gate7-deposit-option-admission.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v43Gate8Command = ['node', ['scripts/check-v43-gate8-route-ux-product-excellence.mjs', '--skip-branch-check', '--skip-uapi-tests']];
  const v43Gate9Command = ['node', ['scripts/check-v43-gate9-cross-route-rehearsal-telemetry-repair.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v43Gate10Command = ['node', ['scripts/check-v43-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v43PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V43', '--commit', commit]];
  const v43PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V43', '--next-draft', 'V44']];
  const v43PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V43']];
  const v43PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V43', '--mode', 'promoted', '--current-target', 'V43']];
  const v43PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V43', '--draft-target', 'V44']];
  const v44DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V44', '--mode', 'draft', '--current-target', 'V43']];
  const v44CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V43']];
  const v44DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V43', '--draft-target', 'V44']];
  const v44Gate1Command = ['node', ['scripts/check-v44-gate1-scaled-economy-roadmap-opening.mjs', '--skip-branch-check']];
  const v44Gate2Command = ['node', ['scripts/check-v44-gate2-economic-domain-model.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v44Gate3Command = ['node', ['scripts/check-v44-gate3-packs-portfolio-market-intelligence.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v44Gate4Command = ['node', ['scripts/check-v44-gate4-reading-budget-quote-policy.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v44Gate5Command = ['node', ['scripts/check-v44-gate5-depositor-earnings-supply-opportunities.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v44Gate6Command = ['node', ['scripts/check-v44-gate6-btd-btc-compensation-statements.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v44Gate7Command = ['node', ['scripts/check-v44-gate7-organization-policy-wallet-authority.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v44Gate8Command = ['node', ['scripts/check-v44-gate8-enterprise-product-ux.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v44Gate9Command = ['node', ['scripts/check-v44-gate9-scaled-network-rehearsal.mjs', '--skip-branch-check', '--skip-uapi-tests', '--skip-package-tests']];
  const v44Gate10Command = ['node', ['scripts/check-v44-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v44PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V44', '--commit', commit]];
  const v44PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V44', '--next-draft', 'V45']];
  const v44PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V44']];
  const v44PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V44', '--mode', 'promoted', '--current-target', 'V44']];
  const v44PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V44', '--draft-target', 'V45']];
  const v45DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V45', '--mode', 'draft', '--current-target', 'V44']];
  const v45CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V44']];
  const v45DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V44', '--draft-target', 'V45']];
  const v45Gate2Command = ['node', ['scripts/check-v45-gate2-knowledge-commoditization-law.mjs', '--skip-branch-check']];
  const v45Gate3Command = ['node', ['scripts/check-v45-gate3-assetpack-lifecycle-state-machine.mjs', '--skip-branch-check']];
  const v45Gate4Command = ['node', ['scripts/check-v45-gate4-btd-scalar-volume-state-machine.mjs', '--skip-branch-check']];
  const v45Gate5Command = ['node', ['scripts/check-v45-gate5-btc-settlement-state-machine.mjs', '--skip-branch-check']];
  const v45Gate6Command = ['node', ['scripts/check-v45-gate6-spec-consolidation-sequencing.mjs', '--skip-branch-check']];
  const v45Gate7Command = ['node', ['scripts/check-v45-gate7-interface-authority-disclosure-boundaries.mjs', '--skip-branch-check']];
  const v45Gate8Command = ['node', ['scripts/check-v45-gate8-proof-readback-operational-boundaries.mjs', '--skip-branch-check']];
  const v45Gate9Command = ['node', ['scripts/check-v45-gate9-gate-taxonomy-formal-spec-readiness.mjs', '--skip-branch-check']];
  const v45Gate10Command = ['node', ['scripts/check-v45-gate10-formal-spec-consolidation.mjs', '--skip-branch-check']];
  const v45Gate11Command = ['node', ['scripts/check-v45-gate11-implementation-parity-audit.mjs', '--skip-branch-check']];
  const v45Gate12Command = ['node', ['scripts/check-v45-gate12-state-vocabulary-commodity-model.mjs', '--skip-branch-check']];
  const v45Gate13Command = ['node', ['scripts/check-v45-gate13-btd-scalar-volume-quote-conservation.mjs', '--skip-branch-check']];
  const v45Gate14Command = ['node', ['scripts/check-v45-gate14-btc-settlement-rights-delivery-readback.mjs', '--skip-branch-check']];
  const v45Gate15Command = ['node', ['scripts/check-v45-gate15-interface-disclosure-route-vocabulary-docs.mjs', '--skip-branch-check']];
  const v45Gate16Command = ['node', ['scripts/check-v45-gate16-proof-families-generated-artifacts.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v45Gate17Command = ['node', ['scripts/check-v45-gate17-source-safe-e2e-rehearsal.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-operator-dry-run']];
  const v45Gate18Command = ['node', ['scripts/check-v45-gate18-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v45PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V45', '--commit', commit]];
  const v45PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V45', '--next-draft', 'V46']];
  const v45PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V45']];
  const v45PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V45', '--mode', 'promoted', '--current-target', 'V45']];
  const v45PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V45', '--draft-target', 'V46']];
  const v46DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V46', '--mode', 'draft', '--current-target', 'V45']];
  const v46CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V45']];
  const v46DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V45', '--draft-target', 'V46']];
  const v46Gate1Command = ['node', ['scripts/check-v46-gate1-commercial-protocol-comprehension-roadmap.mjs', '--skip-branch-check']];
  const v46Gate2Command = ['node', ['scripts/check-v46-gate2-protocol-comprehension-object-model.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v46Gate3Command = ['node', ['scripts/check-v46-gate3-public-operator-claim-boundaries.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v46Gate4Command = ['node', ['scripts/check-v46-gate4-product-route-comprehension-readback.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v46Gate5Command = ['node', ['scripts/check-v46-gate5-interface-claim-contracts.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v46Gate6Command = ['node', ['scripts/check-v46-gate6-proof-readback-operator-explanation.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v46Gate7Command = ['node', ['scripts/check-v46-gate7-local-interface-comprehension-rehearsal.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v46Gate8Command = ['node', ['scripts/check-v46-gate8-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v46PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V46', '--commit', commit]];
  const v46PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V46', '--next-draft', 'V47']];
  const v46PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V46']];
  const v46PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V46', '--mode', 'promoted', '--current-target', 'V46']];
  const v46PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V46', '--draft-target', 'V47']];
  const v47DraftSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V47', '--mode', 'draft', '--current-target', 'V46']];
  const v47CanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V46']];
  const v47DraftCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V46', '--draft-target', 'V47']];
  const v47Gate1Command = ['node', ['scripts/check-v47-gate1-scope-measurement-launch-freeze.mjs', '--skip-branch-check']];
  const v47Gate2Command = ['node', ['scripts/check-v47-gate2-feature-excess-alignment-audit.mjs', '--skip-branch-check', '--skip-uapi-tests']];
  const v47Gate3Command = ['node', ['scripts/check-v47-gate3-seller-buyer-state-machine-law.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v47Gate4Command = ['node', ['scripts/check-v47-gate4-depositor-website-completion.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v47Gate5Command = ['node', ['scripts/check-v47-gate5-reader-website-completion.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v47Gate6Command = ['node', ['scripts/check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v47Gate7Command = ['node', ['scripts/check-v47-gate7-e2e-ip-selling-buying-tests.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v47Gate8Command = ['node', ['scripts/check-v47-gate8-landing-public-launch-messaging.mjs', '--skip-branch-check', '--skip-package-tests', '--skip-uapi-tests']];
  const v47Gate9Command = ['node', ['scripts/check-v47-gate9-staging-testnet-deployment-rehearsal.mjs', '--skip-branch-check', '--skip-package-tests']];
  const v47Gate10Command = ['node', ['scripts/check-v47-gate10-promotion-readiness.mjs', '--promotion-mode', '--skip-branch-check', '--skip-package-tests']];
  const v47PreparePromotionSpecFamilyCommand = ['node', ['scripts/prepare-bitcode-spec-family-promotion.mjs', '--version', 'V47', '--commit', commit]];
  const v47PrepareRuntimePromotionCommand = ['node', ['scripts/prepare-bitcode-runtime-canon-promotion.mjs', '--version', 'V47', '--next-draft', 'V48']];
  const v47PromotedCanonicalInputCheckCommand = ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V47']];
  const v47PromotedSpecCheckCommand = ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V47', '--mode', 'promoted', '--current-target', 'V47']];
  const v47PromotedCanonPostureDriftCommand = ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V47', '--draft-target', 'V48']];
  const inheritedProofCommands = [
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'typecheck']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:unit']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:integration']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:e2e']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:proof-member-matrix']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:theorem-evidence-matrix']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:state-machine']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:deterministic-replay']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:volatility']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:negative-mutation-matrix']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:contract-ledger']]
  ];
  const v20QualityCommands = [
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v20-operator-transcript']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v20-accessibility']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v20-visual']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v20-performance']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v20-projection-quality']],
    ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v20-quality-summary']]
  ];
  const generatedCommands = [
    ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
    ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
    ['git', ['diff', '--check']]
  ];
  if (version === 'V19') {
    return [
      ...inheritedProofCommands,
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ...generatedCommands
    ];
  }
  if (version === 'V20') {
    return [
      ...inheritedProofCommands,
      ...v20QualityCommands,
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ...generatedCommands
    ];
  }
  if (version === 'V21') {
    return [
      v21DraftSpecCheckCommand,
      v21CanonicalInputCheckCommand,
      ...inheritedProofCommands,
      ...v20QualityCommands,
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      v21PreparePromotionSpecFamilyCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v21PromotedCanonicalInputCheckCommand,
      v21PromotedSpecCheckCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V22') {
    return [
      v22DraftSpecCheckCommand,
      v22CanonicalInputCheckCommand,
      v22DraftCanonPostureDriftCommand,
      ...inheritedProofCommands,
      ...v20QualityCommands,
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      v22PreparePromotionSpecFamilyCommand,
      v22PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v22PromotedCanonicalInputCheckCommand,
      v22PromotedSpecCheckCommand,
      v22PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V23') {
    return [
      v23DraftSpecCheckCommand,
      v23CanonicalInputCheckCommand,
      v23DraftCanonPostureDriftCommand,
      ...inheritedProofCommands,
      ...v20QualityCommands,
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      v23PreparePromotionSpecFamilyCommand,
      v23PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v23PromotedCanonicalInputCheckCommand,
      v23PromotedSpecCheckCommand,
      v23PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V24') {
    return [
      v24DraftSpecCheckCommand,
      v24CanonicalInputCheckCommand,
      v24DraftCanonPostureDriftCommand,
      ...inheritedProofCommands,
      ...v20QualityCommands,
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      v24PreparePromotionSpecFamilyCommand,
      v24PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v24PromotedCanonicalInputCheckCommand,
      v24PromotedSpecCheckCommand,
      v24PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V25') {
    return [
      v25DraftSpecCheckCommand,
      v25CanonicalInputCheckCommand,
      v25DraftCanonPostureDriftCommand,
      ...inheritedProofCommands,
      ...v20QualityCommands,
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      v25PreparePromotionSpecFamilyCommand,
      v25PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v25PromotedCanonicalInputCheckCommand,
      v25PromotedSpecCheckCommand,
      v25PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V28') {
    return [
      v28DraftSpecCheckCommand,
      v28CanonicalInputCheckCommand,
      v28DraftCanonPostureDriftCommand,
      v28MetadevelopmentReadinessCommand,
      v28Gate9Command,
      v28Gate10Command,
      v28Gate11Command,
      v28Gate12Command,
      v28Gate13Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', 'tests/orbitalsInterfacesPane.test.tsx', '--runInBand']],
      v28PreparePromotionSpecFamilyCommand,
      v28PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v28PromotedCanonicalInputCheckCommand,
      v28PromotedSpecCheckCommand,
      v28PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V29') {
    return [
      v29DraftSpecCheckCommand,
      v29CanonicalInputCheckCommand,
      v29DraftCanonPostureDriftCommand,
      v29Gate1Command,
      v29Gate2Command,
      v29Gate3Command,
      v29Gate4Command,
      v29Gate5Command,
      v29Gate6Command,
      v29Gate7Command,
      v29Gate8Command,
      v29Gate9Command,
      v29Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      v29PreparePromotionSpecFamilyCommand,
      v29PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v29PromotedCanonicalInputCheckCommand,
      v29PromotedSpecCheckCommand,
      v29PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V30') {
    return [
      v30DraftSpecCheckCommand,
      v30CanonicalInputCheckCommand,
      v30DraftCanonPostureDriftCommand,
      v30Gate1Command,
      v30Gate2Command,
      v30Gate3Command,
      v30Gate4Command,
      v30Gate5Command,
      v30Gate6Command,
      v30Gate7Command,
      v30Gate8Command,
      v30Gate9Command,
      v30Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      v30PreparePromotionSpecFamilyCommand,
      v30PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v30PromotedCanonicalInputCheckCommand,
      v30PromotedSpecCheckCommand,
      v30PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V31') {
    return [
      v31DraftSpecCheckCommand,
      v31CanonicalInputCheckCommand,
      v31DraftCanonPostureDriftCommand,
      v31Gate1Command,
      v31Gate2Command,
      v31Gate3Command,
      v31Gate4Command,
      v31Gate5Command,
      v31Gate6Command,
      v31Gate7Command,
      v31Gate8Command,
      v31Gate9Command,
      v31Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/profileStep.test.tsx', 'tests/auxillariesExternalsPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/api/vcsRoutes.test.ts', 'tests/api/auxillariesGithubConnectionRoute.test.ts', '--runInBand']],
      v31PreparePromotionSpecFamilyCommand,
      v31PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v31PromotedCanonicalInputCheckCommand,
      v31PromotedSpecCheckCommand,
      v31PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V32') {
    return [
      v32DraftSpecCheckCommand,
      v32CanonicalInputCheckCommand,
      v32DraftCanonPostureDriftCommand,
      v32Gate1Command,
      v32Gate2Command,
      v32Gate3Command,
      v32Gate4Command,
      v32Gate5Command,
      v32Gate6Command,
      v32Gate7Command,
      v32Gate8Command,
      v32Gate9Command,
      v32Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:v32-browser-proof']],
      v32PreparePromotionSpecFamilyCommand,
      v32PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v32PromotedCanonicalInputCheckCommand,
      v32PromotedSpecCheckCommand,
      v32PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V33') {
    return [
      v33DraftSpecCheckCommand,
      v33CanonicalInputCheckCommand,
      v33DraftCanonPostureDriftCommand,
      v33Gate1Command,
      v33Gate2Command,
      v33Gate3Command,
      v33Gate4Command,
      v33Gate5Command,
      v33Gate6Command,
      v33Gate7Command,
      v33Gate8Command,
      v33Gate9Command,
      v33Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:v32-browser-proof']],
      v33PreparePromotionSpecFamilyCommand,
      v33PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v33PromotedCanonicalInputCheckCommand,
      v33PromotedSpecCheckCommand,
      v33PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V34') {
    return [
      v34DraftSpecCheckCommand,
      v34CanonicalInputCheckCommand,
      v34DraftCanonPostureDriftCommand,
      v34Gate1Command,
      v34Gate2Command,
      v34Gate3Command,
      v34Gate4Command,
      v34Gate5Command,
      v34Gate6Command,
      v34Gate7Command,
      v34Gate8Command,
      v34Gate9Command,
      v34Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:v32-browser-proof']],
      v34PreparePromotionSpecFamilyCommand,
      v34PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v34PromotedCanonicalInputCheckCommand,
      v34PromotedSpecCheckCommand,
      v34PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V35') {
    return [
      v35DraftSpecCheckCommand,
      v35CanonicalInputCheckCommand,
      v35DraftCanonPostureDriftCommand,
      v35Gate1Command,
      v35Gate2Command,
      v35Gate3Command,
      v35Gate4Command,
      v35Gate5Command,
      v35Gate6Command,
      v35Gate7Command,
      v35Gate8Command,
      v35Gate9Command,
      v35Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:v32-browser-proof']],
      v35PreparePromotionSpecFamilyCommand,
      v35PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v35PromotedCanonicalInputCheckCommand,
      v35PromotedSpecCheckCommand,
      v35PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V36') {
    return [
      v36DraftSpecCheckCommand,
      v36CanonicalInputCheckCommand,
      v36DraftCanonPostureDriftCommand,
      v36Gate1Command,
      v36Gate2Command,
      v36Gate3Command,
      v36Gate4Command,
      v36Gate5Command,
      v36Gate6Command,
      v36Gate7Command,
      v36Gate8Command,
      v36Gate9Command,
      v36Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:v32-browser-proof']],
      v36PreparePromotionSpecFamilyCommand,
      v36PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v36PromotedCanonicalInputCheckCommand,
      v36PromotedSpecCheckCommand,
      v36PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V37') {
    return [
      v37DraftSpecCheckCommand,
      v37CanonicalInputCheckCommand,
      v37DraftCanonPostureDriftCommand,
      v37Gate1Command,
      v37Gate2Command,
      v37Gate3Command,
      v37Gate4Command,
      v37Gate5Command,
      v37Gate6Command,
      v37Gate7Command,
      v37Gate8Command,
      v37Gate9Command,
      v37Gate10Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', 'tests/api/conversationSessionRouteHistory.test.ts', 'tests/api/conversationSessionRouteHistoryContract.test.ts', 'tests/api/conversationStreamEventContract.test.ts', 'tests/conversationStreamPipelineLog.test.tsx', 'tests/conversationWritingWorkspace.test.tsx', 'tests/conversationSourceSelector.test.tsx', 'tests/conversationTerminalHandoff.test.tsx', 'tests/api/conversationPersistencePrivacyRedaction.test.ts', 'tests/conversationPersistencePrivacyPanel.test.tsx', 'tests/api/conversationTelemetryProofHooks.test.ts', 'tests/conversationTelemetryProofPanel.test.tsx', 'tests/api/conversationRehearsal.test.ts', 'tests/conversationRehearsalPanel.test.tsx', '--runInBand']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'playwright', 'install', 'chromium', '--with-deps']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:terminal-ux']],
      ['pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:v32-browser-proof']],
      v37PreparePromotionSpecFamilyCommand,
      v37PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v37PromotedCanonicalInputCheckCommand,
      v37PromotedSpecCheckCommand,
      v37PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V38') {
    return [
      v38DraftSpecCheckCommand,
      v38CanonicalInputCheckCommand,
      v38DraftCanonPostureDriftCommand,
      v38Gate1Command,
      v38Gate2Command,
      v38Gate3Command,
      v38Gate4Command,
      v38Gate5Command,
      v38Gate6Command,
      v38Gate7Command,
      v38Gate8Command,
      v38Gate9Command,
      v38Gate10Command,
      v38Gate11Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', 'tests/api/conversationSessionRouteHistory.test.ts', 'tests/api/conversationSessionRouteHistoryContract.test.ts', 'tests/api/conversationStreamEventContract.test.ts', 'tests/conversationStreamPipelineLog.test.tsx', 'tests/conversationWritingWorkspace.test.tsx', 'tests/conversationSourceSelector.test.tsx', 'tests/conversationTerminalHandoff.test.tsx', 'tests/api/conversationPersistencePrivacyRedaction.test.ts', 'tests/conversationPersistencePrivacyPanel.test.tsx', 'tests/api/conversationTelemetryProofHooks.test.ts', 'tests/conversationTelemetryProofPanel.test.tsx', 'tests/api/conversationRehearsal.test.ts', 'tests/conversationRehearsalPanel.test.tsx', '--runInBand']],
      v38PreparePromotionSpecFamilyCommand,
      v38PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v38PromotedCanonicalInputCheckCommand,
      v38PromotedSpecCheckCommand,
      v38PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V39') {
    return [
      v39DraftSpecCheckCommand,
      v39CanonicalInputCheckCommand,
      v39DraftCanonPostureDriftCommand,
      v39Gate1Command,
      v39Gate2Command,
      v39Gate3Command,
      v39Gate4Command,
      v39Gate5Command,
      v39Gate6Command,
      v39Gate7Command,
      v39Gate8Command,
      v39Gate9Command,
      v39Gate10Command,
      v39Gate11Command,
      ['pnpm', ['test:qa:v28:pipeline-readback']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/userDataRoute.test.ts', 'tests/auxillariesWalletPane.test.tsx', 'tests/auxillariesContent.access.test.tsx', 'tests/auxillariesWorkspacePanels.access.test.tsx', 'tests/auxillariesWorkspacePanels.test.tsx', 'tests/api/auxillariesGithubConnectionRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/auxillariesExternalsPane.test.tsx', 'tests/profileStep.test.tsx', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/terminalDepositReadWorkbench.test.ts', 'tests/terminalTransactionQuery.test.ts', 'tests/terminalTransactionReadModel.test.ts', 'tests/terminalProtocolProjection.test.ts', 'tests/terminalInterfaceIntegrationRegression.test.ts', 'tests/terminalWalletBtcOperation.test.ts', 'tests/terminalJournalReconciliation.test.ts', 'tests/terminalOrganizationAuthority.test.ts', 'tests/protocolCommercialBoundary.test.ts', 'tests/terminalTransactionDetailCards.test.tsx', 'tests/terminalTransactionDetailSnapshot.test.ts', 'tests/terminalUxBrowserProof.test.tsx', 'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', 'tests/pipelineExecutionLogHeader.test.tsx', 'tests/api/conversationSessionRouteHistory.test.ts', 'tests/api/conversationSessionRouteHistoryContract.test.ts', 'tests/api/conversationStreamEventContract.test.ts', 'tests/conversationStreamPipelineLog.test.tsx', 'tests/conversationWritingWorkspace.test.tsx', 'tests/conversationSourceSelector.test.tsx', 'tests/conversationTerminalHandoff.test.tsx', 'tests/api/conversationPersistencePrivacyRedaction.test.ts', 'tests/conversationPersistencePrivacyPanel.test.tsx', 'tests/api/conversationTelemetryProofHooks.test.ts', 'tests/conversationTelemetryProofPanel.test.tsx', 'tests/api/conversationRehearsal.test.ts', 'tests/conversationRehearsalPanel.test.tsx', '--runInBand']],
      v39PreparePromotionSpecFamilyCommand,
      v39PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v39PromotedCanonicalInputCheckCommand,
      v39PromotedSpecCheckCommand,
      v39PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V40') {
    return [
      v40DraftSpecCheckCommand,
      v40CanonicalInputCheckCommand,
      v40DraftCanonPostureDriftCommand,
      v40Gate1Command,
      v40Gate2Command,
      v40Gate3Command,
      v40Gate4Command,
      v40Gate5Command,
      v40Gate6Command,
      v40Gate7Command,
      v40Gate8Command,
      v40Gate9Command,
      v40Gate10Command,
      v40Gate11Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v40PreparePromotionSpecFamilyCommand,
      v40PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v40PromotedCanonicalInputCheckCommand,
      v40PromotedSpecCheckCommand,
      v40PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V41') {
    return [
      v41DraftSpecCheckCommand,
      v41CanonicalInputCheckCommand,
      v41DraftCanonPostureDriftCommand,
      v41Gate1Command,
      v41Gate2Command,
      v41Gate3Command,
      v41Gate4Command,
      v41Gate5Command,
      v41Gate6Command,
      v41Gate7Command,
      v41Gate8Command,
      v41Gate9Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v41PreparePromotionSpecFamilyCommand,
      v41PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v41PromotedCanonicalInputCheckCommand,
      v41PromotedSpecCheckCommand,
      v41PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V42') {
    return [
      v42DraftSpecCheckCommand,
      v42CanonicalInputCheckCommand,
      v42DraftCanonPostureDriftCommand,
      v42Gate1Command,
      v42Gate2Command,
      v42Gate3Command,
      v42Gate4Command,
      v42Gate5Command,
      v42Gate6Command,
      v42Gate7Command,
      v42Gate8Command,
      v42Gate9Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v42PreparePromotionSpecFamilyCommand,
      v42PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v42PromotedCanonicalInputCheckCommand,
      v42PromotedSpecCheckCommand,
      v42PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V43') {
    return [
      v43DraftSpecCheckCommand,
      v43CanonicalInputCheckCommand,
      v43DraftCanonPostureDriftCommand,
      v43Gate1Command,
      v43Gate2Command,
      v43Gate3Command,
      v43Gate4Command,
      v43Gate5Command,
      v43Gate6Command,
      v43Gate7Command,
      v43Gate8Command,
      v43Gate9Command,
      v43Gate10Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v43PreparePromotionSpecFamilyCommand,
      v43PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v43PromotedCanonicalInputCheckCommand,
      v43PromotedSpecCheckCommand,
      v43PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V44') {
    return [
      v44DraftSpecCheckCommand,
      v44CanonicalInputCheckCommand,
      v44DraftCanonPostureDriftCommand,
      v44Gate1Command,
      v44Gate2Command,
      v44Gate3Command,
      v44Gate4Command,
      v44Gate5Command,
      v44Gate6Command,
      v44Gate7Command,
      v44Gate8Command,
      v44Gate9Command,
      v44Gate10Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v44PreparePromotionSpecFamilyCommand,
      v44PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v44PromotedCanonicalInputCheckCommand,
      v44PromotedSpecCheckCommand,
      v44PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V45') {
    return [
      v45DraftSpecCheckCommand,
      v45CanonicalInputCheckCommand,
      v45DraftCanonPostureDriftCommand,
      v45Gate2Command,
      v45Gate3Command,
      v45Gate4Command,
      v45Gate5Command,
      v45Gate6Command,
      v45Gate7Command,
      v45Gate8Command,
      v45Gate9Command,
      v45Gate10Command,
      v45Gate11Command,
      v45Gate12Command,
      v45Gate13Command,
      v45Gate14Command,
      v45Gate15Command,
      v45Gate16Command,
      v45Gate17Command,
      v45Gate18Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v45PreparePromotionSpecFamilyCommand,
      v45PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v45PromotedCanonicalInputCheckCommand,
      v45PromotedSpecCheckCommand,
      v45PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V46') {
    return [
      v46DraftSpecCheckCommand,
      v46CanonicalInputCheckCommand,
      v46DraftCanonPostureDriftCommand,
      v46Gate1Command,
      v46Gate2Command,
      v46Gate3Command,
      v46Gate4Command,
      v46Gate5Command,
      v46Gate6Command,
      v46Gate7Command,
      v46Gate8Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v46PreparePromotionSpecFamilyCommand,
      v46PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v46PromotedCanonicalInputCheckCommand,
      v46PromotedSpecCheckCommand,
      v46PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  if (version === 'V47') {
    return [
      v47DraftSpecCheckCommand,
      v47CanonicalInputCheckCommand,
      v47DraftCanonPostureDriftCommand,
      v47Gate1Command,
      v47Gate2Command,
      v47Gate3Command,
      v47Gate4Command,
      v47Gate5Command,
      v47Gate6Command,
      v47Gate7Command,
      v47Gate8Command,
      v47Gate9Command,
      v47Gate10Command,
      ['pnpm', ['--filter', '@bitcode/specifying', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/specifying', 'test']],
      ['pnpm', ['--filter', '@bitcode/btd', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/btd', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'test']],
      ['npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v28-mvp-qa']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'typecheck']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--passWithNoTests', '--forceExit']],
      v47PreparePromotionSpecFamilyCommand,
      v47PrepareRuntimePromotionCommand,
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--allow-dirty']],
      ['node', ['scripts/generate-bitcode-proven.mjs', '--version', version, '--commit', commit, '--worktree-state', 'clean', '--output', archivedProvenOutput(version), '--check', '--allow-dirty']],
      v47PromotedCanonicalInputCheckCommand,
      v47PromotedSpecCheckCommand,
      v47PromotedCanonPostureDriftCommand,
      ['git', ['diff', '--check']]
    ];
  }
  throw new Error(`Unsupported promotion target ${version}. Expected V19, V20, V21, V22, V23, V24, V25, V28, V29, V30, V31, V32, V33, V34, V35, V36, V37, V38, V39, V40, V41, V42, V43, V44, V45, or V46.`);
}

/**
 * @param {Array<[string, string[]]>} commands
 * @param {{ allowDirtyStart?: boolean | undefined, dirty?: boolean | undefined }} options
 * @returns {Array<[string, string[]]>}
 */
function rewriteCommandPlanForEnvironment(commands, { allowDirtyStart = false, dirty = false } = {}) {
  if (!allowDirtyStart || !dirty) return commands;
  return commands.map(([file, commandArgs]) => {
    if (file !== 'node' || commandArgs[0] !== 'scripts/generate-bitcode-proven.mjs') {
      return [file, [...commandArgs]];
    }
    /** @type {string[]} */
    const rewrittenArgs = [];
    for (let index = 0; index < commandArgs.length; index += 1) {
      const arg = commandArgs[index];
      if (arg === '--worktree-state') {
        rewrittenArgs.push(arg, 'dirty-preview');
        index += 1;
        continue;
      }
      rewrittenArgs.push(arg);
    }
    if (!rewrittenArgs.includes('--allow-dirty')) {
      rewrittenArgs.push('--allow-dirty');
    }
    return [file, rewrittenArgs];
  });
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV21CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V21');
  const scope = extractStatusValue(spec, 'Scope') || 'V21 draft specification for specifying-canon hardening';
  const focus = deriveScopeFocus(scope);
  const totalitySection = extractSection(spec, 'V21 totality and precision enforcement rule');
  const carrierBullet = deriveCarrierBullet(totalitySection);
  const deltaDecisionSection = extractSection(delta, 'Accepted V21 decisions');
  const acceptedDecisions = extractOrderedItems(deltaDecisionSection).map(stripMarkdown);
  const parityRows = parseMarkdownTable(extractSection(parity, 'V21 implementation matrix'));

  /** @type {string[]} */
  const bullets = [];

  const fileFamilyDecision = acceptedDecisions.find((item) =>
    normalize(item).includes('required hand-authored canonical system-spec files for v21+')
  );
  if (fileFamilyDecision) bullets.push(normalizeActivePromotionLanguage(trimTrailingPeriod(fileFamilyDecision)));

  const specAloneDecision = acceptedDecisions.find((item) => item.includes('A promoted SPEC must itself be full-system, re-implementable, and auditable'));
  if (specAloneDecision) bullets.push(normalizeActivePromotionLanguage(trimTrailingPeriod(specAloneDecision)));

  if (carrierBullet) bullets.push(normalizeActivePromotionLanguage(carrierBullet));

  const prioritizedAreas = [
    'Complete specifying authority',
    'Canonical-input validator',
    'Structural spec-family checker',
    'V21 appendix generation support',
    'Post-generation active-canon validation',
    'File-family promotion gate',
    'Commit-message derivation rule',
    'V21 promotion support'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const judgment = normalize(row.Judgment || '');
    if (judgment.includes('source gap') || judgment.includes('blocked')) continue;
    const closureSignal = trimTrailingPeriod(stripMarkdown(row['Closure signal'] || ''));
    if (!closureSignal) continue;
    if (/\bpending\b|blocked until|remains pending/i.test(closureSignal)) continue;
    bullets.push(normalizeActivePromotionLanguage(`${stripMarkdown(area)}: ${closureSignal}`));
  }

  return [
    `Promotes V21 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 8).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV22CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V22');
  const scope = extractStatusValue(spec, 'Scope') || 'V22 canonical system specification for runtime/operator drift-detection hardening after V21 specifying canon';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V22 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = parseMarkdownTable(extractSection(parity, 'V22 implementation matrix'));

  /** @type {string[]} */
  const bullets = [];

  const driftDecision = acceptedDecisions.find((item) => normalize(item).includes('single runtime-owned canon posture surface'));
  if (driftDecision) bullets.push(trimTrailingPeriod(driftDecision));

  const alignmentDecision = acceptedDecisions.find((item) => normalize(item).includes('api specversion, browser title/copy, operator status text, readme/demo docs, and test expectations should derive from the same canon posture source'));
  if (alignmentDecision) bullets.push(trimTrailingPeriod(alignmentDecision));

  const prioritizedAreas = [
    'Active canon posture in runtime',
    'Browser title and hero posture',
    'API posture',
    'Test posture',
    'Demo README posture',
    'Canon-truth coupling to promotion',
    'Second-pass proof/operator decision'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(stripMarkdown(row['Closure signal'] || row['V23 implementation expectation'] || row['Current source truth'] || ''));
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V22 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 8).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV23CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V23');
  const scope = extractStatusValue(spec, 'Scope') || 'V23 canonical system specification for bitcoin-backed audit, sidechain-connected settlement interfaces, and deployed compute/storage reality after V22 truth-aligned canon';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V23 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = parseMarkdownTable(extractSection(parity, 'V23 implementation matrix'));

  /** @type {string[]} */
  const bullets = [];

  const auditDecision = acceptedDecisions.find((item) => normalize(item).includes('bitcoin enters engi first as a commitment and spend substrate'));
  if (auditDecision) bullets.push(trimTrailingPeriod(auditDecision));

  const sidechainDecision = acceptedDecisions.find((item) => normalize(item).includes('sidechain connection point'));
  if (sidechainDecision) bullets.push(trimTrailingPeriod(sidechainDecision));

  const prioritizedAreas = [
    'Compute-reality surface',
    'Storage-reality surface',
    'Treasury-policy surface',
    'Bitcoin-facing artifact family',
    'Bitcoin proof-family validation',
    'Sidechain bridge mode and finalization policy',
    'Source emission',
    'Generated evidence'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(stripMarkdown(row['Closure signal'] || ''));
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V23 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 8).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV24CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V24');
  const scope = extractStatusValue(spec, 'Scope') || 'V24 canonical system specification for realizing external interfacing, exhaustive telemetry, and full-canon conformance after V23 deployed-infrastructure canon';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V24 drafting decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = parseMarkdownTable(extractSection(parity, 'V24 draft implementation matrix'));

  /** @type {string[]} */
  const bullets = [];

  const realizationDecision = acceptedDecisions.find((item) => normalize(item).includes('proof-bearing intent, execution, observation, and reconciliation receipts'));
  if (realizationDecision) bullets.push(trimTrailingPeriod(realizationDecision));

  const modeDecision = acceptedDecisions.find((item) => normalize(item).includes('four canonical execution modes'));
  if (modeDecision) bullets.push(trimTrailingPeriod(modeDecision));

  const prioritizedAreas = [
    'Environment-mode completeness',
    'Environment identity and resource isolation',
    'Real Bitcoin mainchain execution',
    'Real sidechain execution',
    'Compute container realization',
    'Storage container realization',
    'GitHub live sessions',
    'GitHub inventory and artifact fetch',
    'GitHub branch and PR mutation',
    'Telemetry policy and telemetry completeness',
    'Generated evidence'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(stripMarkdown(row['Closure signal'] || ''));
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V24 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 10).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV25CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V25');
  const scope = extractStatusValue(spec, 'Scope') || 'V25 canonical system specification for the final pre-Bitcode rename closure before V26 promotion';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(spec, 'V25 accepted drafting decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = parseMarkdownTable(extractSection(parity, 'V25 draft implementation matrix'));

  /** @type {string[]} */
  const bullets = [];
  const renameDecision = acceptedDecisions.find((item) => normalize(item).includes('rename target is bitcode'));
  if (renameDecision) bullets.push(trimTrailingPeriod(renameDecision));
  const denominationDecision = acceptedDecisions.find((item) => normalize(item).includes('denomination rename target is btd'));
  if (denominationDecision) bullets.push(trimTrailingPeriod(denominationDecision));

  const prioritizedAreas = [
    'System and product naming',
    'Denomination naming',
    'Runtime and API naming',
    'Demo and website naming',
    'Build and process naming',
    'Semantic invariance',
    'Generated evidence',
    'Canon promotion'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(stripMarkdown(row['Closure signal'] || row['V25 implementation expectation'] || ''));
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V25 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 10).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV28CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V28');
  const scope = extractStatusValue(spec, 'Scope') || 'V28 canonical system specification for commercial Protocol implementation and Terminal MVP QA';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V28 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'Staging-Testnet Minimal Commercial Parity Matrix')),
    ...parseMarkdownTable(extractSection(parity, 'Enterprise Reading Pipeline Parity Matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V28 Metadevelopment Parity Matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V28 Product-Gate Carryforward Audit'))
  ];

  /** @type {string[]} */
  const bullets = [];
  const protocolDecision = acceptedDecisions.find((item) =>
    normalize(item).includes('terminal, auxillaries readiness, btd range disclosure')
  );
  if (protocolDecision) bullets.push(trimTrailingPeriod(protocolDecision));

  const prioritizedAreas = [
    'Pipeline runtime deployment reality',
    'Five-step Terminal Reading UX',
    'Depository Finding Fits discovery',
    'Source-safe preview and Share-to-Fee',
    'Buy AssetPack and settle',
    'Branching and gate workflow standard',
    'Canonical promotion automation',
    'Commit quality and contribution discipline',
    'Remaining product-gate audit'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(stripMarkdown(row['Closure evidence required'] || row['Closure signal'] || row['Carryforward closure requirement'] || row['Current source evidence'] || ''));
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V28 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 12).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV29CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V29');
  const scope = extractStatusValue(spec, 'Scope') || 'V29 canonical system specification for Terminal transaction depth';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V29 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V29 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V29 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Terminal transaction read models',
    'Wallet signer/BTC operations',
    'Reading pipeline observability',
    'AssetPack disclosure rights',
    'Settlement reconciliation repair',
    'Organization permission authority',
    'Commercial formalization',
    'Terminal UX quality',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(stripMarkdown(row['Closure requirement'] || row['Required V29 result'] || row['Source evidence'] || ''));
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V29 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV30CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V30');
  const scope = extractStatusValue(spec, 'Scope') || 'V30 canonical system specification for Protocol/BTD hardening';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V30 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V30 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V30 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Protocol package API boundaries',
    'Bitcoin Taproot PSBT fee rigor',
    'BTD AssetPack mint/read receipts',
    'Testnet ledger projection hardening',
    'Source-to-shares proof cleanup',
    'Bridge-readiness research boundaries',
    'Protocol telemetry/proof hooks',
    'Interface integration regression',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V30 result'] || row['Closure signal'] || row['Source evidence'] || '')
        .replace('.bitcode/v30-,', '.bitcode/v30-*,')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V30 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV31CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V31');
  const scope = extractStatusValue(spec, 'Scope') || 'V31 canonical system specification for Auxillaries support/control surfaces';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V31 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V31 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V31 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Auxillaries package and route contracts',
    'Profile and account state',
    'Connects provider readiness and recovery',
    'Wallet and BTD pane readiness',
    'Organization team role policy authority',
    'Interfaces pane admission and cross-surface contracts',
    'Auxillaries UX accessibility and responsive proof',
    'Auxillaries telemetry proof and recovery runs',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V31 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V31 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV32CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V32');
  const scope = extractStatusValue(spec, 'Scope') || 'V32 canonical system specification for provation/testing over promoted Bitcode surfaces';
  const focus = deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V32 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V32 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V32 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Proof matrix inventory',
    'Deterministic replay package',
    'Reading pipeline proof coverage',
    'Ledger/BTD settlement failure-state coverage',
    'Interface contract regression suites',
    'Browser/accessibility/responsive/visual proof',
    'Testnet/mainnet readiness rehearsal',
    'Promotion proof hardening',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V32 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V32 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV33CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V33');
  const scope = extractStatusValue(spec, 'Scope') || 'V33 canonical system specification for commercial interface depth';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'commercial interface depth over promoted V32 proof/testing canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V33 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V33 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V33 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Interface contract catalog',
    'MCP API contracts',
    'ChatGPT App contracts',
    'Interface authorization policy',
    'Read license and AssetPack rights contracts',
    'API schema compatibility',
    'Interface telemetry proof hooks',
    'Interface consumer UX regression proof',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V33 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V33 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV34CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V34');
  const scope = extractStatusValue(spec, 'Scope') || 'V34 canonical system specification for deployment depth';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'deployment depth over promoted V33 commercial interface canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V34 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V34 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V34 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Host capability and environment lane catalog',
    'Distributed execution runtime contracts',
    'Ledger/database/object-storage posture',
    'Secret rotation and credential boundaries',
    'Migration CI/CD deployment approval gates',
    'Runtime observers, broadcasters, and repair jobs',
    'Rollback, upgrade, and data repair playbooks',
    'Local and staging-testnet deployment rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V34 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V34 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV35CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V35');
  const scope = extractStatusValue(spec, 'Scope') || 'V35 canonical system specification for telemetry and documentation depth';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'telemetry and documentation depth over promoted V34 deployment-depth canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V35 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V35 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V35 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Documentation surface catalog',
    'Telemetry taxonomy event schema',
    'Public docs usage guides',
    'Dashboards, alerts, runbooks, and incident escalation',
    'Documentation QA alignment proofs',
    'Developer and operator testnet rollout guides',
    'Telemetry documentation interface integration',
    'Local staging telemetry documentation rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V35 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V35 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV36CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V36');
  const scope = extractStatusValue(spec, 'Scope') || 'V36 canonical system specification for Exchange depth';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'Exchange depth over promoted V35 telemetry and documentation canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V36 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V36 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V36 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Exchange activity book',
    'Exchange intent and order contracts',
    'Rights-transfer review',
    'Pricing quote',
    'Settlement reconciliation',
    'Dispute repair revenue routes',
    'Exchange UX and Terminal integration',
    'Local staging rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V36 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V36 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV37CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V37');
  const scope = extractStatusValue(spec, 'Scope') || 'V37 canonical system specification for Website Conversations';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'Website Conversations over promoted V36 Exchange canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V37 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V37 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V37 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Conversation session and route history',
    'Conversation stream events',
    'Writing workspace',
    'Source selectors',
    'Terminal handoff',
    'Persistence privacy redaction',
    'Telemetry proof hooks docs',
    'Local staging rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V37 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V37 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV38CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V38');
  const scope = extractStatusValue(spec, 'Scope') || 'V38 canonical system specification for inference correctness';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'inference correctness over promoted V37 Conversations canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V38 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V38 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V38 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Inference surface inventory',
    'PTRR Failsafe Thricified stack',
    'Prompt benchmark report',
    'Inference telemetry disclosure',
    'ReadNeedComprehensionSynthesis hardening',
    'ReadFitsFindingSynthesis search embeddings',
    'AssetPack synthesis economic traceability',
    'Conversation and tool prompt parity',
    'Local staging inference rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V38 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V38 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV39CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V39');
  const scope = extractStatusValue(spec, 'Scope') || 'V39 canonical system specification for commercial Reading readiness';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'commercial Reading readiness over promoted V38 inference correctness canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V39 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V39 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V39 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family and branch posture',
    'Depository supply indexing',
    'Enterprise Reading UX state machine',
    'ReadNeed review and resynthesis',
    'ReadFitsFinding runtime',
    'AssetPack preview quote boundary',
    'Settlement rights delivery',
    'Operational telemetry repair readback',
    'Interface conversation product parity',
    'Local staging Reading rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V39 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V39 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV40CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V40');
  const scope = extractStatusValue(spec, 'Scope') || 'V40 canonical system specification for exhaustive commercial application testing';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'exhaustive commercial application testing over promoted V39 commercial Reading readiness canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V40 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V40 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V40 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Draft family',
    'Test inventory',
    'Unit coverage',
    'API integration contracts',
    'Reading pipeline integration',
    'Conversation and Terminal integration',
    'Browser E2E and visual proof',
    'Ledger storage synchronization',
    'Local staging rehearsal automation',
    'Prompt benchmark smoke',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V40 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V40 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV41CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V41');
  const scope = extractStatusValue(spec, 'Scope') || 'V41 canonical system specification for prompt-program excellence';
  const focus = deriveScopeFocus(scope) === 'specifying-canon hardening'
    ? 'prompt-program excellence over promoted V40 exhaustive testing canon'
    : deriveScopeFocus(scope);
  const decisionSection = extractSection(delta, 'Accepted V41 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V41 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V41 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Prompt inventory',
    'Registry/interpolation',
    'Reading baselines',
    'ReadNeed rewrite',
    'Finding Fits rewrite',
    'Conversation/tool/interface rewrite',
    'Benchmark and telemetry',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V41 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V41 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV42CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V42');
  const scope = extractStatusValue(spec, 'Scope') || 'V42 canonical system specification for reliable MVP experience';
  const focus = deriveScopeFocus(scope) || 'reliable MVP experience over promoted V41 prompt-program canon';
  const decisionSection = extractSection(delta, 'Accepted V42 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V42 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V42 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Depositing shortest path',
    'Reading shortest path',
    'ReadNeed review',
    'Finding Fits preview',
    'Settlement rights delivery',
    'AI-reading demonstration',
    'Local/staging rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V42 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V42 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV43CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V43');
  const scope = extractStatusValue(spec, 'Scope') || 'V43 canonical system specification for product routes and agentic depositing';
  const focus = deriveScopeFocus(scope) || 'product routes and agentic depositing over promoted V42 reliable MVP canon';
  const decisionSection = extractSection(delta, 'Accepted V43 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V43 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V43 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Route vocabulary',
    'Packs master-detail',
    'Read route',
    'Deposit route',
    'Criticality/ROI policy',
    'Deposit option admission',
    'UX/UI product excellence',
    'Cross-route rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V43 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V43 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV44CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V44');
  const scope = extractStatusValue(spec, 'Scope') || 'V44 canonical system specification for scaled engineering economy';
  const derivedFocus = deriveScopeFocus(scope);
  const focus = derivedFocus && derivedFocus !== 'specifying-canon hardening'
    ? derivedFocus
    : 'scaled engineering economy over promoted V43 product-route canon';
  const decisionSection = extractSection(delta, 'Accepted V44 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V44 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V44 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Economic domain model',
    'Packs portfolio',
    'Reading procurement',
    'Depositor earnings',
    'Accounting statements',
    'Organization governance',
    'Enterprise UX',
    'Scaled rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V44 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  return [
    `Promotes V44 as ${focus} for Bitcode.`,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV45CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V45');
  const scope = extractStatusValue(spec, 'Scope') || 'V45 canonical system specification for Bitcode knowledge commoditization';
  const derivedFocus = deriveScopeFocus(scope);
  const focus = derivedFocus && derivedFocus !== 'specifying-canon hardening'
    ? derivedFocus
    : 'knowledge commoditization over promoted V44 scaled engineering economy canon';
  const decisionSection = extractSection(delta, 'Accepted V45 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V45 Implementation Matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V45 Implementation Checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Knowledge commoditization identity',
    'AssetPack lifecycle',
    'BTD scalar-volume',
    'BTC settlement',
    'Interface authority',
    'Proof readback',
    'Tests and proofs',
    'Documentation'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V45 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  const promotionLead = focus.startsWith('Bitcode ')
    ? `Promotes V45: ${focus}.`
    : `Promotes V45 as ${focus} for Bitcode.`;

  return [
    promotionLead,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV47CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V47');
  const scope = extractStatusValue(spec, 'Scope') || 'V47 canonical system specification for commercial website testnet launch readiness';
  const derivedFocus = deriveScopeFocus(scope);
  const focus = derivedFocus && derivedFocus !== 'specifying-canon hardening'
    ? derivedFocus
    : 'commercial website testnet launch readiness over promoted V46 protocol comprehension canon';
  const decisionSection = extractSection(delta, 'Accepted V47 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V47 implementation matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V47 implementation checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Scope and launch freeze',
    'Measurement law',
    'Feature excess audit',
    'Seller state machine',
    'Buyer state machine',
    'E2E IP exchange tests',
    'Landing and public messaging',
    'Staging-testnet rehearsal',
    'Promotion readiness'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V47 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  const promotionLead = focus.startsWith('Bitcode ')
    ? `Promotes V47: ${focus}.`
    : `Promotes V47 as ${focus} for Bitcode.`;

  return [
    promotionLead,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildDerivedV46CommitMessageBody(commit) {
  const { spec, delta, parity } = await readSpecFamily('V46');
  const scope = extractStatusValue(spec, 'Scope') || 'V46 canonical system specification for protocol comprehension';
  const derivedFocus = deriveScopeFocus(scope);
  const focus = derivedFocus && derivedFocus !== 'specifying-canon hardening'
    ? derivedFocus
    : 'source-safe protocol comprehension over promoted V45 knowledge commoditization canon';
  const decisionSection = extractSection(delta, 'Accepted V46 decisions');
  const acceptedDecisions = extractOrderedItems(decisionSection).map(stripMarkdown);
  const parityRows = [
    ...parseMarkdownTable(extractSection(parity, 'V46 Implementation Matrix')),
    ...parseMarkdownTable(extractSection(parity, 'V46 Implementation Checklist'))
  ];

  /** @type {string[]} */
  const bullets = [];
  for (const decision of acceptedDecisions.slice(0, 4)) {
    bullets.push(trimTrailingPeriod(decision));
  }

  const prioritizedAreas = [
    'Protocol comprehension object model',
    'Public/operator claim boundaries',
    'Product route comprehension readback',
    'Interface claim contracts',
    'Proof readback explanation',
    'Local interface comprehension rehearsal',
    'Promotion readiness',
    'Documentation'
  ];
  for (const area of prioritizedAreas) {
    const row = findParityRow(parityRows, area);
    if (!row) continue;
    const closureSignal = trimTrailingPeriod(
      stripMarkdown(row['Required V46 result'] || row['Closure requirement'] || row['Source evidence'] || '')
    );
    if (!closureSignal) continue;
    bullets.push(`${stripMarkdown(area)}: ${closureSignal}`);
  }

  const promotionLead = focus.startsWith('Bitcode ')
    ? `Promotes V46: ${focus}.`
    : `Promotes V46 as ${focus} for Bitcode.`;

  return [
    promotionLead,
    '',
    `Proof-source commit: ${commit}`,
    '',
    'The promotion carries:',
    ...bullets.slice(0, 14).map((bullet) => `- ${bullet}`)
  ].join('\n');
}

/**
 * @param {string} version
 * @param {string} commit
 * @returns {Promise<string>}
 */
async function buildCommitMessageBody(version, commit) {
  if (version === 'V19') {
    return [
      `Promotes ${version} as reproducible canonical proof output for Bitcode.`,
      '',
      `Proof-source commit: ${commit}`,
      '',
      'The promotion closes the V19 first gate:',
      '- deterministic replay report generation and byte equality checking',
      '- volatility inventory for canonical proof artifacts',
      '- committed generated positive matrix artifacts under V19 names',
      '- representative negative proof mutation matrix with omitted cross-products',
      '- generated V18-to-V19 contract-change ledger',
      '- generated-only V19 _PROVEN_ appendix with immediate check mode',
      '- canonical promotion command sequencing for future version bumps'
    ].join('\n');
  }
  if (version === 'V20') {
    return [
      `Promotes ${version} as operator-quality canon for Bitcode.`,
      '',
      `Proof-source commit: ${commit}`,
      '',
      'The promotion closes the V20 first gate:',
      '- truthful browser posture for V19 active canon, V20 draft target, and inherited V16/V17/V18/V19 surfaces',
      '- generated operator acceptance transcript over required proof-bearing workflows',
      '- deterministic DOM/geometry visual regression signatures for required operator states',
      '- deterministic accessibility budget covering labels, focus, keyboard operation, live status, landmarks, toggles, contrast, reduced motion, and projection safety',
      '- normalized local performance budget report without raw wall-clock samples in canonical bytes',
      '- projection-quality smoke matrix for public, reviewer, buyer, and internal principals',
      '- generated V20 quality summary and generated-only V20 _PROVEN_ appendix',
      '- inherited V19 reproducible proof closure and promotion gates preserved before pointer advancement'
    ].join('\n');
  }
  if (version === 'V21') {
    return buildDerivedV21CommitMessageBody(commit);
  }
  if (version === 'V22') {
    return buildDerivedV22CommitMessageBody(commit);
  }
  if (version === 'V23') {
    return buildDerivedV23CommitMessageBody(commit);
  }
  if (version === 'V24') {
    return buildDerivedV24CommitMessageBody(commit);
  }
  if (version === 'V25') {
    return buildDerivedV25CommitMessageBody(commit);
  }
  if (version === 'V28') {
    return buildDerivedV28CommitMessageBody(commit);
  }
  if (version === 'V29') {
    return buildDerivedV29CommitMessageBody(commit);
  }
  if (version === 'V30') {
    return buildDerivedV30CommitMessageBody(commit);
  }
  if (version === 'V31') {
    return buildDerivedV31CommitMessageBody(commit);
  }
  if (version === 'V32') {
    return buildDerivedV32CommitMessageBody(commit);
  }
  if (version === 'V33') {
    return buildDerivedV33CommitMessageBody(commit);
  }
  if (version === 'V34') {
    return buildDerivedV34CommitMessageBody(commit);
  }
  if (version === 'V35') {
    return buildDerivedV35CommitMessageBody(commit);
  }
  if (version === 'V36') {
    return buildDerivedV36CommitMessageBody(commit);
  }
  if (version === 'V37') {
    return buildDerivedV37CommitMessageBody(commit);
  }
  if (version === 'V38') {
    return buildDerivedV38CommitMessageBody(commit);
  }
  if (version === 'V39') {
    return buildDerivedV39CommitMessageBody(commit);
  }
  if (version === 'V40') {
    return buildDerivedV40CommitMessageBody(commit);
  }
  if (version === 'V41') {
    return buildDerivedV41CommitMessageBody(commit);
  }
  if (version === 'V42') {
    return buildDerivedV42CommitMessageBody(commit);
  }
  if (version === 'V43') {
    return buildDerivedV43CommitMessageBody(commit);
  }
  if (version === 'V44') {
    return buildDerivedV44CommitMessageBody(commit);
  }
  if (version === 'V45') {
    return buildDerivedV45CommitMessageBody(commit);
  }
  if (version === 'V46') {
    return buildDerivedV46CommitMessageBody(commit);
  }
  if (version === 'V47') {
    return buildDerivedV47CommitMessageBody(commit);
  }
  throw new Error(`Unsupported promotion target ${version}. Expected V19, V20, V21, V22, V23, V24, V25, V28, V29, V30, V31, V32, V33, V34, V35, V36, V37, V38, V39, V40, V41, V42, V43, V44, V45, V46, or V47.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const version = args.version || '';
  if (!['V19', 'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V28', 'V29', 'V30', 'V31', 'V32', 'V33', 'V34', 'V35', 'V36', 'V37', 'V38', 'V39', 'V40', 'V41', 'V42', 'V43', 'V44', 'V45', 'V46', 'V47'].includes(version)) {
    throw new Error(`Canonical promotion accepts --version V19, V20, V21, V22, V23, V24, V25, V28, V29, V30, V31, V32, V33, V34, V35, V36, V37, V38, V39, V40, V41, V42, V43, V44, V45, V46, or V47. Received ${version || 'none'}.`);
  }
  const commit = args.commit || '';
  if (!commit) {
    throw new Error('A proof-source --commit is required.');
  }

  const resolvedCommit = git(['rev-parse', commit]);
  const dirty = git(['status', '--porcelain']);
  if (dirty && !args.dryRun && !args.allowDirtyStart) {
    throw new Error('Refusing canonical promotion from a dirty worktree. Commit or stash changes first, or use --allow-dirty-start for preview use.');
  }

  const commands = rewriteCommandPlanForEnvironment(buildCommandPlan(version, resolvedCommit), {
    allowDirtyStart: args.allowDirtyStart,
    dirty: Boolean(dirty)
  });
  process.stdout.write(`${version} canonical promotion plan for ${resolvedCommit}\n`);
  for (const [file, commandArgs] of commands) {
    process.stdout.write(`- ${renderCommand(file, commandArgs)}\n`);
  }
  process.stdout.write('\nCanonical commit message body:\n');
  process.stdout.write(await buildCommitMessageBody(version, resolvedCommit));
  process.stdout.write('\n');

  if (args.dryRun) return;

  const generatedCommandIndex = commands.findIndex(([file, commandArgs]) => file === 'node' && commandArgs[0] === 'scripts/generate-bitcode-proven.mjs');
  if (generatedCommandIndex < 0) {
    throw new Error('Promotion command plan does not contain a generated appendix command.');
  }

  for (const [file, commandArgs] of commands.slice(0, generatedCommandIndex)) {
    execFileSync(file, commandArgs, { cwd: repoRoot, stdio: 'inherit' });
  }
  await fs.writeFile(path.join(repoRoot, 'specifications/BITCODE_SPEC.txt'), `${version}\n`, 'utf8');
  for (const [file, commandArgs] of commands.slice(generatedCommandIndex)) {
    execFileSync(file, commandArgs, { cwd: repoRoot, stdio: 'inherit' });
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
});
