/**
 * HTTP entry for the multi-lang service fixture.
 */
import express from 'express';
import { z } from 'zod';
import { createUserHandler } from './handlers/users';
import { healthHandler } from './handlers/health';
import type { AppConfig } from './types';

const ConfigSchema = z.object({
  port: z.number().int().positive(),
  databaseUrl: z.string().min(1),
});

export function buildApp(config: AppConfig) {
  const app = express();
  app.use(express.json());
  app.get('/health', healthHandler);
  app.post('/users', createUserHandler);
  return app;
}

export function parseConfig(env: NodeJS.ProcessEnv): AppConfig {
  return ConfigSchema.parse({
    port: Number(env.PORT || 3000),
    databaseUrl: env.DATABASE_URL || 'postgres://localhost/app',
  });
}

export async function main() {
  const config = parseConfig(process.env);
  const app = buildApp(config);
  return app.listen(config.port);
}
