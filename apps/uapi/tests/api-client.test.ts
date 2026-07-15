import { callAssetPackExecutionsAPI } from '../networking/api-client';

describe('callAssetPackExecutionsAPI', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('sends the AssetPack execution payload with canonical read and pipeline fields', async () => {
    const mockResponse = { ok: true, body: 'STREAM_BODY' };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    const stream = await callAssetPackExecutionsAPI(
      123,
      'owner',
      'repo',
      'main',
      'abcd',
      null,
      'do work',
      'UTC',
      'mcp',
      'model-id',
      [{ id: 'source-1', type: 'source', content: 'context' }],
      2,
      undefined,
      'agentic-execution:asset-pack'
    );

    const [, request] = (global.fetch as jest.Mock).mock.calls[0];
    expect(request).toEqual(expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'X-User-Timezone': 'UTC'
      })
    }));
    expect(JSON.parse(String(request.body))).toEqual(expect.objectContaining({
      connectionId: 123,
      repoOwner: 'owner',
      repoName: 'repo',
      repoBranch: 'main',
      repoCommit: 'abcd',
      issueNumber: null,
      definition_of_read: 'do work',
      modelProvider: 'mcp',
      modelId: 'model-id',
      iterationCount: 2,
      pipeline_type: 'agentic-execution:asset-pack'
    }));

    expect(stream).toBe('STREAM_BODY');
  });

  it('sends multipart form data when files are present', async () => {
    const mockResponse = { ok: true, body: 'STREAM_BODY' };
    const file = new File(['content'], 'read.txt', { type: 'text/plain' });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await callAssetPackExecutionsAPI(
      123,
      'owner',
      'repo',
      'main',
      'abcd',
      '1',
      'do work',
      'UTC',
      'mcp',
      'model-id',
      [],
      3,
      [file]
    );

    const request = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(request.headers).toEqual({ 'X-User-Timezone': 'UTC' });
    expect(request.body).toBeInstanceOf(FormData);
  });
});
