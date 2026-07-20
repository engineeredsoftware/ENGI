/**
 * Serve the pitch deck PDF from the monorepo SoT (`.bd/the-pitch.pdf`).
 * Does not copy into `public/` — one source of truth on disk.
 * (Keynote source remains at `.bd/the-pitch.key` for authoring only.)
 */

import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DECK_RELATIVE = path.join('.bd', 'the-pitch.pdf');
const DECK_FILENAME = 'the-pitch.pdf';

/** Resolve monorepo-root `.bd/the-pitch.pdf` from app or repo cwd. */
function resolveDeckPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, DECK_RELATIVE),
    path.join(cwd, '..', DECK_RELATIVE),
    path.join(cwd, '..', '..', DECK_RELATIVE),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export async function GET() {
  const deckPath = resolveDeckPath();
  if (!deckPath) {
    return new Response(JSON.stringify({ error: 'pitch deck not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = createReadStream(deckPath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${DECK_FILENAME}"`,
      'Cache-Control': 'public, max-age=300',
      'X-Bitcode-Deck-Source': DECK_RELATIVE,
    },
  });
}
