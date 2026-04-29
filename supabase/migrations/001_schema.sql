-- ============================================================
-- Family Bridge — Supabase SQL Migration
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  first_name  TEXT NOT NULL DEFAULT '',
  last_name   TEXT NOT NULL DEFAULT '',
  bio         TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  skills      TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- FAMILIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.families (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  cover_image_url  TEXT,
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.family_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_id  UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, family_id)
);

-- ────────────────────────────────────────────────────────────
-- FAMILY TREE RELATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.family_relations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id      UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  from_user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relation_type  TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- EVENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id        UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  start_date       TIMESTAMPTZ NOT NULL,
  end_date         TIMESTAMPTZ,
  location         TEXT,
  type             TEXT NOT NULL DEFAULT 'punctual' CHECK (type IN ('punctual','recurring')),
  recurrence_rule  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_participations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'maybe' CHECK (status IN ('going','not_going','maybe')),
  responded_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- CHAT
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general','branch')),
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  media_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- FEED (posts, comments, likes)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- MEDIA
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.albums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES public.events(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  cover_url   TEXT,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  album_id     UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  uploaded_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'photo' CHECK (type IN ('photo','video')),
  name         TEXT,
  size         BIGINT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- POLLS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.polls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id       UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  question        TEXT NOT NULL,
  options         JSONB NOT NULL DEFAULT '[]',
  ends_at         TIMESTAMPTZ,
  allow_multiple  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id       UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_index  INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_index)
);

-- ────────────────────────────────────────────────────────────
-- CONTRIBUTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contributions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id      UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  event_id       UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  target_amount  NUMERIC(10,2),
  currency       TEXT NOT NULL DEFAULT 'EUR',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contribution_payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id  UUID NOT NULL REFERENCES public.contributions(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  promised_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'promised' CHECK (status IN ('promised','paid','cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_family_members_user     ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family   ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_relations_family ON public.family_relations(family_id);
CREATE INDEX IF NOT EXISTS idx_events_family           ON public.events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_start            ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_messages_group          ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created        ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_family            ON public.posts(family_id);
CREATE INDEX IF NOT EXISTS idx_posts_created           ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user      ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read      ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll         ON public.poll_votes(poll_id);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_groups           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;

-- Helper: check membership
CREATE OR REPLACE FUNCTION public.is_family_member(fid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = fid AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_family_admin(fid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = fid AND user_id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles: everyone can read; only owner can update
CREATE POLICY "profiles_select"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- families: visible to members
CREATE POLICY "families_select"   ON public.families FOR SELECT USING (is_family_member(id));
CREATE POLICY "families_insert"   ON public.families FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "families_update"   ON public.families FOR UPDATE USING (is_family_admin(id));

-- family_members
CREATE POLICY "fm_select"  ON public.family_members FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "fm_insert"  ON public.family_members FOR INSERT WITH CHECK (is_family_admin(family_id) OR user_id = auth.uid());
CREATE POLICY "fm_delete"  ON public.family_members FOR DELETE USING (is_family_admin(family_id) OR user_id = auth.uid());

-- family_relations
CREATE POLICY "fr_select"  ON public.family_relations FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "fr_insert"  ON public.family_relations FOR INSERT WITH CHECK (is_family_member(family_id));
CREATE POLICY "fr_delete"  ON public.family_relations FOR DELETE USING (is_family_member(family_id));

-- events
CREATE POLICY "events_select" ON public.events FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "events_insert" ON public.events FOR INSERT WITH CHECK (is_family_member(family_id));
CREATE POLICY "events_delete" ON public.events FOR DELETE USING (is_family_admin(family_id) OR created_by = auth.uid());

-- event_participations
CREATE POLICY "ep_select" ON public.event_participations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND is_family_member(e.family_id))
);
CREATE POLICY "ep_upsert" ON public.event_participations FOR ALL USING (user_id = auth.uid());

-- chat_groups
CREATE POLICY "cg_select" ON public.chat_groups FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "cg_insert" ON public.chat_groups FOR INSERT WITH CHECK (is_family_member(family_id));

-- messages (Realtime reads directly with anon key — needs select policy)
CREATE POLICY "msg_select" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND is_family_member(g.family_id))
);
CREATE POLICY "msg_insert" ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND is_family_member(g.family_id))
);

-- posts, comments, likes
CREATE POLICY "posts_select"    ON public.posts    FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "posts_insert"    ON public.posts    FOR INSERT WITH CHECK (is_family_member(family_id) AND author_id = auth.uid());
CREATE POLICY "posts_delete"    ON public.posts    FOR DELETE USING (author_id = auth.uid());
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND is_family_member(p.family_id))
);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "likes_all"       ON public.likes    FOR ALL USING (user_id = auth.uid());

-- albums, media
CREATE POLICY "albums_select" ON public.albums FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "albums_insert" ON public.albums FOR INSERT WITH CHECK (is_family_member(family_id));
CREATE POLICY "media_select"  ON public.media  FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "media_insert"  ON public.media  FOR INSERT WITH CHECK (is_family_member(family_id) AND uploaded_by = auth.uid());
CREATE POLICY "media_delete"  ON public.media  FOR DELETE USING (uploaded_by = auth.uid());

-- polls, votes
CREATE POLICY "polls_select"  ON public.polls      FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "polls_insert"  ON public.polls      FOR INSERT WITH CHECK (is_family_member(family_id));
CREATE POLICY "votes_select"  ON public.poll_votes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_id AND is_family_member(p.family_id))
);
CREATE POLICY "votes_insert"  ON public.poll_votes FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_id AND is_family_member(p.family_id))
);

-- contributions
CREATE POLICY "contrib_select"  ON public.contributions        FOR SELECT USING (is_family_member(family_id));
CREATE POLICY "contrib_insert"  ON public.contributions        FOR INSERT WITH CHECK (is_family_member(family_id));
CREATE POLICY "payment_select"  ON public.contribution_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contributions c WHERE c.id = contribution_id AND is_family_member(c.family_id))
);
CREATE POLICY "payment_all"     ON public.contribution_payments FOR ALL USING (user_id = auth.uid());

-- notifications: only owner
CREATE POLICY "notif_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', false, 5242880,   ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('media',   'media',   false, 104857600, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid() IS NOT NULL
);
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars' AND auth.uid() IS NOT NULL
);
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "media_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.uid() IS NOT NULL
);
CREATE POLICY "media_storage_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'media' AND auth.uid() IS NOT NULL
);
CREATE POLICY "media_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ────────────────────────────────────────────────────────────
-- REALTIME (enable publications for chat)
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
