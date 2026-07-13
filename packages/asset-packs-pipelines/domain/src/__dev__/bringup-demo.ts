/**
 * Bring-up demo runner for the AssetPack Pipeline (Setup + PTRR Plan)
 *
 * Usage:
 *   pnpm -C packages/pipelines/asset-pack exec ts-node src/dev/bringup-demo.ts
 */

import { Execution } from '@bitcode/execution-generics';
import { enablePipelineStreaming } from '@bitcode/pipelines-generics';
import { assetPackPipeline } from '../index';

async function main() {
  process.env.BITCODE_DEBUG_ONLY_FAILSAFES = 'prepare';
  process.env.BITCODE_DEBUG_ONLY_GENERATIONS = 'reason';

  const execution = new Execution('asset-pack:demo');
  const inserts: any[] = [];
  const supabaseStub: any = {
    from(table: string) {
      return {
        insert: (row: any) => {
          inserts.push({ table, row });
          return { select: (_?: any) => ({ single: () => Promise.resolve({ data: { id: 'id-' + inserts.length } }) }) } as any;
        },
        update: (_: any) => ({ eq: () => Promise.resolve({}) }),
        select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: { id: 'id-last' } } as any) }) }) }) })
      } as any;
    }
  };
  enablePipelineStreaming(execution as any, {
    runId: 'run-demo-1',
    userId: 'user-demo-1',
    supabase: supabaseStub,
    streamToDatabase: true,
    structuredToDatabase: true,
  });

  const input = {
    definitionOfRead: 'Demo bring-up',
    repository: { url: 'https://github.com/acme/repo', branch: 'main' },
    deliveryTarget: 'pr' as const,
  };
  const result = await assetPackPipeline(input, execution);

  console.log('Phase current:', execution.get('phase', 'current'));
  console.log('Result present:', !!result);
  console.log('Structured inserts:');
  for (const i of inserts) {
    console.log('-', i.table, JSON.stringify(i.row));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
