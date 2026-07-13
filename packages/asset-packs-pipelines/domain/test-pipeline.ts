#!/usr/bin/env npx tsx
/**
 * Test script to verify AssetPack pipeline executions E2E
 */

import { assetPackPipeline } from './src/index';
import { Execution } from '@bitcode/execution-generics';

async function testPipeline() {
  console.log('Testing AssetPack pipeline E2E...\n');
  
  const execution = new Execution('test-run-' + Date.now());
  
  // Store minimal required context
  execution.store('execution', 'correlationId', 'test-correlation');
  execution.store('execution', 'id', 'test-execution');
  execution.store('repository', 'owner', 'test-owner');
  execution.store('repository', 'name', 'test-repo');
  execution.store('repository', 'branch', 'main');
  
  // Mock stream writer
  execution.store('execution', 'dataStream', {
    writeData: async (data: string) => {
      const parsed = JSON.parse(data);
      console.log(`[${parsed.type}] ${parsed.message || parsed.status || ''}`);
    }
  });
  
  const input = {
    definitionOfRead: 'Add a simple README.md file',
    repository: {
      url: 'https://github.com/test/repo',
      branch: 'main'
    },
    requirements: {
      documentationRequired: true,
      securityScanRequired: false,
      lintingRequired: false,
      typeCheckRequired: false
    },
    deliveryTarget: 'pr' as const,
    metadata: {
      priority: 'medium' as const,
      requesterId: 'test-user'
    },
    attachments: []
  };
  
  try {
    console.log('Input:', JSON.stringify(input, null, 2));
    console.log('\nExecuting pipeline...\n');
    
    const result = await assetPackPipeline(input, execution);
    
    console.log('\n✅ Pipeline completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    process.exit(1);
  }
}

testPipeline().catch(console.error);
