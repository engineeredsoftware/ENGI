#!/usr/bin/env node
// Simple verification script for Bitcode UI SSOT compliance and perf guards.
// Runs a series of greps to assert architectural invariants. Exits non-zero on failure.

import { execSync } from 'node:child_process';

function run(cmd) {
  try {
    const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: e.stdout ? e.stdout.toString() : '', err: e.stderr ? e.stderr.toString() : e.message };
  }
}

function assertZero(cmd, msg) {
  const r = run(cmd);
  if (!r.ok || r.out.trim().length > 0) {
    console.error(`
[FAIL] ${msg}`);
    if (r.out) console.error(r.out);
    if (r.err) console.error(r.err);
    process.exit(1);
  }
  console.log(`[OK] ${msg}`);
}

function assertSome(cmd, msg) {
  const r = run(cmd);
  if (!r.ok || r.out.trim().length === 0) {
    console.error(`
[FAIL] ${msg}`);
    if (r.out) console.error(r.out);
    if (r.err) console.error(r.err);
    process.exit(1);
  }
  console.log(`[OK] ${msg}`);
}

console.log('Bitcode UI SSOT verification start');

// 1) No imports from vendored ui in app/VCS
const banned = "@/components/ui/(button|card|input|label|select|tabs|dialog|alert-dialog|dropdown-menu|avatar|switch|textarea|progress|checkbox|popover|collapsible|command|calendar|tooltip|table|badge|alert)";
assertZero("rg -n -e " + JSON.stringify(banned) + " uapi/app uapi/components/vcs --glob '!**/__tests__/**' --glob '!**/*.test.*' || true", "No app/VCS imports from vendored ui primitives (non-test)");

// 2) components.css is globally imported (once) in layout
assertSome("rg -n " + JSON.stringify("styles/components.css") + " uapi/app/layout.tsx || true", "Global import of styles/components.css in layout");

// 3) No duplicated WebKit scrollbar definitions outside SSOT
const allowCss = 'components.css|conversations/|orbital';
assertZero("rg -n " + JSON.stringify("::\-webkit\-scrollbar") + " uapi/app/styles | rg -v " + JSON.stringify(allowCss) + " || true", "No ::-webkit-scrollbar outside allowed CSS (components.css, conversations, user-orbital)");

// 4) Conversations container not wrapped by GPUAcceleration (to preserve sticky)
assertZero("rg -n " + JSON.stringify("<GPUAcceleration className=\"conversations-container\"") + " uapi/app/conversations/components/conversations/index.tsx || true", "No GPUAcceleration on .conversations-container");
assertZero("rg -n " + JSON.stringify("<GPUAcceleration className=\"conversations-fullscreen\"") + " uapi/app/conversations/components/conversations/index.tsx || true", "No GPUAcceleration on .conversations-fullscreen");

// 5) Bitcode execution primitives route scroll regions through the shared scrollbar utility.
assertSome("rg -n " + JSON.stringify("custom-scrollbar") + " uapi/components/bitcode/execution uapi/components/bitcode/panels || true", "Bitcode execution scroll regions use shared scrollbar classes");

// 6) Conversations split/message surfaces use content-vis + custom-scrollbar.
assertSome("rg -n " + JSON.stringify("content-vis") + " uapi/app/conversations/components/ConversationsSplitGrid.tsx || true", "Conversations split grid uses content-vis");
assertSome("rg -n " + JSON.stringify("custom-scrollbar") + " uapi/app/conversations/components/ConversationsSplitGrid.tsx uapi/app/conversations/components/ConversationsMessageWaterfall.tsx || true", "Conversations surfaces use custom-scrollbar");

// 7) Bitcode interface style note contains the Style PR Checklist
assertSome("rg -n " + JSON.stringify("Style PR Checklist") + " internal-docs/BITCODE_INTERFACE_STYLE.md || true", "BITCODE_INTERFACE_STYLE.md includes Style PR Checklist");

console.log('Bitcode UI SSOT verification passed');
process.exit(0);
