import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

const channels: Map<string, RealtimeChannel> = new Map();

export function subscribeToMessages(
  groupId: string,
  onMessage: (payload: any) => void,
): () => void {
  const key = `messages:${groupId}`;
  if (channels.has(key)) return () => unsubscribe(key);

  const channel = supabase
    .channel(key)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
      (payload) => onMessage(payload.new),
    )
    .subscribe();

  channels.set(key, channel);
  return () => unsubscribe(key);
}

export function subscribeToNotifications(
  userId: string,
  onNotification: (payload: any) => void,
): () => void {
  const key = `notifications:${userId}`;
  if (channels.has(key)) return () => unsubscribe(key);

  const channel = supabase
    .channel(key)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onNotification(payload.new),
    )
    .subscribe();

  channels.set(key, channel);
  return () => unsubscribe(key);
}

function unsubscribe(key: string) {
  const channel = channels.get(key);
  if (channel) {
    supabase.removeChannel(channel);
    channels.delete(key);
  }
}
