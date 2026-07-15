import os from 'node:os';
import path from 'node:path';

type BitcodeAppContextOptions = {
  dataPath?: string;
};

function isServerlessRuntime(env: NodeJS.ProcessEnv) {
  return (
    env.VERCEL === '1'
    || Boolean(env.LAMBDA_TASK_ROOT)
    || Boolean(env.AWS_LAMBDA_FUNCTION_NAME)
    || String(env.AWS_EXECUTION_ENV || '').startsWith('AWS_Lambda')
  );
}

export function resolveBitcodeAppContextOptions(
  env: NodeJS.ProcessEnv = process.env,
): BitcodeAppContextOptions {
  const configuredDataPath = String(env.BITCODE_DATA_PATH || '').trim();
  if (configuredDataPath) {
    return { dataPath: configuredDataPath };
  }

  if (isServerlessRuntime(env)) {
    return {
      dataPath: path.join(os.tmpdir(), 'bitcode-uapi-state.json'),
    };
  }

  return {};
}
