"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsDynamoPutItemTool = exports.awsS3PutObjectTool = exports.awsMcpTool = exports.awsCloudWatchLogTool = exports.awsDynamoGetItemTool = exports.awsS3GetObjectTool = exports.awsLambdaInvokeTool = void 0;
function passthroughTool(resultBuilder) {
    return {
        execute: async (input) => resultBuilder(input)
    };
}
exports.awsLambdaInvokeTool = passthroughTool((input) => ({
    functionName: input.functionName ?? 'mock',
    payload: input.payload ?? {},
    invokedAt: new Date().toISOString()
}));
exports.awsS3GetObjectTool = passthroughTool((input) => ({
    bucket: input.bucket ?? 'bitcode-demo',
    key: input.key ?? 'config/demo.json',
    body: JSON.stringify({ message: 'mock s3 get' })
}));
exports.awsDynamoGetItemTool = passthroughTool((input) => ({
    table: input.table ?? 'bitcode-demo-table',
    key: input.key ?? { pk: 'demo' },
    item: {
        status: 'mock',
        ...(typeof input.key === 'object' && input.key !== null ? input.key : {})
    }
}));
exports.awsCloudWatchLogTool = passthroughTool((input) => ({
    logGroup: input.logGroup ?? '/aws/lambda/mock',
    entries: [{ message: 'Mock log entry', timestamp: Date.now() }]
}));
exports.awsMcpTool = passthroughTool((input) => ({
    request: input.request ?? 'noop',
    response: { ok: true }
}));
exports.awsS3PutObjectTool = passthroughTool((input) => ({
    bucket: input.bucket ?? 'bitcode-demo',
    key: input.key ?? 'config/demo.json',
    size: typeof input.body === 'string' ? input.body.length : 0,
    status: 'Uploaded'
}));
exports.awsDynamoPutItemTool = passthroughTool((input) => ({
    table: input.table ?? 'bitcode-demo-table',
    item: input.item ?? {},
    status: 'Inserted'
}));
