import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const pollsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

pollsRoutes.use('*', auth);

pollsRoutes.get('/:familyId/polls', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('polls')
    .select('*, created_by:profiles(id,first_name,last_name), votes:poll_votes(*)')
    .eq('family_id', c.req.param('familyId'))
    .order('created_at', { ascending: false });
  return c.json(data ?? []);
});

pollsRoutes.get('/:familyId/polls/:pollId', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('polls')
    .select('*, created_by:profiles(id,first_name,last_name), votes:poll_votes(*, user:profiles(id,first_name,last_name))')
    .eq('id', c.req.param('pollId'))
    .single();
  if (!data) return c.json({ error: 'Not found' }, 404);

  const results = (data.options as string[]).map((option: string, index: number) => ({
    option,
    count: (data.votes as any[]).filter((v: any) => v.option_index === index).length,
  }));
  return c.json({ ...data, results });
});

pollsRoutes.post('/:familyId/polls', async (c) => {
  const { question, options, endsAt, allowMultiple } = await c.req.json();
  if (!question || !options || options.length < 2) return c.json({ error: 'question and ≥2 options required' }, 400);
  const sb = adminClient(c.env);
  const userId = c.get('userId');
  const familyId = c.req.param('familyId');

  const { data: poll, error } = await sb
    .from('polls')
    .insert({ family_id: familyId, created_by: userId, question, options, ends_at: endsAt ?? null, allow_multiple: allowMultiple ?? false })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);

  const { data: members } = await sb.from('family_members').select('user_id').eq('family_id', familyId).neq('user_id', userId);
  if (members?.length) {
    await sb.from('notifications').insert(
      members.map((m: any) => ({ user_id: m.user_id, type: 'new_poll', title: 'Nouveau sondage', body: question, data: { poll_id: poll.id } })),
    );
  }
  return c.json(poll, 201);
});

pollsRoutes.post('/:familyId/polls/:pollId/vote', async (c) => {
  const { optionIndex } = await c.req.json();
  const sb = adminClient(c.env);
  const { data: poll } = await sb.from('polls').select('allow_multiple').eq('id', c.req.param('pollId')).single();

  if (!poll?.allow_multiple) {
    const { data: existing } = await sb.from('poll_votes').select('id').eq('poll_id', c.req.param('pollId')).eq('user_id', c.get('userId'));
    if (existing?.length) return c.json({ error: 'Already voted' }, 409);
  }
  const { data, error } = await sb
    .from('poll_votes')
    .insert({ poll_id: c.req.param('pollId'), user_id: c.get('userId'), option_index: optionIndex })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

pollsRoutes.delete('/:familyId/polls/:pollId', async (c) => {
  const sb = adminClient(c.env);
  await sb.from('polls').delete().eq('id', c.req.param('pollId'));
  return c.body(null, 204);
});
