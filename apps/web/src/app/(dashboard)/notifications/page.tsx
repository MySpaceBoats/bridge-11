'use client';

import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const notifIcons: Record<string, string> = {
  new_event: '📅',
  event_reminder: '⏰',
  new_message: '💬',
  new_poll: '📊',
  poll_result: '✅',
  new_contribution: '💰',
  family_invite: '👨‍👩‍👧',
  post_like: '❤️',
  post_comment: '💬',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setNotifications(data.data);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((n) => n.map((notif) => ({ ...notif, read: true })));
    } finally {
      setMarking(false);
    }
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((n) => n.map((notif) => notif.id === id ? { ...notif, read: true } : notif));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} loading={marking}>
            <Check className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium">No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markRead(notif.id)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer',
                notif.read
                  ? 'bg-white border-gray-100'
                  : 'bg-brand-50 border-brand-100 hover:bg-brand-100',
              )}
            >
              <div className="text-2xl flex-shrink-0">{notifIcons[notif.type] ?? '🔔'}</div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', notif.read ? 'text-gray-700' : 'text-gray-900')}>
                  {notif.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{notif.body}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-brand-500 rounded-full mt-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
