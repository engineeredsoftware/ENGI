import {
  FRAMEWORK_FINGERPRINTS,
  LANGUAGE_EXT_MAP,
  ARCHITECTURAL_PATTERNS,
  RUNTIME_TARGETS,
  RUNTIME_EVIDENCE,
  measureDataPackMaterialIdentity,
  listMaterialIdentityScalarKinds,
  MATERIAL_IDENTITY_SCALAR_KIND_SPECS,
} from '../../index';

describe('CORE: DataPack material identity', () => {
  it('exposes 19 companion scalar kinds with positive companion shares', () => {
    expect(listMaterialIdentityScalarKinds()).toHaveLength(19);
    expect(MATERIAL_IDENTITY_SCALAR_KIND_SPECS.every((s) => s.companionWeightShare > 0)).toBe(
      true,
    );
  });

  it('catalogues are broad (languages, frameworks, patterns, runtimes)', () => {
    expect(Object.keys(LANGUAGE_EXT_MAP).length).toBeGreaterThan(80);
    expect(FRAMEWORK_FINGERPRINTS.length).toBeGreaterThan(80);
    expect(ARCHITECTURAL_PATTERNS.length).toBeGreaterThan(30);
    expect(RUNTIME_TARGETS.length).toBeGreaterThan(30);
    expect(RUNTIME_EVIDENCE.length).toBeGreaterThan(20);
  });

  it('extracts language mix, frameworks, purpose, runtimes, and dep usage', () => {
    const identity = measureDataPackMaterialIdentity({
      title: 'Auth rate-limit middleware',
      summary: 'Express JWT auth with Redis rate limit and Stripe webhook.',
      coveredSourcePaths: [
        'src/middleware/auth.ts',
        'src/routes/api.ts',
        'src/services/billing.ts',
        'package.json',
        'src/middleware/auth.test.ts',
        'Dockerfile',
      ],
      sources: [
        {
          path: 'package.json',
          content: JSON.stringify({
            dependencies: {
              express: '^4.18.0',
              jsonwebtoken: '^9.0.0',
              redis: '^4.0.0',
              stripe: '^12.0.0',
            },
            devDependencies: { jest: '^29.0.0', typescript: '^5.0.0' },
          }),
        },
        {
          path: 'src/middleware/auth.ts',
          content: `
            import express from 'express';
            import jwt from 'jsonwebtoken';
            import redis from 'redis';
            export async function auth(req: express.Request) {
              const token = req.headers.authorization;
              await redis.get('session');
              return jwt.verify(String(token), process.env.JWT_SECRET || '');
            }
          `,
        },
        {
          path: 'src/services/billing.ts',
          content: `
            import Stripe from 'stripe';
            import express from 'express';
            export function webhook(req: express.Request) {
              return 'stripe webhook handler ' + Stripe.errors;
            }
          `,
        },
        {
          path: 'src/routes/api.ts',
          content: `
            import express from 'express';
            const router = express.Router();
            router.get('/health', (_req, res) => res.json({ ok: true }));
            export default router;
          `,
        },
        {
          path: 'Dockerfile',
          content: 'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nCMD ["node","dist/index.js"]\n',
        },
      ],
    });

    expect(identity.schema).toBe('bitcode.data-pack.material-identity');
    expect(identity.honesty).toBe('measured');

    const lang = identity.compositions.find((c) => c.kind === 'language-mix');
    expect(lang?.primary).toBe('typescript');
    expect((lang?.shares.typescript || 0) > 0).toBe(true);

    const frameworks = identity.inventories.find((i) => i.kind === 'frameworks');
    expect(frameworks?.items.some((i) => i.id === 'express')).toBe(true);
    expect(frameworks?.items.some((i) => i.id === 'stripe')).toBe(true);

    const deps = identity.inventories.find((i) => i.kind === 'dependencies');
    expect(deps).toBeTruthy();
    expect((deps!.totalCount || 0)).toBeGreaterThanOrEqual(5);
    // All declared deps should appear in items (under display cap)
    for (const name of ['express', 'jsonwebtoken', 'redis', 'stripe', 'jest', 'typescript']) {
      expect(deps!.items.some((i) => i.id === name)).toBe(true);
    }
    // express is heavily used across source files → highest usage among app deps
    const expressDep = deps!.items.find((i) => i.id === 'express');
    expect(expressDep?.referenceCount || 0).toBeGreaterThan(0);
    expect(expressDep?.fileHitCount || 0).toBeGreaterThan(0);
    expect((expressDep?.usageShare || 0) > 0).toBe(true);
    // Sorted by usage: first item should have usageShare >= later ones
    if (deps!.items.length >= 2) {
      expect(deps!.items[0]!.usageShare || 0).toBeGreaterThanOrEqual(
        deps!.items[1]!.usageShare || 0,
      );
    }

    const purpose = identity.tagSets.find((t) => t.kind === 'purpose');
    expect(purpose?.tags.length).toBeGreaterThan(0);

    const runtimes = identity.tagSets.find((t) => t.kind === 'runtimes');
    expect(runtimes?.tags.includes('node')).toBe(true);
    // Dockerfile evidence
    expect(runtimes?.tags.includes('docker')).toBe(true);

    const caps = identity.tagSets.find((t) => t.kind === 'capabilities');
    expect(caps?.tags.some((t) => t === 'authn' || t === 'payments' || t === 'webhooks' || t === 'caching')).toBe(
      true,
    );

    expect(identity.scalarVolumes['language-concentration']).toBeGreaterThan(0);
    expect(identity.scalarVolumes['framework-surface']).toBeGreaterThan(0);
    expect(identity.scalarVolumes['capability-surface']).toBeGreaterThan(0);
    expect(identity.corpusTokens.length).toBeGreaterThan(5);
    expect(identity.corpusTokens.some((t) => t.includes('express'))).toBe(true);
    expect(identity.corpusTokens.some((t) => t.includes('dep-used:express') || t === 'express')).toBe(
      true,
    );
  });

  it('detects architectural patterns and multiple languages', () => {
    const identity = measureDataPackMaterialIdentity({
      title: 'Hexagonal order service',
      coveredSourcePaths: [
        'src/domain/Order.ts',
        'src/application/CreateOrder.ts',
        'src/adapters/http/OrderController.ts',
        'src/ports/OrderRepository.ts',
        'queries/GetOrderHandler.ts',
        'commands/CreateOrderHandler.ts',
        'worker.py',
      ],
      sources: [
        {
          path: 'src/ports/OrderRepository.ts',
          content: 'export interface OrderRepository { save(o: unknown): Promise<void> }',
        },
        {
          path: 'src/adapters/http/OrderController.ts',
          content: 'import express from "express"; // hexagonal driving adapter\nexport const router = express.Router();',
        },
        {
          path: 'commands/CreateOrderHandler.ts',
          content: 'export class CreateOrderHandler { /* cqrs command handler */ }',
        },
        {
          path: 'worker.py',
          content: 'from celery import Celery\napp = Celery("orders")\n',
        },
      ],
    });
    const patterns = identity.tagSets.find((t) => t.kind === 'architectural-patterns');
    expect(
      patterns?.tags.some((t) =>
        ['hexagonal', 'cqrs', 'layered', 'repository-pattern'].includes(t),
      ),
    ).toBe(true);
    const lang = identity.compositions.find((c) => c.kind === 'language-mix');
    expect(Object.keys(lang?.shares || {})).toEqual(
      expect.arrayContaining(['typescript', 'python']),
    );
  });

  it('returns insufficient evidence bag for empty input', () => {
    const identity = measureDataPackMaterialIdentity({});
    expect(identity.honesty).toBe('insufficient_evidence');
    expect(identity.compositions).toHaveLength(2);
  });
});
