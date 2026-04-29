'use client';

import { useEffect, useState } from 'react';
import { Settings, Users, Calendar, BarChart2, Wallet, Trash2, ShieldCheck } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { useAuthStore } from '@/store/auth.store';
import { familiesApi, eventsApi, pollsApi, contributionsApi } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { FamilyMember } from '@/types';

export default function AdminPage() {
  const { currentFamily } = useFamilyStore();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [stats, setStats] = useState({ events: 0, polls: 0, contributions: 0 });
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!currentFamily) return;
    setLoading(true);
    Promise.all([
      familiesApi.members(currentFamily.id),
      eventsApi.list(currentFamily.id),
      pollsApi.list(currentFamily.id),
      contributionsApi.list(currentFamily.id),
    ]).then(([m, e, p, c]) => {
      setMembers(m);
      setStats({ events: e.length, polls: p.length, contributions: c.length });
    }).finally(() => setLoading(false));
  }, [currentFamily?.id]);

  const removeMember = async (targetId: string) => {
    if (!currentFamily || targetId === user?.id) return;
    setRemoving(targetId);
    try {
      await familiesApi.removeMember(currentFamily.id, targetId);
      setMembers((m) => m.filter((mem) => mem.userId !== targetId));
    } finally {
      setRemoving(null);
    }
  };

  const isAdmin = members.find((m) => m.userId === user?.id)?.role === 'admin';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        {isAdmin && <Badge variant="info"><ShieldCheck className="w-3 h-3 mr-1 inline" /> Admin</Badge>}
      </div>

      {/* Family info */}
      {currentFamily && (
        <Card>
          <CardHeader><CardTitle>Family Details</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{currentFamily.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Family ID</p>
              <p className="font-mono text-xs text-gray-600 break-all">{currentFamily.id}</p>
            </div>
            {currentFamily.description && (
              <div className="col-span-2">
                <p className="text-gray-500">Description</p>
                <p className="font-medium text-gray-900">{currentFamily.description}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Members', value: members.length, icon: Users, color: 'text-blue-600 bg-blue-100' },
          { label: 'Events', value: stats.events, icon: Calendar, color: 'text-purple-600 bg-purple-100' },
          { label: 'Polls', value: stats.polls, icon: BarChart2, color: 'text-green-600 bg-green-100' },
          { label: 'Collections', value: stats.contributions, icon: Wallet, color: 'text-orange-600 bg-orange-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} padding="sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{loading ? '—' : value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Member management */}
      <Card>
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <Avatar
                  src={member.user?.avatarUrl}
                  firstName={member.user?.firstName ?? ''}
                  lastName={member.user?.lastName ?? ''}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {member.user?.firstName} {member.user?.lastName}
                    </span>
                    {member.role === 'admin' && <Badge variant="info">Admin</Badge>}
                    {member.userId === user?.id && <Badge variant="default">You</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{member.user?.email}</p>
                </div>
                {isAdmin && member.userId !== user?.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMember(member.userId)}
                    loading={removing === member.userId}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
