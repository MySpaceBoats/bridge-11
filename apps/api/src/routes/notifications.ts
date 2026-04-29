import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const notificationsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

notificationsRoutes.use('*', auth);

notificationsRoutes.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = 20;
  const sb = adminClient(c.env);
  const { data, count } = await sb
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', c.get('userId'))
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  return c.json({ data: data ?? [], total: count ?? 0 });
});

notificationsRoutes.get('/unread-count', async (c) => {
  const sb = adminClient(c.env);
  const { count } = await sb
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', c.get('userId'))
    .eq('read', false);
  return c.json({ count: count ?? 0 });
});

notificationsRoutes.patch('/:id/read', async (c) => {
  const sb = adminClient(c.env);
  await sb.from('notifications').update({ read: true }).eq('id', c.req.param('id')).eq('user_id', c.get('userId'));
  return c.body(null, 204);
});

notificationsRoutes.patch('/read-all', async (c) => {
  const sb = adminClient(c.env);
  await sb.from('notifications').update({ read: true }).eq('user_id', c.get('userId')).eq('read', false);
  return c.body(null, 204);
});
