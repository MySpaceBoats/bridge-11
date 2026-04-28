'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MessageCircle, BarChart2, Wallet, Users, GitBranch, Plus } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { useAuthStore } from '@/store/auth.store';
import { eventsApi, feedApi, pollsApi } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate, timeAgo } from '@/lib/utils';
import type { Event, Post } from '@/types';

export default function DashboardPage() {
  const { currentFamily, createFamily } = useFamilyStore();
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [familyName, setFamilyName] = useState('');

  useEffect(() => {
    if (!currentFamily) return;
    eventsApi.upcoming(currentFamily.id).then(setEvents).catch(() => {});
    feedApi.getPosts(currentFamily.id).then((r) => setPosts(r.data)).catch(() => {});
    pollsApi.list(currentFamily.id).then(setPolls).catch(() => {});
  }, [currentFamily?.id]);

  const submitPost = async () => {
    if (!postContent.trim() || !currentFamily) return;
    setPosting(true);
    try {
      const post = await feedApi.createPost(currentFamily.id, postContent.trim());
      setPosts((p) => [post, ...p]);
      setPostContent('');
    } finally {
      setPosting(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center">
          <GitBranch className="w-8 h-8 text-brand-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">No family yet</h2>
        <p className="text-gray-500 text-center max-w-sm">
          Create your first family group to get started connecting with your loved ones.
        </p>
        <Button onClick={() => setShowCreateFamily(true)}>
          <Plus className="w-4 h-4" /> Create a Family
        </Button>
        <Modal open={showCreateFamily} onClose={() => setShowCreateFamily(false)} title="Create a Family">
          <div className="space-y-4">
            <Input
              label="Family Name"
              placeholder="e.g. The Johnson Family"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={async () => {
                if (!familyName.trim()) return;
                await createFamily(familyName.trim());
                setShowCreateFamily(false);
              }}
            >
              Create
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  const stats = [
    { label: 'Members', value: currentFamily.members?.length ?? '—', icon: Users, href: '/members', color: 'bg-blue-100 text-blue-600' },
    { label: 'Upcoming Events', value: events.length, icon: Calendar, href: '/events', color: 'bg-purple-100 text-purple-600' },
    { label: 'Active Polls', value: polls.length, icon: BarChart2, href: '/polls', color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          Welcome back, {user?.firstName}! 👋
        </h2>
        <p className="text-brand-100">{currentFamily.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post composer */}
          <Card>
            <div className="flex items-start gap-3">
              {user && <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="sm" />}
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share something with your family..."
                  rows={3}
                  className="w-full resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={submitPost} loading={posting} disabled={!postContent.trim()}>
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={post.author?.avatarUrl} firstName={post.author?.firstName ?? ''} lastName={post.author?.lastName ?? ''} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {post.author?.firstName} {post.author?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
                </div>
              </div>
              <p className="text-gray-800 text-sm">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{post.likes?.length ?? 0} likes</span>
                <span>{post.comments?.length ?? 0} comments</span>
              </div>
            </Card>
          ))}

          {posts.length === 0 && (
            <Card>
              <p className="text-center text-gray-400 py-8">No posts yet. Be the first to share!</p>
            </Card>
          )}
        </div>

        {/* Sidebar: Upcoming events */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <Link href="/events" className="text-xs text-brand-600 hover:underline">View all</Link>
            </CardHeader>
            <div className="space-y-3">
              {events.slice(0, 4).map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-700">
                      {formatDate(event.startDate, 'dd')}
                    </span>
                    <span className="text-[10px] text-purple-500 uppercase">
                      {formatDate(event.startDate, 'MMM')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    {event.location && (
                      <p className="text-xs text-gray-500 truncate">{event.location}</p>
                    )}
                  </div>
                </Link>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming events</p>
              )}
            </div>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader><CardTitle>Quick Access</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/tree', label: 'Family Tree', icon: GitBranch },
                { href: '/chat', label: 'Chat', icon: MessageCircle },
                { href: '/polls', label: 'Polls', icon: BarChart2 },
                { href: '/contributions', label: 'Contributions', icon: Wallet },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-center"
                >
                  <Icon className="w-5 h-5 text-brand-500" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
