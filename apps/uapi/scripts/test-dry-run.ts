/**
 * Test script for dry run mode
 * 
 * This script demonstrates how to use dry run mode to test the system without making actual LLM calls.
 */

import { configureDryRun, isDryRunEnabled } from '@bitcode/dryrun';
import { structuredLLMCall } from '@bitcode/steps/sub';
import { z } from 'zod';

async function testDryRunMode() {
  console.log('Testing dry run mode...');
  
  // Enable dry run mode
  configureDryRun({
    enabled: true,
    logPrompts: true,
    logResponses: true
  });
  
  console.log(`Dry run mode enabled: ${isDryRunEnabled()}`);
  
  // Define a test schema
  const TestSchema = z.object({
    message: z.string(),
    success: z.boolean(),
    items: z.array(z.string()),
    metadata: z.object({
      timestamp: z.string().optional()
    }).optional()
  });
  
  // Make a test LLM call
  const result = await structuredLLMCall(
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Generate a test response.' }
    ],
    {
      schema: TestSchema,
      structuredPrompt: 'Generate a test response following the schema.',
      fallback: () => ({
        message: 'Fallback message',
        success: false,
        items: [],
        metadata: { timestamp: new Date().toISOString() }
      })
    },
    'Test dry run mode'
  );
  
  console.log('Dry run result:', JSON.stringify(result, null, 2));
}

// Run the test
testDryRunMode().catch(console.error);
