'use client';

import { useEffect, useState } from 'react';
import { Users, UserPlus, Search } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { useAuthStore } from '@/store/auth.store';
import { familiesApi, usersApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { FamilyMember, User } from '@/types';

export default function MembersPage() {
  const { currentFamily } = useFamilyStore();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  const load = async () => {
    if (!currentFamily) return;
    setLoading(true);
    try {
      setMembers(await familiesApi.members(currentFamily.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentFamily?.id]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      setSearchResults(await usersApi.search(searchQuery));
    } finally {
      setSearching(false);
    }
  };

  const invite = async (userId: string) => {
    if (!currentFamily) return;
    setInviting(userId);
    try {
      await familiesApi.invite(currentFamily.id, userId);
      await load();
      setSearchResults((r) => r.filter((u) => u.id !== userId));
    } finally {
      setInviting(null);
    }
  };

  const memberIds = new Set(members.map((m) => m.userId));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <Badge variant="info">{members.length}</Badge>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="flex items-center gap-4">
              <Avatar
                src={member.user?.avatarUrl}
                firstName={member.user?.firstName ?? ''}
                lastName={member.user?.lastName ?? ''}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">
                    {member.user?.firstName} {member.user?.lastName}
                  </p>
                  {member.role === 'admin' && <Badge variant="info">Admin</Badge>}
                  {member.userId === user?.id && <Badge variant="default">You</Badge>}
                </div>
                <p className="text-sm text-gray-500 truncate">{member.user?.email}</p>
                {member.user?.bio && (
                  <p className="text-xs text-gray-400 truncate mt-1">{member.user.bio}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite a Member">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} loading={searching} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                <Avatar src={u.avatarUrl} firstName={u.firstName} lastName={u.lastName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                {memberIds.has(u.id) ? (
                  <Badge variant="success">Already member</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => invite(u.id)}
                    loading={inviting === u.id}
                  >
                    Invite
                  </Button>
                )}
              </div>
            ))}
            {searchResults.length === 0 && searchQuery && !searching && (
              <p className="text-sm text-gray-400 text-center py-4">No users found</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
