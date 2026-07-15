import fs from 'node:fs';
import path from 'node:path';

type GlobalWithFlag = typeof globalThis & {
  __BITCODE_CHATGPTAPP_ENV_INITIALIZED__?: boolean;
};

const globalWithFlag = globalThis as GlobalWithFlag;

function collectAncestors(start: string, seen: Set<string>): void {
  let current = path.resolve(start);

  while (!seen.has(current)) {
    seen.add(current);
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
}

if (!globalWithFlag.__BITCODE_CHATGPTAPP_ENV_INITIALIZED__) {
  const directories = new Set<string>();

  collectAncestors(process.cwd(), directories);
  collectAncestors(__dirname, directories);
  if (process.env.BITCODE_REPO_ROOT) {
    collectAncestors(process.env.BITCODE_REPO_ROOT, directories);
  }

  const orderedDirectories = Array.from(directories).sort((a, b) => {
    const depth = (value: string) => value.split(path.sep).filter(Boolean).length;
    return depth(a) - depth(b);
  });

  const envOrder = ['.env', '.env.local'];
  const loadedFiles = new Set<string>();

  for (const directory of orderedDirectories) {
    for (const filename of envOrder) {
      const candidate = path.resolve(directory, filename);
      if (!loadedFiles.has(candidate) && fs.existsSync(candidate)) {
        applyEnvFile(candidate);
        loadedFiles.add(candidate);
      }
    }
  }

  // Normalize Exa credentials so downstream packages only have to look at EXA_API_KEY.
  if (!process.env.EXA_API_KEY && process.env.EXASEARCH_API_KEY) {
    process.env.EXA_API_KEY = process.env.EXASEARCH_API_KEY;
  }

  // Default to mock Exa locally when no credentials exist at all.
  const hasExaCred = Boolean(process.env.EXA_API_KEY || process.env.EXASEARCH_API_KEY);
  if (!hasExaCred && typeof process.env.BITCODE_MOCK_EXA === 'undefined') {
    process.env.BITCODE_MOCK_EXA = 'true';
  }

  globalWithFlag.__BITCODE_CHATGPTAPP_ENV_INITIALIZED__ = true;
}

function applyEnvFile(filePath: string): void {
  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    const lines = contents.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || key.startsWith('#')) continue;
      if (Object.prototype.hasOwnProperty.call(process.env, key)) continue;

      let value = trimmed.slice(separatorIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch {
    // Ignore unreadable env files to keep bootstrap resilient.
  }
}
