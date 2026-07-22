#!/usr/bin/env node
/**
 * Derive favicons + OG image from the Bitcode mark SSOT.
 *
 * Source: apps/uapi/public/bitcode-logo.svg
 * Output: favicon-16/32, apple-touch-icon, android-chrome-192/512, og-image.png
 *
 * Why not raw SVG → PNG?
 * The SSOT SVG uses a non-square viewBox and intrinsic width/height (36×49).
 * Naïve rasterizers paste that tiny frame into a large white canvas (tiny logo
 * in the corner). This script nests the mark in a square/OG frame so it scales
 * and centers correctly on #02050d.
 *
 * Requires macOS: Google Chrome (headless) + sips.
 *
 * Usage (repo root):
 *   node scripts/generate-bitcode-logo-assets.mjs
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'apps/uapi/public');
const SSOT = join(PUBLIC, 'bitcode-logo.svg');
const BG = '#02050d';
const CHROME =
  process.env.BITCODE_CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function extractInnerSvg(svgText) {
  // Drop XML declaration; keep the mark’s root <svg> for nesting.
  const withoutXml = svgText.replace(/<\?xml[\s\S]*?\?>\s*/i, '').trim();
  if (!/^<svg[\s>]/i.test(withoutXml)) {
    die('bitcode-logo.svg: expected root <svg>');
  }
  // Ensure nested svg has no fixed width/height that fight the parent frame.
  return withoutXml
    .replace(/<svg\b([^>]*)>/i, (_m, attrs) => {
      const cleaned = String(attrs)
        .replace(/\swidth="[^"]*"/gi, '')
        .replace(/\sheight="[^"]*"/gi, '');
      return `<svg${cleaned} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
    });
}

function writeHtml(path, width, height, contentPadFrac) {
  const svgText = readFileSync(SSOT, 'utf8');
  const inner = extractInnerSvg(svgText);
  // contentPadFrac: fraction of min side used as side padding (0.125 → 75% content).
  const pad = contentPadFrac;
  const contentW = Math.round(width * (1 - 2 * pad));
  const contentH = Math.round(height * (1 - 2 * pad));
  // For non-square OG, center a square mark box on the short side.
  const markBox = Math.min(contentW, contentH);
  const x = Math.round((width - markBox) / 2);
  const y = Math.round((height - markBox) / 2);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: ${BG}; }
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BG}"/>
  <svg x="${x}" y="${y}" width="${markBox}" height="${markBox}" viewBox="-8 -5 52 59" preserveAspectRatio="xMidYMid meet">
${inner.replace(/^<svg\b[^>]*>/i, '').replace(/<\/svg>\s*$/i, '')}
  </svg>
</svg>
</body></html>
`;
  writeFileSync(path, html, 'utf8');
}

function chromeShot(htmlPath, outPng, width, height) {
  const r = spawnSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${width},${height}`,
      `--screenshot=${outPng}`,
      `file://${htmlPath}`,
    ],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) {
    die(`Chrome screenshot failed (${r.status}): ${r.stderr || r.stdout}`);
  }
}

function sipsResize(src, dest, size) {
  copyFileSync(src, dest);
  const r = spawnSync('sips', ['-z', String(size), String(size), dest], { encoding: 'utf8' });
  if (r.status !== 0) die(`sips resize failed: ${r.stderr || r.stdout}`);
}

function main() {
  if (process.platform !== 'darwin') {
    die('generate-bitcode-logo-assets.mjs currently requires macOS (Chrome + sips).');
  }
  try {
    readFileSync(SSOT);
  } catch {
    die(`Missing SSOT: ${SSOT}`);
  }

  const work = mkdtempSync(join(tmpdir(), 'bitcode-logo-assets-'));
  try {
    const iconHtml = join(work, 'icon.html');
    const ogHtml = join(work, 'og.html');
    const master512 = join(work, 'master-512.png');
    const masterOg = join(work, 'master-og.png');

    // 12.5% pad → mark fills ~75% of the square (readable at 16px and 512px).
    writeHtml(iconHtml, 512, 512, 0.125);
    // OG: larger side pad so the mark sits as a centered hero on 1200×630.
    writeHtml(ogHtml, 1200, 630, 0.22);

    chromeShot(iconHtml, master512, 512, 512);
    chromeShot(ogHtml, masterOg, 1200, 630);

    const out = {
      'android-chrome-512x512.png': 512,
      'android-chrome-192x192.png': 192,
      'apple-touch-icon.png': 180,
      'favicon-32x32.png': 32,
      'favicon-16x16.png': 16,
    };

    for (const [name, size] of Object.entries(out)) {
      sipsResize(master512, join(PUBLIC, name), size);
      console.log(`wrote ${name} (${size}×${size})`);
    }

    copyFileSync(masterOg, join(PUBLIC, 'og-image.png'));
    console.log('wrote og-image.png (1200×630)');
    console.log('Done — derived from bitcode-logo.svg on', BG);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main();
