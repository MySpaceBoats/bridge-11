import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const contributionsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

contributionsRoutes.use('*', auth);

contributionsRoutes.get('/:familyId/contributions', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('contributions')
    .select('*, created_by:profiles(id,first_name,last_name), event:events(id,title), payments:contribution_payments(*, user:profiles(id,first_name,last_name))')
    .eq('family_id', c.req.param('familyId'))
    .order('created_at', { ascending: false });
  return c.json(data ?? []);
});

contributionsRoutes.get('/:familyId/contributions/:id', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('contributions')
    .select('*, created_by:profiles(id,first_name,last_name), event:events(id,title), payments:contribution_payments(*, user:profiles(id,first_name,last_name))')
    .eq('id', c.req.param('id'))
    .single();
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json(data);
});

contributionsRoutes.post('/:familyId/contributions', async (c) => {
  const { title, description, targetAmount, currency, eventId } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('contributions')
    .insert({ family_id: c.req.param('familyId'), created_by: c.get('userId'), title, description, target_amount: targetAmount ?? null, currency: currency ?? 'EUR', event_id: eventId ?? null })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

contributionsRoutes.post('/:familyId/contributions/:id/pledge', async (c) => {
  const { promisedAmount, notes } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('contribution_payments')
    .upsert({ contribution_id: c.req.param('id'), user_id: c.get('userId'), promised_amount: promisedAmount, notes }, { onConflict: 'contribution_id,user_id' })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

contributionsRoutes.patch('/:familyId/contributions/payments/:paymentId', async (c) => {
  const allowed = ['paid_amount', 'status', 'notes'];
  const body = await c.req.json();
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  update.updated_at = new Date().toISOString();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('contribution_payments')
    .update(update)
    .eq('id', c.req.param('paymentId'))
    .eq('user_id', c.get('userId'))
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});
