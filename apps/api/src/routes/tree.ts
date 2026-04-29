import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const treeRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

treeRoutes.use('*', auth);

treeRoutes.get('/:familyId/tree', async (c) => {
  const sb = adminClient(c.env);
  const familyId = c.req.param('familyId');

  const [{ data: members }, { data: relations }] = await Promise.all([
    sb.from('family_members')
      .select('user_id, role, user:profiles(id,first_name,last_name,avatar_url)')
      .eq('family_id', familyId),
    sb.from('family_relations')
      .select('*')
      .eq('family_id', familyId),
  ]);

  const nodes = (members ?? []).map((m: any, i: number) => ({
    id: m.user_id,
    type: 'member',
    data: { userId: m.user_id, firstName: m.user.first_name, lastName: m.user.last_name, avatarUrl: m.user.avatar_url, role: m.role },
    position: { x: (i % 4) * 220, y: Math.floor(i / 4) * 180 },
  }));

  const edges = (relations ?? []).map((r: any) => ({
    id: r.id,
    source: r.from_user_id,
    target: r.to_user_id,
    label: r.relation_type,
  }));

  return c.json({ nodes, edges });
});

treeRoutes.post('/:familyId/tree/relations', async (c) => {
  const { fromUserId, toUserId, relationType } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('family_relations')
    .insert({ family_id: c.req.param('familyId'), from_user_id: fromUserId, to_user_id: toUserId, relation_type: relationType })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

treeRoutes.delete('/:familyId/tree/relations/:id', async (c) => {
  const sb = adminClient(c.env);
  await sb.from('family_relations')
    .delete().eq('id', c.req.param('id')).eq('family_id', c.req.param('familyId'));
  return c.body(null, 204);
});
