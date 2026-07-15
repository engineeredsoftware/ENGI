type AwsToolStub = {
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

function passthroughTool(resultBuilder: (input: Record<string, unknown>) => Record<string, unknown>): AwsToolStub {
  return {
    execute: async (input) => resultBuilder(input)
  };
}

export const awsLambdaInvokeTool = passthroughTool((input) => ({
  functionName: input.functionName ?? 'mock',
  payload: input.payload ?? {},
  invokedAt: new Date().toISOString()
}));

export const awsS3GetObjectTool = passthroughTool((input) => ({
  bucket: input.bucket ?? 'bitcode-demo',
  key: input.key ?? 'config/demo.json',
  body: JSON.stringify({ message: 'mock s3 get' })
}));

export const awsDynamoGetItemTool = passthroughTool((input) => ({
  table: input.table ?? 'bitcode-demo-table',
  key: input.key ?? { pk: 'demo' },
  item: {
    status: 'mock',
    ...(typeof input.key === 'object' && input.key !== null ? (input.key as Record<string, unknown>) : {})
  }
}));

export const awsCloudWatchLogTool = passthroughTool((input) => ({
  logGroup: input.logGroup ?? '/aws/lambda/mock',
  entries: [{ message: 'Mock log entry', timestamp: Date.now() }]
}));

export const awsMcpTool = passthroughTool((input) => ({
  request: input.request ?? 'noop',
  response: { ok: true }
}));

export const awsS3PutObjectTool = passthroughTool((input) => ({
  bucket: input.bucket ?? 'bitcode-demo',
  key: input.key ?? 'config/demo.json',
  size: typeof input.body === 'string' ? input.body.length : 0,
  status: 'Uploaded'
}));

export const awsDynamoPutItemTool = passthroughTool((input) => ({
  table: input.table ?? 'bitcode-demo-table',
  item: input.item ?? {},
  status: 'Inserted'
}));
