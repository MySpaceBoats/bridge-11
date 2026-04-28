'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { Message, ChatGroup } from '@/types';
import { chatApi } from '@/lib/api';
import { getChatSocket, connectChatSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  group: ChatGroup;
  familyId: string;
}

export function ChatWindow({ group, familyId }: ChatWindowProps) {
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages, typingUsers } = useChatStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const groupMessages = messages[group.id] ?? [];

  useEffect(() => {
    chatApi.getMessages(familyId, group.id).then((res) => {
      setMessages(group.id, res.data);
    });

    const socket = getChatSocket();
    connectChatSocket();
    socket.emit('join_group', { groupId: group.id });

    socket.on('new_message', (msg: Message) => {
      if (msg.groupId === group.id) addMessage(group.id, msg);
    });

    return () => {
      socket.off('new_message');
      socket.emit('leave_group', { groupId: group.id });
    };
  }, [group.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');
    try {
      const socket = getChatSocket();
      socket.emit('send_message', { groupId: group.id, content });
    } finally {
      setSending(false);
    }
  };

  const typing = typingUsers[group.id]?.filter((id) => id !== user?.id) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900">{group.name}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {groupMessages.map((msg) => {
          const isMe = msg.sender?.id === user?.id;
          return (
            <div key={msg.id} className={cn('flex items-end gap-2', isMe && 'flex-row-reverse')}>
              {!isMe && (
                <Avatar src={msg.sender?.avatarUrl} firstName={msg.sender?.firstName ?? ''} lastName={msg.sender?.lastName ?? ''} size="xs" />
              )}
              <div className={cn('max-w-[70%] space-y-0.5', isMe && 'items-end flex flex-col')}>
                {!isMe && (
                  <p className="text-xs text-gray-500 px-1">
                    {msg.sender?.firstName} {msg.sender?.lastName}
                  </p>
                )}
                <div
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm',
                    isMe
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm',
                  )}
                >
                  {msg.content}
                </div>
                <p className="text-xs text-gray-400 px-1">{timeAgo(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        {typing.length > 0 && (
          <p className="text-xs text-gray-400 italic px-2">Someone is typing...</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="w-9 h-9 bg-brand-500 text-white rounded-full flex items-center justify-center hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
