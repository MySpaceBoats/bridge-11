import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const familiesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

familiesRoutes.use('*', auth);

familiesRoutes.get('/', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('family_members')
    .select('family:families(*)')
    .eq('user_id', c.get('userId'));
  return c.json((data ?? []).map((d: any) => d.family));
});

familiesRoutes.post('/', async (c) => {
  const { name, description } = await c.req.json();
  if (!name) return c.json({ error: 'name required' }, 400);
  const sb = adminClient(c.env);
  const userId = c.get('userId');

  const { data: family, error } = await sb
    .from('families')
    .insert({ name, description, created_by: userId })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);

  // Creator becomes admin
  await sb.from('family_members').insert({ user_id: userId, family_id: family.id, role: 'admin' });
  // Default chat group
  await sb.from('chat_groups').insert({ family_id: family.id, name: 'General', type: 'general', created_by: userId });

  return c.json(family, 201);
});

familiesRoutes.get('/:familyId', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('families')
    .select('*, members:family_members(*, user:profiles(id,first_name,last_name,avatar_url,email))')
    .eq('id', c.req.param('familyId'))
    .single();
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json(data);
});

familiesRoutes.get('/:familyId/members', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('family_members')
    .select('*, user:profiles(id,first_name,last_name,avatar_url,email,bio,skills)')
    .eq('family_id', c.req.param('familyId'));
  return c.json(data ?? []);
});

familiesRoutes.post('/:familyId/members', async (c) => {
  const { userId: targetId } = await c.req.json();
  const sb = adminClient(c.env);
  await assertAdmin(sb, c.get('userId'), c.req.param('familyId'));
  const { data, error } = await sb
    .from('family_members')
    .insert({ user_id: targetId, family_id: c.req.param('familyId'), role: 'member' })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

familiesRoutes.delete('/:familyId/members/:userId', async (c) => {
  const sb = adminClient(c.env);
  const me = c.get('userId');
  const target = c.req.param('userId');
  if (me !== target) await assertAdmin(sb, me, c.req.param('familyId'));
  await sb.from('family_members').delete()
    .eq('user_id', target).eq('family_id', c.req.param('familyId'));
  return c.body(null, 204);
});

async function assertAdmin(sb: any, userId: string, familyId: string) {
  const { data } = await sb.from('family_members')
    .select('role').eq('user_id', userId).eq('family_id', familyId).single();
  if (!data || data.role !== 'admin') throw new Error('Admin access required');
}
