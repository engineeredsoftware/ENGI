#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const assetPackPromptDirs = [
  'packages/asset-packs-pipelines/domain/src/agents/prompts',
  'packages/asset-packs-pipelines/domain/src/tools'
].map((relativePath) => path.join(repoRoot, relativePath));
const assetPackPromptpartsDir = path.join(repoRoot, 'packages/prompts/src/raw_promptparts/specific');
const rawPromptpartsRoot = path.join(repoRoot, 'packages/prompts/src/raw_promptparts');

const substepSemantics = new Map([
  [
    'reason',
    'ground the step in the expressed Bitcode read, current execution state, written-asset target, proof obligations, and delivery-mechanism limits before selecting the next action'
  ],
  [
    'prepare_concise_context',
    'extract only read-relevant repository, attachment, execution, and proof context required to synthesize or validate the written asset; exclude noise that does not affect asset-pack acceptance'
  ],
  [
    'chunk_then_sum',
    'chunk large inputs by read, file, proof, and delivery-mechanism concern; summarize each chunk as written-asset constraints, risks, and acceptance evidence for asset-pack synthesis'
  ],
  [
    'tools_execution',
    'invoke only tools required to inspect, change, validate, or package the written asset; preserve parameters and results for Bitcode execution records and proof reread'
  ],
  [
    'structured_output',
    'return structured output with read satisfaction, writtenAssetType, writtenAssets, assetPack evidence, validation status, and deliveryMechanism wrapper fields when a pull-request Shippable is required'
  ],
  [
    'stitch_until_complete',
    'combine partial findings, diffs, validations, and delivery-mechanism details into one coherent asset-pack result that can be reread from execution history'
  ],
  [
    'judge',
    'evaluate whether the output satisfies the Bitcode read, preserves written-asset integrity, separates delivery mechanisms, and records enough proof evidence for acceptance'
  ]
]);

const substepIntentSemantics = new Map([
  [
    'reason',
    'Bitcode read-grounding substep for written-asset / asset-pack execution'
  ],
  [
    'prepare_concise_context',
    'Bitcode context-selection substep for read-relevant written-asset evidence'
  ],
  [
    'chunk_then_sum',
    'Bitcode chunking substep for asset-pack constraints, risks, and proof evidence'
  ],
  [
    'tools_execution',
    'Bitcode tool-execution substep for written-asset inspection, change, validation, and proof capture'
  ],
  [
    'structured_output',
    'Bitcode structured-output substep for read satisfaction, writtenAssets, assetPack, and deliveryMechanism fields'
  ],
  [
    'stitch_until_complete',
    'Bitcode stitching substep for coherent asset-pack result and execution-history reread'
  ],
  [
    'judge',
    'Bitcode judgment substep for read satisfaction, written-asset integrity, delivery-mechanism separation, and proof evidence'
  ]
]);

function collectReferencedPromptParts() {
  const refs = new Set();
  for (const d of assetPackPromptDirs) {
    if (!fs.existsSync(d)) continue;
    for (const ent of fs.readdirSync(d)) {
      if (!ent.endsWith('.ts')) continue;
      const fp = path.join(d, ent);
      const s = fs.readFileSync(fp, 'utf8');
      const re = /from\s+'@bitcode\/prompts\/raw_promptparts\/(generic|specific)\/([a-zA-Z0-9_\-/]+)'/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        const scope = m[1];
        const file = m[2] + '.ts';
        const abs = path.join(repoRoot, 'packages/prompts/src/raw_promptparts', scope, file);
        refs.add(abs);
      }
    }
  }
  return [...refs];
}

function ensureDocAndBenchmarks(fp) {
  if (!fs.existsSync(fp)) return { fp, status: 'missing' };
  let src = fs.readFileSync(fp, 'utf8');
  const original = src;
  // Ensure doc-comment exists
  if (!src.includes('@doc-comment-developing-promptpartdevelopment')) {
    // Insert a minimal doc-comment at the top
    const header = `/**\n * @doc-comment-developing-promptpartdevelopment\n * domain: auto\n * intent: "Auto-updated for 0.50.0"\n * current_version: "0.50.0"\n * versions: []\n * benchmarks: [\n *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.50 },\n *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.50 }\n * ]\n */\n`;
    src = header + src;
  }
  // Normalize missing current_version metadata without corrupting existing semantic versions.
  if (!src.includes('current_version:')) {
    // Try to inject inside the doc block
    src = src.replace(/@doc-comment-developing-promptpartdevelopment[\s\S]*?\*\//, (block) => {
      if (block.includes('current_version:')) return block;
      const tail = block.replace(/\*\//, '');
      return tail + ` * current_version: "0.50.0"\n */`;
    });
  }
  src = repairMalformedBenchmarkScores(src);
  if (src === original) return { fp, status: 'unchanged' };
  fs.writeFileSync(fp, src, 'utf8');
  return { fp, status: 'updated' };
}

function repairMalformedBenchmarkScores(src) {
  // Earlier non-idempotent passes produced invalid decimal fragments such as 0.50.95.
  return src
    .replace(/("score"\s*:\s*)0\.50\.(\d+)/g, (_match, prefix, scoreDigits) => `${prefix}0.${scoreDigits}`)
    .replace(/("score"\s*:\s*)0\.(\d+)\.\d+(?=\s*[},])/g, (_match, prefix, scoreDigits) => `${prefix}0.${scoreDigits}`);
}

function collectRawPromptpartGeneratedFiles(dir = rawPromptpartsRoot) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...collectRawPromptpartGeneratedFiles(fp));
      continue;
    }
    if (ent.isFile() && /\.(?:d\.)?ts$/u.test(ent.name)) files.push(fp);
  }
  return files;
}

function repairRawPromptpartGeneratedFiles() {
  let updated = 0;
  for (const fp of collectRawPromptpartGeneratedFiles()) {
    const src = fs.readFileSync(fp, 'utf8');
    const next = repairMalformedBenchmarkScores(src);
    if (next === src) continue;
    fs.writeFileSync(fp, next, 'utf8');
    updated++;
  }
  return updated;
}

function isAssetPackTracePromptpartFile(filename) {
  return /^promptpart_specific_(?:agent_assetpack|phase_assetpack|pipeline_assetpackrun|tool_.*assetpack|asset_pack_system).*?(?:\.d)?\.ts$/u.test(filename);
}

function traceLabelForPromptpartFile(filename) {
  return filename
    .replace(/^promptpart_specific_/u, '')
    .replace(/(?:\.d)?\.ts$/u, '')
    .replace(/_/gu, ' ');
}

function assetPackTraceMetadataIntent(filename) {
  const label = traceLabelForPromptpartFile(filename);
  const lower = filename.toLowerCase();

  if (lower.includes('comprehendtask')) {
    return `Bitcode comprehend-task trace PromptPart for canonical comprehend-read asset-pack synthesis: ${label}`;
  }
  if (lower.includes('comprehendread')) {
    return `Bitcode canonical comprehend-read PromptPart for read-first written-asset / asset-pack synthesis: ${label}`;
  }
  if (lower.startsWith('promptpart_specific_tool_')) {
    return `Bitcode AssetPack trace tool PromptPart for read-first asset-pack setup and written-asset evidence: ${label}`;
  }
  if (lower.startsWith('promptpart_specific_phase_')) {
    return `Bitcode AssetPack trace phase PromptPart for read-first asset-pack execution: ${label}`;
  }
  if (lower.startsWith('promptpart_specific_pipeline_')) {
    return `Bitcode AssetPack trace pipeline PromptPart for read-first asset-pack execution and delivery-mechanism separation: ${label}`;
  }
  if (lower.includes('validation')) {
    return `Bitcode AssetPack trace PromptPart for read satisfaction, written-asset validation, and proof evidence: ${label}`;
  }
  if (lower.includes('implementation') || lower.includes('implexecute') || lower.includes('impl')) {
    return `Bitcode AssetPack trace PromptPart for written-asset synthesis from asset-pack execution: ${label}`;
  }
  if (lower.includes('discovery') || lower.includes('disc')) {
    return `Bitcode AssetPack trace PromptPart for read discovery and asset-pack planning: ${label}`;
  }
  if (lower.includes('setup')) {
    return `Bitcode AssetPack trace PromptPart for read-first asset-pack setup: ${label}`;
  }

  return `Bitcode AssetPack trace PromptPart for read-first written-asset / asset-pack execution: ${label}`;
}

function normalizeAssetPackTracePromptpartDocComments() {
  if (!fs.existsSync(assetPackPromptpartsDir)) return 0;
  let updated = 0;
  for (const ent of fs.readdirSync(assetPackPromptpartsDir)) {
    if (!isAssetPackTracePromptpartFile(ent)) continue;
    if (ent.includes('_substep_')) continue;

    const fp = path.join(assetPackPromptpartsDir, ent);
    const src = fs.readFileSync(fp, 'utf8');
    const nextIntent = `intent: "${assetPackTraceMetadataIntent(ent)}"`;
    const next = src
      .replace(/intent:\s*"[^"]*"/gu, nextIntent)
      .replace(/current_version:\s*"[^"]*"/gu, 'current_version: "0.50.0"');

    if (next === src) continue;
    fs.writeFileSync(fp, next, 'utf8');
    updated++;
  }
  return updated;
}

function normalizeSubstepPromptparts() {
  if (!fs.existsSync(assetPackPromptpartsDir)) return 0;
  let updated = 0;
  for (const ent of fs.readdirSync(assetPackPromptpartsDir)) {
    if (!/^promptpart_specific_agent_assetpack(?:setup(?:dangerwall|readytoiterate)|validationreadytofinish).*_substep_.*\.ts$/u.test(ent)) continue;
    const fp = path.join(assetPackPromptpartsDir, ent);
    const src = fs.readFileSync(fp, 'utf8');
    const substep = [...substepSemantics.keys()].find((key) => ent.includes(`_substep_${key}.ts`));
    if (!substep) continue;
    const match = src.match(/export const ([A-Z0-9_]+): PromptPart\s*=\s*\n\s*(['"])([\s\S]*?)\2 as PromptPart;/u);
    if (!match) continue;
    const [, exportName, quote] = match;
    const traceLabel = ent
      .replace(/^promptpart_specific_agent_/u, '')
      .replace(/\.ts$/u, '')
      .replace(/_/gu, ' ');
    const nextPrompt = `${traceLabel}: ${substepSemantics.get(substep)}.`;
    const nextAssignment = `export const ${exportName}: PromptPart = \n  ${quote}${nextPrompt}${quote} as PromptPart;`;
    const nextIntent = `intent: "${substepIntentSemantics.get(substep)}: ${traceLabel}"`;
    const next = src
      .replace(/intent:\s*"[^"]*"/gu, nextIntent)
      .replace(/current_version:\s*"[^"]*"/gu, 'current_version: "0.50.0"')
      .replace(match[0], nextAssignment);
    if (next === src) continue;
    fs.writeFileSync(fp, next, 'utf8');
    updated++;
  }
  return updated;
}

function syncSubstepRuntimePromptparts() {
  if (!fs.existsSync(assetPackPromptpartsDir)) return 0;
  let updated = 0;

  for (const ent of fs.readdirSync(assetPackPromptpartsDir)) {
    if (!/^promptpart_specific_agent_assetpack(?:setup(?:dangerwall|readytoiterate)|validationreadytofinish).*_substep_.*\.ts$/u.test(ent)) continue;
    const fp = path.join(assetPackPromptpartsDir, ent);
    const src = fs.readFileSync(fp, 'utf8');
    const match = src.match(/export const ([A-Z0-9_]+): PromptPart\s*=\s*\n\s*(['"])([\s\S]*?)\2 as PromptPart;/u);
    if (!match) continue;

    const [, exportName, _quote, promptText] = match;
    const runtimePath = fp.replace(/\.ts$/u, '.js');
    const runtimeSource = [
      '"use strict";',
      'Object.defineProperty(exports, "__esModule", { value: true });',
      `exports.${exportName} = void 0;`,
      `exports.${exportName} = ${JSON.stringify(promptText)};`,
      '',
    ].join('\n');

    const current = fs.existsSync(runtimePath) ? fs.readFileSync(runtimePath, 'utf8') : '';
    if (current === runtimeSource) continue;
    fs.writeFileSync(runtimePath, runtimeSource, 'utf8');
    updated++;
  }

  return updated;
}

const refs = collectReferencedPromptParts();
let updated = 0, missing = 0;
for (const fp of refs) {
  const { status } = ensureDocAndBenchmarks(fp);
  if (status === 'updated') updated++; else if (status === 'missing') missing++;
}
const repairedGeneratedFiles = repairRawPromptpartGeneratedFiles();
const assetPackTraceMetadataUpdated = normalizeAssetPackTracePromptpartDocComments();
const substepUpdated = normalizeSubstepPromptparts();
const substepRuntimeUpdated = syncSubstepRuntimePromptparts();
console.log(`normalized ${updated} files; missing ${missing}; repaired ${repairedGeneratedFiles} generated raw PromptPart files; normalized ${assetPackTraceMetadataUpdated} AssetPack trace metadata PromptParts; normalized ${substepUpdated} AssetPack trace substep PromptParts; synced ${substepRuntimeUpdated} AssetPack trace runtime PromptParts`);
