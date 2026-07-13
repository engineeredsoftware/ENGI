#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

// Resolve repo root: this file is at packages/asset-packs-pipelines/domain/scripts/
const repoRoot = path.resolve(__dirname, '../../..', '..'); // go to repo root from package

// Import the public prompt formatter boundary rather than reaching into
// prompts package internals from the AssetPack prompt renderer.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hierarchicalFormatter } = require('@bitcode/prompts/formatters');

type Scope = 'asset-pack' | 'generic-agents' | 'generic-tools' | 'all';

function listAssetPackPromptFiles(): string[] {
  const dir = path.resolve(__dirname, '../src/agents/prompts');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join(dir, f));
}

function listGenericAgentsPromptFiles(): string[] {
  const base = path.resolve(repoRoot, 'packages', 'generic-agents');
  if (!fs.existsSync(base)) return [];
  const files: string[] = [];
  for (const agent of fs.readdirSync(base)) {
    const promptsDir = path.join(base, agent, 'src', 'prompts');
    if (!fs.existsSync(promptsDir)) continue;
    for (const f of fs.readdirSync(promptsDir)) {
      if (f.endsWith('.ts')) files.push(path.join(promptsDir, f));
    }
  }
  return files;
}

function listGenericToolsPromptFiles(): string[] {
  const base = path.resolve(repoRoot, 'packages', 'generic-tools');
  if (!fs.existsSync(base)) return [];
  const files: string[] = [];
  for (const tool of fs.readdirSync(base)) {
    const promptsDir = path.join(base, tool, 'src', 'prompts');
    if (!fs.existsSync(promptsDir)) continue;
    for (const f of fs.readdirSync(promptsDir)) {
      if (f.endsWith('.ts')) files.push(path.join(promptsDir, f));
    }
  }
  return files;
}

function listPromptFiles(scope: Scope): string[] {
  if (scope === 'asset-pack') return listAssetPackPromptFiles();
  if (scope === 'generic-agents') return listGenericAgentsPromptFiles();
  if (scope === 'generic-tools') return listGenericToolsPromptFiles();
  // all
  return [
    ...listAssetPackPromptFiles(),
    ...listGenericAgentsPromptFiles(),
    ...listGenericToolsPromptFiles(),
  ];
}

async function render(): Promise<void> {
  const arg = process.argv.find(a => a.startsWith('--scope='));
  const scope = (arg ? (arg.split('=')[1] as Scope) : 'asset-pack') || 'asset-pack';
  const outName = scope === 'all' ? 'prompts-rendered.all.md' :
                  scope === 'generic-agents' ? 'prompts-rendered.generic-agents.md' :
                  scope === 'generic-tools' ? 'prompts-rendered.generic-tools.md' :
                  'prompts-rendered.md';
  const outPath = path.join(repoRoot, 'reports', outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const lines: string[] = [];
  lines.push(`# Rendered Prompts (${scope})`);
  lines.push('');
  const files = listPromptFiles(scope);
  const unique = new Set<string>();
  for (const fp of files) unique.add(fp);
  for (const fp of unique) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(fp);
    const expNames = Object.keys(mod);
    const factories = expNames.filter(k => /^create.*Prompt$/.test(k));
    const stepsObjs = expNames.filter(k => /PromptSteps$/.test(k));
    if (factories.length === 0 && stepsObjs.length === 0) continue;
    lines.push(`## ${path.basename(fp)}`);
    for (const k of factories) {
      try {
        const p = mod[k]();
        const s = p.format(hierarchicalFormatter);
        lines.push(`### ${k}`);
        lines.push('```');
        lines.push(s);
        lines.push('```');
      } catch (e: any) {
        lines.push(`### ${k} (ERROR)`);
        lines.push('```');
        lines.push(String(e?.stack || e));
        lines.push('```');
      }
    }
    for (const k of stepsObjs) {
      const steps = mod[k];
      for (const step of ['plan', 'try', 'refine', 'retry'] as const) {
        if (typeof steps?.[step] === 'function') {
          try {
            const p = steps[step]();
            const s = p.format(hierarchicalFormatter);
            lines.push(`### ${k}.${step}`);
            lines.push('```');
            lines.push(s);
            lines.push('```');
          } catch (e: any) {
            lines.push(`### ${k}.${step} (ERROR)`);
            lines.push('```');
            lines.push(String(e?.stack || e));
            lines.push('```');
          }
        }
      }
    }
    lines.push('');
  }
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('Wrote', outPath);
}

render().catch(e => { console.error(e); process.exit(1); });
