import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const auth = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    const user = await verifyToken(c.env, token);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    c.set('userId', user.id);
    await next();
  },
);
