#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Resolve repo root: this file is at packages/asset-packs-pipelines/domain/scripts/
const repoRoot = path_1.default.resolve(__dirname, '../../..', '..'); // go to repo root from package
// Import the public prompt formatter boundary rather than reaching into
// prompts package internals from the AssetPack prompt renderer.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hierarchicalFormatter } = require('@bitcode/prompts/formatters');
function listAssetPackPromptFiles() {
    const dir = path_1.default.resolve(__dirname, '../src/agents/prompts');
    if (!fs_1.default.existsSync(dir))
        return [];
    return fs_1.default.readdirSync(dir)
        .filter(f => f.endsWith('.ts'))
        .map(f => path_1.default.join(dir, f));
}
function listGenericAgentsPromptFiles() {
    const base = path_1.default.resolve(repoRoot, 'packages', 'generic-agents');
    if (!fs_1.default.existsSync(base))
        return [];
    const files = [];
    for (const agent of fs_1.default.readdirSync(base)) {
        const promptsDir = path_1.default.join(base, agent, 'src', 'prompts');
        if (!fs_1.default.existsSync(promptsDir))
            continue;
        for (const f of fs_1.default.readdirSync(promptsDir)) {
            if (f.endsWith('.ts'))
                files.push(path_1.default.join(promptsDir, f));
        }
    }
    return files;
}
function listGenericToolsPromptFiles() {
    const base = path_1.default.resolve(repoRoot, 'packages', 'generic-tools');
    if (!fs_1.default.existsSync(base))
        return [];
    const files = [];
    for (const tool of fs_1.default.readdirSync(base)) {
        const promptsDir = path_1.default.join(base, tool, 'src', 'prompts');
        if (!fs_1.default.existsSync(promptsDir))
            continue;
        for (const f of fs_1.default.readdirSync(promptsDir)) {
            if (f.endsWith('.ts'))
                files.push(path_1.default.join(promptsDir, f));
        }
    }
    return files;
}
function listPromptFiles(scope) {
    if (scope === 'asset-pack')
        return listAssetPackPromptFiles();
    if (scope === 'generic-agents')
        return listGenericAgentsPromptFiles();
    if (scope === 'generic-tools')
        return listGenericToolsPromptFiles();
    // all
    return [
        ...listAssetPackPromptFiles(),
        ...listGenericAgentsPromptFiles(),
        ...listGenericToolsPromptFiles(),
    ];
}
async function render() {
    const arg = process.argv.find(a => a.startsWith('--scope='));
    const scope = (arg ? arg.split('=')[1] : 'asset-pack') || 'asset-pack';
    const outName = scope === 'all' ? 'prompts-rendered.all.md' :
        scope === 'generic-agents' ? 'prompts-rendered.generic-agents.md' :
            scope === 'generic-tools' ? 'prompts-rendered.generic-tools.md' :
                'prompts-rendered.md';
    const outPath = path_1.default.join(repoRoot, 'reports', outName);
    fs_1.default.mkdirSync(path_1.default.dirname(outPath), { recursive: true });
    const lines = [];
    lines.push(`# Rendered Prompts (${scope})`);
    lines.push('');
    const files = listPromptFiles(scope);
    const unique = new Set();
    for (const fp of files)
        unique.add(fp);
    for (const fp of unique) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(fp);
        const expNames = Object.keys(mod);
        const factories = expNames.filter(k => /^create.*Prompt$/.test(k));
        const stepsObjs = expNames.filter(k => /PromptSteps$/.test(k));
        if (factories.length === 0 && stepsObjs.length === 0)
            continue;
        lines.push(`## ${path_1.default.basename(fp)}`);
        for (const k of factories) {
            try {
                const p = mod[k]();
                const s = p.format(hierarchicalFormatter);
                lines.push(`### ${k}`);
                lines.push('```');
                lines.push(s);
                lines.push('```');
            }
            catch (e) {
                lines.push(`### ${k} (ERROR)`);
                lines.push('```');
                lines.push(String(e?.stack || e));
                lines.push('```');
            }
        }
        for (const k of stepsObjs) {
            const steps = mod[k];
            for (const step of ['plan', 'try', 'refine', 'retry']) {
                if (typeof steps?.[step] === 'function') {
                    try {
                        const p = steps[step]();
                        const s = p.format(hierarchicalFormatter);
                        lines.push(`### ${k}.${step}`);
                        lines.push('```');
                        lines.push(s);
                        lines.push('```');
                    }
                    catch (e) {
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
    fs_1.default.writeFileSync(outPath, lines.join('\n'), 'utf8');
    console.log('Wrote', outPath);
}
render().catch(e => { console.error(e); process.exit(1); });
