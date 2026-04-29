import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { adminClient } from '../lib/supabase';
import type { Env, Variables } from '../types';

export const mediaRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

mediaRoutes.use('*', auth);

mediaRoutes.get('/:familyId/media/albums', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('albums')
    .select('*, created_by:profiles(id,first_name,last_name), event:events(id,title)')
    .eq('family_id', c.req.param('familyId'))
    .order('created_at', { ascending: false });
  return c.json(data ?? []);
});

mediaRoutes.post('/:familyId/media/albums', async (c) => {
  const { name, eventId } = await c.req.json();
  const sb = adminClient(c.env);
  const { data, error } = await sb
    .from('albums')
    .insert({ family_id: c.req.param('familyId'), name, event_id: eventId ?? null, created_by: c.get('userId') })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

mediaRoutes.get('/:familyId/media/albums/:albumId', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb
    .from('albums')
    .select('*, media(*, uploaded_by:profiles(id,first_name,last_name)), event:events(id,title)')
    .eq('id', c.req.param('albumId'))
    .single();
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json(data);
});

mediaRoutes.get('/:familyId/media', async (c) => {
  const sb = adminClient(c.env);
  let query = sb.from('media')
    .select('*, uploaded_by:profiles(id,first_name,last_name)')
    .eq('family_id', c.req.param('familyId'))
    .order('created_at', { ascending: false });
  const albumId = c.req.query('albumId');
  if (albumId) query = query.eq('album_id', albumId);
  const { data } = await query;
  return c.json(data ?? []);
});

/**
 * Returns a short-lived signed upload URL so the browser can PUT directly
 * to Supabase Storage without going through the Worker.
 * The browser then calls POST /:familyId/media/confirm after upload.
 */
mediaRoutes.post('/:familyId/media/upload-url', async (c) => {
  const { filename, mimeType, albumId } = await c.req.json();
  const userId = c.get('userId');
  const familyId = c.req.param('familyId');
  const ext = filename.split('.').pop() ?? 'bin';
  const path = `${userId}/${Date.now()}.${ext}`;
  const bucket = mimeType.startsWith('video/') ? 'media' : 'media';

  const sb = adminClient(c.env);
  const { data, error } = await sb.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ signedUrl: data.signedUrl, path, token: data.token, albumId });
});

/** Called by the browser after a successful direct upload to Supabase Storage */
mediaRoutes.post('/:familyId/media/confirm', async (c) => {
  const { path, mimeType, name, size, albumId } = await c.req.json();
  const sb = adminClient(c.env);
  const { data: urlData } = sb.storage.from('media').getPublicUrl(path);

  const { data, error } = await sb
    .from('media')
    .insert({
      family_id: c.req.param('familyId'),
      album_id: albumId ?? null,
      uploaded_by: c.get('userId'),
      storage_path: path,
      url: urlData.publicUrl,
      type: mimeType.startsWith('video/') ? 'video' : 'photo',
      name, size,
    })
    .select().single();
  if (error) return c.json({ error: error.message }, 400);

  // Set album cover if first media
  if (albumId) {
    const { count } = await sb.from('media').select('*', { count: 'exact', head: true }).eq('album_id', albumId);
    if ((count ?? 0) <= 1) await sb.from('albums').update({ cover_url: urlData.publicUrl }).eq('id', albumId);
  }
  return c.json(data, 201);
});

mediaRoutes.delete('/:familyId/media/:mediaId', async (c) => {
  const sb = adminClient(c.env);
  const { data } = await sb.from('media').select('storage_path').eq('id', c.req.param('mediaId')).single();
  if (data) await sb.storage.from('media').remove([data.storage_path]);
  await sb.from('media').delete().eq('id', c.req.param('mediaId')).eq('uploaded_by', c.get('userId'));
  return c.body(null, 204);
});
