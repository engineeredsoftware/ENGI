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
  /** @type {{ version?: string, nextDraft?: string, repoRoot?: string, help?: boolean }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--version') args.version = argv[++index];
    else if (arg === '--next-draft') args.nextDraft = argv[++index];
    else if (arg === '--repo-root') args.repoRoot = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V29 [--next-draft V30] [--repo-root <path>]',
      '',
      'Rewrites the preserved protocol/runtime canon-posture surfaces for canonical promotion.'
    ].join('\n')
  );
}

/**
 * @param {string} version
 * @returns {string}
 */
function deriveNextDraft(version) {
  const numeric = Number(version.slice(1));
  if (!Number.isInteger(numeric) || numeric < 1) {
    throw new Error(`Version must look like VN. Received ${version || 'none'}.`);
  }
  return `V${numeric + 1}`;
}

function projectLabel(version) {
  return 'Bitcode';
}

function promotedProvenPath(version) {
  return `BITCODE_SPEC_${version}_PROVEN.md`;
}

/**
 * @param {string} version
 * @returns {string}
 */
function inheritedCanonSurfaceLabelFor(version) {
  const numeric = Number(String(version || '').replace(/^V/u, ''));
  if (!Number.isInteger(numeric) || numeric <= 16) return '';
  return Array.from({ length: numeric - 16 }, (_, index) => `V${index + 16}`).join('/');
}

/**
 * @param {string} content
 * @param {string} version
 * @param {string} nextDraft
 */
function rewriteCanonPostureSource(content, version, nextDraft) {
  return content
    .replace(/export const ACTIVE_CANON_VERSION = 'V\d+';/, `export const ACTIVE_CANON_VERSION = '${version}';`)
    .replace(/export const DRAFT_TARGET_VERSION = 'V\d+';/, `export const DRAFT_TARGET_VERSION = '${nextDraft}';`)
    .replace(
      /inheritedCanonSurfaceLabel: 'V\d+(?:\/V\d+)*'/,
      `inheritedCanonSurfaceLabel: '${inheritedCanonSurfaceLabelFor(version)}'`
    );
}

/**
 * @param {string} content
 * @param {string} version
 * @param {string} nextDraft
 */
function rewriteReadme(content, version, nextDraft) {
  let rewritten = content;
  rewritten = rewritten.replace(
    /^# .+$/m,
    `# Bitcode Protocol Demonstration - ${version} canonical deterministic local prototype`
  );
  rewritten = rewritten.replace(
    /^This demo is governed by the active V\d+ canonical spec\.$/m,
    `This demo is governed by the active ${version} canonical spec.`
  );
  rewritten = rewritten.replace(
    /^- `BITCODE_SPEC\.txt -> V\d+`$/m,
    `- \`BITCODE_SPEC.txt -> ${version}\``
  );
  rewritten = rewritten.replace(
    /^`BITCODE_SPEC\.txt -> V\d+`\.$/m,
    `\`BITCODE_SPEC.txt -> ${version}\`.`
  );
  rewritten = rewritten.replace(
    /^- current generated appendix: `BITCODE_SPEC_V\d+_PROVEN\.md`$/m,
    `- current generated appendix: \`${promotedProvenPath(version)}\``
  );
  rewritten = rewritten.replace(
    /resolves to `V\d+`; V\d+ is the active draft target[^.]*\./m,
    `resolves to \`${version}\`; ${nextDraft} is the next draft target after this promotion.`
  );
  rewritten = rewritten.replace(
    /`BITCODE_SPEC\.txt -> V\d+`\.\s+This\s+demo is governed by the active V\d+ canonical\s+spec and\s+`(?:BITCODE_SPEC_V\d+_PROVEN\.md)` as the current generated appendix(?:\s+while\s+[^.]+)?\./m,
    `\`BITCODE_SPEC.txt -> ${version}\`. This demo is governed by the active ${version} canonical\nspec and \`${promotedProvenPath(version)}\` as the current generated appendix.`
  );
  rewritten = rewritten.replace(
    /This\s+demo is governed by the active V\d+ canonical\s+spec and\s+`(?:BITCODE_SPEC_V\d+_PROVEN\.md)` as the current generated appendix(?:\s+while\s+[^.]+)?\./m,
    `This demo is governed by the active ${version} canonical\nspec and \`${promotedProvenPath(version)}\` as the current generated appendix.`
  );
  rewritten = rewritten.replace(
    /^Active canon remains `V\d+`\.$/m,
    `Active canon remains \`${version}\`.`
  );
  rewritten = rewritten.replace(
    /^V\d+ is the next draft target after this promotion\.$/m,
    `${nextDraft} is the next draft target after this promotion.`
  );
  return rewritten;
}

/**
 * @param {string} content
 * @param {string} version
 * @param {string} nextDraft
 */
function rewritePackageReadme(content, version, nextDraft) {
  return content.replace(
    /active\/draft canon posture \(`V\d+` active, `V\d+` draft(?: during V\d+ work| after V\d+ promotion)?\);/m,
    `active/draft canon posture (\`${version}\` active, \`${nextDraft}\` draft after ${version} promotion);`
  ).replace(
    /This is(?: now)? the `V\d+` active, `V\d+` draft after V\d+ promotion posture accepted\s+by V\d+ Gate \d+\./m,
    `This is the \`${version}\` active, \`${nextDraft}\` draft after ${version} promotion posture accepted by\n${version} canonical promotion.`
  ).replace(
    /must remain aligned to `V\d+` active, `V\d+` draft during gate work, then be\s+rewritten by promotion automation to `V\d+` active, `V\d+` draft\./m,
    `must remain aligned to \`${version}\` active, \`${nextDraft}\` draft after promotion.`
  ).replace(
    /must remain aligned to `V\d+` active, `V\d+` draft until V\d+ promotion\./m,
    `must remain aligned to \`${version}\` active, \`${nextDraft}\` draft after promotion.`
  ).replace(
    /must remain aligned to `V\d+` active, `V\d+` draft while V\d+ opens\./m,
    `must remain aligned to \`${version}\` active, \`${nextDraft}\` draft after promotion.`
  ).replace(
    /V\d+ Gate 10 will promote this package posture by rewriting those same runtime\s+carriers to `V\d+` active, `V\d+` draft and regenerating the V\d+ generated\s+appendix plus `\.bitcode\/v\d+-\*` promotion artifacts\./m,
    `${version} Gate 10 promoted this package posture by rewriting those same runtime\ncarriers to \`${version}\` active, \`${nextDraft}\` draft and regenerating the ${version} generated\nappendix plus \`.proofs/${version.toLowerCase()}-*\` promotion artifacts.`
  );
}

/**
 * @param {string} content
 * @param {string} version
 * @param {string} nextDraft
 */
function rewriteRuntimeDataState(content, version, nextDraft) {
  const activeSpec = `${projectLabel(version)} Spec ${version} active canon / ${nextDraft} system draft`;
  return content
    .replace(/"specVersion": "Bitcode Spec V\d+ active canon \/ V\d+ system draft"/, `"specVersion": "${activeSpec}"`)
    .replace(/"activeCanonVersion": "V\d+"/, `"activeCanonVersion": "${version}"`)
    .replace(/"draftTargetVersion": "V\d+"/, `"draftTargetVersion": "${nextDraft}"`)
    .replace(/"operatorLabel": "V\d+ active canon \/ V\d+ system draft"/, `"operatorLabel": "${version} active canon / ${nextDraft} system draft"`)
    .replace(/"specVersionLabel": "Bitcode Spec V\d+ active canon \/ V\d+ system draft"/, `"specVersionLabel": "${activeSpec}"`)
    .replace(/"policyRef": "policy:\/\/bitcode\/spec-v\d+-active-v\d+-system-draft\/current"/, `"policyRef": "policy://bitcode/spec-${version.toLowerCase()}-active-${nextDraft.toLowerCase()}-system-draft/current"`)
    .replace(/"activeProvenAppendixPath": "BITCODE_SPEC_V\d+_PROVEN\.md"/, `"activeProvenAppendixPath": "${promotedProvenPath(version)}"`)
    .replace(/"draftSpecPath": "BITCODE_SPEC_V\d+\.md"/, `"draftSpecPath": "BITCODE_SPEC_${nextDraft}.md"`)
    .replace(/"draftDeltaPath": "BITCODE_SPEC_V\d+_DELTA\.md"/, `"draftDeltaPath": "BITCODE_SPEC_${nextDraft}_DELTA.md"`)
    .replace(/"draftParityPath": "BITCODE_SPEC_V\d+_PARITY_MATRIX\.md"/, `"draftParityPath": "BITCODE_SPEC_${nextDraft}_PARITY_MATRIX.md"`)
    .replace(/"inheritedCanonSurfaceLabel": "V\d+(?:\/V\d+)*"/, `"inheritedCanonSurfaceLabel": "${inheritedCanonSurfaceLabelFor(version)}"`);
}

/**
 * @param {string} filePath
 * @returns {Promise<string | null>}
 */
async function readOptionalFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const version = args.version || '';
  if (!version) throw new Error('A --version is required.');
  if (!/^V\d+$/.test(version)) {
    throw new Error(`Version must look like VN. Received ${version}.`);
  }
  const nextDraft = args.nextDraft || deriveNextDraft(version);
  const resolvedRepoRoot = path.resolve(args.repoRoot || repoRoot);

  const demonstrationCanonPosturePath = path.join(resolvedRepoRoot, 'scripts/specifying', 'src', 'canon-posture.js');
  const demonstrationReadmePath = path.join(resolvedRepoRoot, 'scripts/specifying', 'README.md');
  const packageCanonPosturePath = path.join(resolvedRepoRoot, 'packages', 'protocol', 'src', 'canon-posture.js');
  const packageReadmePath = path.join(resolvedRepoRoot, 'packages', 'protocol', 'README.md');
  const packageDataStatePath = path.join(resolvedRepoRoot, 'packages', 'protocol', 'data', 'state.json');

  const [demonstrationCanonPostureContent, demonstrationReadmeContent] = await Promise.all([
    fs.readFile(demonstrationCanonPosturePath, 'utf8'),
    fs.readFile(demonstrationReadmePath, 'utf8')
  ]);
  const [packageCanonPostureContent, packageReadmeContent, packageDataStateContent] = await Promise.all([
    readOptionalFile(packageCanonPosturePath),
    readOptionalFile(packageReadmePath),
    readOptionalFile(packageDataStatePath)
  ]);

  const writes = [
    fs.writeFile(demonstrationCanonPosturePath, rewriteCanonPostureSource(demonstrationCanonPostureContent, version, nextDraft), 'utf8'),
    fs.writeFile(demonstrationReadmePath, rewriteReadme(demonstrationReadmeContent, version, nextDraft), 'utf8')
  ];
  if (packageCanonPostureContent !== null) {
    writes.push(fs.writeFile(packageCanonPosturePath, rewriteCanonPostureSource(packageCanonPostureContent, version, nextDraft), 'utf8'));
  }
  if (packageReadmeContent !== null) {
    writes.push(fs.writeFile(packageReadmePath, rewritePackageReadme(packageReadmeContent, version, nextDraft), 'utf8'));
  }
  if (packageDataStateContent !== null) {
    writes.push(fs.writeFile(packageDataStatePath, rewriteRuntimeDataState(packageDataStateContent, version, nextDraft), 'utf8'));
  }
  await Promise.all(writes);

  process.stdout.write(
    `Prepared runtime canon posture for ${version} active canon and ${nextDraft} draft target\n`
  );
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
});
