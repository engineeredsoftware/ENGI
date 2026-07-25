import type { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user-service';

const CreateUserBody = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof CreateUserBody>;

export async function createUserHandler(req: Request, res: Response) {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  const service = new UserService();
  const user = await service.create(parsed.data);
  res.status(201).json(user);
}
