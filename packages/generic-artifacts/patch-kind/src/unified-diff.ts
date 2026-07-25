/**
 * Build a unified-diff style .patch text from path+op+body file entries.
 *
 * Used for depositor review downloads and settle-ready material when bodies
 * are attached. Not a full git-delta against parent blobs — each create/modify
 * is a full-file "new file" hunk so the admitted material is complete.
 */

import type { PatchFileEntry } from './types';

function normalizeNewlines(text: string): string {
  return String(text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function ensureTrailingNewline(text: string): string {
  if (!text) return '\n';
  return text.endsWith('\n') ? text : `${text}\n`;
}

/**
 * Serialize patch file entries to unified-diff text.
 * - delete: empty new file / delete header only
 * - create | modify | other: full body as new file mode 100644
 */
export function buildUnifiedDiffFromPatchFiles(
  files: readonly PatchFileEntry[],
  opts?: { patchSummary?: string | null },
): string {
  const lines: string[] = [];
  const summary = typeof opts?.patchSummary === 'string' ? opts.patchSummary.trim() : '';
  if (summary) {
    lines.push(`# ${summary.replace(/\n/g, ' ')}`);
    lines.push('');
  }

  for (const file of files || []) {
    const path = String(file?.path || '').trim();
    if (!path) continue;
    const op = String(file?.op || 'modify').toLowerCase();
    const asContent = file as PatchFileEntry & { content?: string };
    const body =
      typeof file.body === 'string'
        ? file.body
        : typeof asContent.content === 'string'
          ? asContent.content
          : null;

    if (op === 'delete') {
      lines.push(`diff --git a/${path} b/${path}`);
      lines.push(`deleted file mode 100644`);
      lines.push(`--- a/${path}`);
      lines.push(`+++ /dev/null`);
      if (body != null && body.length > 0) {
        const oldLines = ensureTrailingNewline(normalizeNewlines(body)).split('\n');
        // last split is empty when trailing newline
        const count = Math.max(0, oldLines.length - (oldLines[oldLines.length - 1] === '' ? 1 : 0));
        lines.push(`@@ -1,${count} +0,0 @@`);
        for (let i = 0; i < oldLines.length; i++) {
          if (i === oldLines.length - 1 && oldLines[i] === '') break;
          lines.push(`-${oldLines[i]}`);
        }
      } else {
        lines.push(`@@ -0,0 +0,0 @@`);
      }
      lines.push('');
      continue;
    }

    // create / modify: full new contents (depositor review + settle material).
    const content = body != null ? ensureTrailingNewline(normalizeNewlines(body)) : '\n';
    const newLines = content.split('\n');
    const count = Math.max(0, newLines.length - (newLines[newLines.length - 1] === '' ? 1 : 0));
    lines.push(`diff --git a/${path} b/${path}`);
    if (op === 'create') {
      lines.push(`new file mode 100644`);
      lines.push(`--- /dev/null`);
    } else {
      lines.push(`--- a/${path}`);
    }
    lines.push(`+++ b/${path}`);
    lines.push(`@@ -0,0 +1,${Math.max(count, 1)} @@`);
    if (count === 0) {
      lines.push(`+`);
    } else {
      for (let i = 0; i < newLines.length; i++) {
        if (i === newLines.length - 1 && newLines[i] === '') break;
        lines.push(`+${newLines[i]}`);
      }
    }
    lines.push('');
  }

  const text = lines.join('\n');
  return text.endsWith('\n') ? text : `${text}\n`;
}

/** True when at least one file entry carries a body/content string. */
export function patchFilesHaveBodies(files: readonly PatchFileEntry[]): boolean {
  return (files || []).some(
    (f) =>
      typeof f?.body === 'string' ||
      typeof (f as { content?: string })?.content === 'string',
  );
}
