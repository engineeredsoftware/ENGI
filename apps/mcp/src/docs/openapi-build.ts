import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { generateOpenAPISpec } from './openapi-generator';

function main() {
  const spec = generateOpenAPISpec();
  const outDir = join(__dirname, '..', '..', 'docs', 'openapi');
  const outFile = join(outDir, 'bitcode-mcp-openapi.json');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(spec, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`✅ OpenAPI JSON written to ${outFile}`);
}

main();

