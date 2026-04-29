import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const eventsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

eventsRoutes.use('*', auth);

eventsRoutes.get('/:familyId/events', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('events')
    .select('*, created_by:profiles(id,first_name,last_name,avatar_url), participations:event_participations(*, user:profiles(id,first_name,last_name,avatar_url))')
    .eq('family_id', c.req.param('familyId'))
    .order('start_date', { ascending: true });
  return c.json(data ?? []);
});

eventsRoutes.get('/:familyId/events/upcoming', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('events')
    .select('*, participations:event_participations(user_id,status)')
    .eq('family_id', c.req.param('familyId'))
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(5);
  return c.json(data ?? []);
});

eventsRoutes.get('/:familyId/events/:eventId', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('events')
    .select('*, created_by:profiles(id,first_name,last_name), participations:event_participations(*, user:profiles(id,first_name,last_name,avatar_url))')
    .eq('id', c.req.param('eventId'))
    .single();
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json(data);
});

eventsRoutes.post('/:familyId/events', async (c) => {
  const body = await c.req.json();
  const sb = adminClient(c.env);
  const userId = c.get('userId');
  const familyId = c.req.param('familyId');

  const { data: event, error } = await sb
    .from('events')
    .insert({ ...body, family_id: familyId, created_by: userId })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);

  // Notify family members
  const { data: members } = await sb.from('family_members')
    .select('user_id').eq('family_id', familyId).neq('user_id', userId);
  if (members?.length) {
    await sb.from('notifications').insert(
      members.map((m: any) => ({
        user_id: m.user_id, type: 'new_event',
        title: 'Nouvel événement', body: `"${event.title}" a été créé`,
        data: { event_id: event.id, family_id: familyId },
      })),
    );
  }

  return c.json(event, 201);
});

eventsRoutes.post('/:familyId/events/:eventId/respond', async (c) => {
  const { status } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('event_participations')
    .upsert({ event_id: c.req.param('eventId'), user_id: c.get('userId'), status }, { onConflict: 'event_id,user_id' })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

eventsRoutes.delete('/:familyId/events/:eventId', async (c) => {
  const sb = adminClient(c.env);
  await sb.from('events').delete().eq('id', c.req.param('eventId'));
  return c.body(null, 204);
});
