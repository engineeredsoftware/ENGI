import type { Request, Response } from 'express';

/** Liveness probe for the service. */
export function healthHandler(_req: Request, res: Response) {
  res.status(200).json({ ok: true, service: 'multi-lang-service' });
}
