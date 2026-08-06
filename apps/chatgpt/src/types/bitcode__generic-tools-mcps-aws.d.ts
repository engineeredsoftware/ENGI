declare module '@bitcode/generic-tools-mcps-aws' {
  type AwsPayload = Record<string, unknown>;

  export const awsLambdaInvokeTool: { execute: (input: AwsPayload) => Promise<Record<string, unknown>> };
  export const awsS3GetObjectTool: { execute: (input: AwsPayload) => Promise<Record<string, unknown>> };
  export const awsDynamoGetItemTool: { execute: (input: AwsPayload) => Promise<Record<string, unknown>> };
  export const awsCloudWatchLogTool: { execute: (input: AwsPayload) => Promise<Record<string, unknown>> };
  export const awsMcpTool: { execute: (input: AwsPayload) => Promise<Record<string, unknown>> };
  export const awsS3PutObjectTool: { execute: (input: AwsPayload) => Promise<Record<string, unknown>> };
  export const awsDynamoPutItemTool: { execute: (input: AwsPayload) => Promise<Record<string, unknown>> };
}
