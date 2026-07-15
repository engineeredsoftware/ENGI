import { buildMockConversationStreamEnvelope } from '@/app/api/conversations/_shared';

describe('conversation mock stream shared helpers', () => {
  it('emits canonical AssetPack execution events and Bitcode Terminal write copy', () => {
    const envelope = buildMockConversationStreamEnvelope({
      content: 'Attach the repository and synthesize the asset pack.',
      tokens: [
        { type: 'attachment', value: 'spec.pdf' },
        { type: 'asset_pack', value: 'asset pack' },
      ],
    });

    expect(envelope.pipeline?.pipelineType).toBe('agentic-execution:asset-pack');
    expect(JSON.stringify(envelope.pipeline?.events)).toMatch(/Mock Bitcode agentic execution/);
    expect(JSON.stringify(envelope.pipeline?.events)).toMatch(/AssetPack execution completed/i);
    expect(envelope.assistantReply).toMatch(
      /source attachments, asset packs, output destinations, and settlement-bound proofs/i,
    );
  });

  it('accepts canonical read-measurement tokens in mock stream execution events', () => {
    const envelope = buildMockConversationStreamEnvelope({
      tokens: [{ type: 'read_measurement', value: 'measure the current read' }],
    });

    expect(envelope.pipeline?.pipelineType).toBe('agentic-execution:read-measurement');
    expect(envelope.assistantReply).toMatch(
      /Ask for read measurement, AssetPack execution, source attachment, or settlement-bound output/i,
    );
  });
});
