'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { useFamilyStore } from '@/store/family.store';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { chatApi } from '@/lib/api';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { ChatGroup } from '@/types';

export default function ChatPage() {
  const { currentFamily } = useFamilyStore();
  const { user } = useAuthStore();
  const { groups, setGroups, activeGroupId, setActiveGroup } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentFamily) return;
    setLoading(true);
    chatApi.getGroups(currentFamily.id)
      .then((data) => {
        setGroups(data);
        if (data.length > 0 && !activeGroupId) setActiveGroup(data[0].id);
      })
      .finally(() => setLoading(false));
  }, [currentFamily?.id]);

  const createGroup = async () => {
    if (!groupName.trim() || !currentFamily) return;
    setCreating(true);
    try {
      const group = await chatApi.createGroup(currentFamily.id, { name: groupName.trim(), type: 'branch' });
      setGroups([...groups, group]);
      setActiveGroup(group.id);
      setGroupName('');
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Groups sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Groups</span>
          <button
            onClick={() => setShowCreate(true)}
            className="w-7 h-7 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="space-y-2 px-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-6 px-4">No groups yet</p>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors',
                  activeGroupId === group.id && 'bg-brand-50 text-brand-700 font-medium',
                )}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                </div>
                <span className="truncate">{group.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        {activeGroup && currentFamily ? (
          <ChatWindow group={activeGroup} familyId={currentFamily.id} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">Select a group to start chatting</p>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Chat Group">
        <div className="space-y-4">
          <Input
            label="Group Name"
            placeholder="e.g. South Branch, Parents, etc."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createGroup()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createGroup} loading={creating}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
