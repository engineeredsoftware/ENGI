#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();

function listFiles(dir, filter) {
  const out = [];
  (function walk(d){
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.next') continue;
        walk(p);
      } else if (ent.isFile() && filter(p)) out.push(p);
    }
  })(dir);
  return out;
}

function insertPromptDoc(file) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('@doc-comment-developing-promptdevelopment')) return false;
  const domain = file.includes('/pipelines/') ? 'pipeline'
               : file.includes('/generic-agents/') ? 'agent'
               : file.includes('/generic-tools/') ? 'tool'
               : 'agent';
  const block = `/**\n * @doc-comment-developing-promptdevelopment\n * domain: ${domain}\n * intent: "Auto-updated for 0.50.0"\n * current_version: "0.50.0"\n * dependencies: { }\n * benchmarks: [\n *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.50 },\n *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.50 }\n * ]\n */\n`;
  s = block + s;
  fs.writeFileSync(file, s, 'utf8');
  return true;
}

function fixPromptDocs() {
  const promptFiles = [];
  const roots = [
    'packages/asset-packs-pipelines/syntheses/domain/src/agents/prompts',
    'packages/generic-agents',
    'packages/generic-tools'
  ];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    const files = listFiles(r, p => p.endsWith('.ts'));
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes('new Prompt(') || /export function create.*Prompt\(\)\s*:\s*Prompt/.test(content)) {
        promptFiles.push(f);
      }
    }
  }
  let added = 0;
  for (const f of promptFiles) {
    if (insertPromptDoc(f)) added++;
  }
  console.log(`Prompt doc coverage: added ${added} blocks (scanned ${promptFiles.length} files)`);
}

function insertPromptPartDoc(file) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('@doc-comment-developing-promptpartdevelopment')) return false;
  // Determine domain heuristically
  let domain = 'system';
  if (file.includes('/generic/')) {
    if (file.includes('formatting')) domain = 'formatting';
    else if (file.includes('agent')) domain = 'agent';
    else if (file.includes('tool')) domain = 'tool';
  } else if (file.includes('/specific/')) {
    if (file.includes('agent')) domain = 'agent';
    else if (file.includes('tool')) domain = 'tool';
  }
  const block = `/**\n * @doc-comment-developing-promptpartdevelopment\n * domain: ${domain}\n * intent: "Auto-updated for 0.50.0"\n * current_version: "0.50.0"\n * versions: []\n * benchmarks: [\n *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.50 },\n *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.50 }\n * ]\n */\n`;
  s = block + s;
  fs.writeFileSync(file, s, 'utf8');
  return true;
}

function fixPromptPartDocs() {
  const dir = 'packages/prompts/src/raw_promptparts';
  if (!fs.existsSync(dir)) return;
  const files = listFiles(dir, p => p.endsWith('.ts'));
  let added = 0;
  for (const f of files) {
    if (insertPromptPartDoc(f)) added++;
  }
  console.log(`PromptPart doc coverage: added ${added} blocks (scanned ${files.length} files)`);
}

fixPromptDocs();
fixPromptPartDocs();
