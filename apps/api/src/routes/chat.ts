import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const chatRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

chatRoutes.use('*', auth);

chatRoutes.get('/:familyId/chat/groups', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('chat_groups')
    .select('*')
    .eq('family_id', c.req.param('familyId'))
    .order('created_at', { ascending: true });
  return c.json(data ?? []);
});

chatRoutes.post('/:familyId/chat/groups', async (c) => {
  const { name, type } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('chat_groups')
    .insert({ family_id: c.req.param('familyId'), name, type: type ?? 'branch', created_by: c.get('userId') })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

chatRoutes.get('/:familyId/chat/groups/:groupId/messages', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = 50;
  const sb = adminClient(c.env);
  const { data, count } = await sb
    .from('messages')
    .select('*, sender:profiles(id,first_name,last_name,avatar_url)', { count: 'exact' })
    .eq('group_id', c.req.param('groupId'))
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  return c.json({ data: (data ?? []).reverse(), total: count ?? 0 });
});

// REST fallback for sending messages (Supabase Realtime handles the push)
chatRoutes.post('/:familyId/chat/groups/:groupId/messages', async (c) => {
  const { content, mediaUrl } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('messages')
    .insert({ group_id: c.req.param('groupId'), sender_id: c.get('userId'), content, media_url: mediaUrl })
    .select('*, sender:profiles(id,first_name,last_name,avatar_url)')
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});
