import * as fs from 'fs';
import * as path from 'path';
import { Execution, ExecutionStorageDestination } from '@bitcode/execution-generics';

// Mock artifacts to write to local filesystem instead of S3/Supabase
jest.mock('@bitcode/generic-artifacts-compose', () => {
  const baseDir = path.resolve(process.cwd(), '.test-artifacts');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  return {
    saveArtifact: async (buffer: Uint8Array | string, name: string, contentType = 'application/json') => {
      const bytes = typeof buffer === 'string' ? Buffer.from(buffer) : Buffer.from(buffer);
      const safeName = name.replace(/[^a-zA-Z0-9/_\.-]/g, '_');
      const filePath = path.join(baseDir, safeName);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, bytes);
      const url = `file://${filePath}`;
      return { url, size: bytes.length, name };
    }
  };
});

describe('Execution persistent storage via file adapter (artifacts mock)', () => {
  it('stores execution state to file and records metadata', async () => {
    const exec = new Execution('exec-file-001');
    const payload = { text: 'hello-world', tokens: 3 };

    const res = await exec.store('llm', 'output', payload, {
      destinations: [ExecutionStorageDestination.PERSISTENT],
      config: { contentType: 'application/json' }
    }) as any;

    expect(res).toBeTruthy();
    expect(res.metadata?.url).toContain('file://');
    expect(res.metadata?.size).toBeGreaterThan(0);

    const meta = exec.getStorageMetadata('llm', 'output')!;
    expect(meta.destinations).toContain(ExecutionStorageDestination.PERSISTENT);
    const filePath = String(meta.metadata?.url || '').replace('file://', '');
    expect(fs.existsSync(filePath)).toBe(true);

    const onDisk = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(onDisk).toEqual(payload);
  });
});
