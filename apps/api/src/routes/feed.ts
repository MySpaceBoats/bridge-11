import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const feedRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

feedRoutes.use('*', auth);

feedRoutes.get('/:familyId/feed', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = 20;
  const sb = adminClient(c.env);
  const { data, count } = await sb
    .from('posts')
    .select('*, author:profiles(id,first_name,last_name,avatar_url), comments(*, author:profiles(id,first_name,last_name,avatar_url)), likes(user_id)', { count: 'exact' })
    .eq('family_id', c.req.param('familyId'))
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  return c.json({ data: data ?? [], total: count ?? 0 });
});

feedRoutes.post('/:familyId/feed', async (c) => {
  const { content, imageUrl } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('posts')
    .insert({ family_id: c.req.param('familyId'), author_id: c.get('userId'), content, image_url: imageUrl ?? null })
    .select('*, author:profiles(id,first_name,last_name,avatar_url)')
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

feedRoutes.post('/:familyId/feed/:postId/comments', async (c) => {
  const { content } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('comments')
    .insert({ post_id: c.req.param('postId'), author_id: c.get('userId'), content })
    .select('*, author:profiles(id,first_name,last_name,avatar_url)')
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

feedRoutes.post('/:familyId/feed/:postId/like', async (c) => {
  const sb = adminClient(c.env);
  const userId = c.get('userId');
  const postId = c.req.param('postId');
  const { data: existing } = await sb.from('likes').select('id').eq('post_id', postId).eq('user_id', userId).single();
  if (existing) {
    await sb.from('likes').delete().eq('id', existing.id);
    return c.json({ liked: false });
  }
  await sb.from('likes').insert({ post_id: postId, user_id: userId });
  return c.json({ liked: true });
});

feedRoutes.delete('/:familyId/feed/:postId', async (c) => {
  const sb = adminClient(c.env);
  await sb.from('posts').delete().eq('id', c.req.param('postId')).eq('author_id', c.get('userId'));
  return c.body(null, 204);
});
