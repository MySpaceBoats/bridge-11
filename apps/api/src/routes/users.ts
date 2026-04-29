import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const usersRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

usersRoutes.use('*', auth);

usersRoutes.get('/search', async (c) => {
  const q = c.req.query('q') ?? '';
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('profiles')
    .select('id,email,first_name,last_name,avatar_url,bio')
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(20);
  return c.json(data ?? []);
});

usersRoutes.get('/me', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('id', c.get('userId'))
    .single();
  return c.json(data);
});

usersRoutes.get('/:id', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('profiles')
    .select('id,email,first_name,last_name,avatar_url,bio,skills')
    .eq('id', c.req.param('id'))
    .single();
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json(data);
});

usersRoutes.patch('/profile', async (c) => {
  const body = await c.req.json();
  const allowed = ['first_name', 'last_name', 'bio', 'phone', 'skills'];
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k)),
  );
  update.updated_at = new Date().toISOString();
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('profiles')
    .update(update)
    .eq('id', c.get('userId'))
    .select()
    .single();
  return c.json(data);
});
